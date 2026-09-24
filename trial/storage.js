export const STORAGE_KEY='palace_learning_v1';
export const SCHEMA_VERSION=1;
export const REVIEW_INTERVALS=[1,3,7,14,30,60];
const PLACE_IDS=new Set(['parking','guide','torii']);
const ITEM_IDS=new Set(['milk','apple','key']);
const STAGES=new Set(['preview','routeCheck','associate','recall','result','homeSetup','homeAssociate','homeRecall','homeResult']);
const OUTCOMES=new Set(['selfReported','choiceAssisted','forgotten']);

export function localDate(value=new Date()){
  const date=value instanceof Date?value:new Date(value);
  if(Number.isNaN(date.getTime()))return null;
  const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
export function addCalendarDays(dateText,days){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dateText)||!Number.isInteger(days))return null;
  const [y,m,d]=dateText.split('-').map(Number),date=new Date(y,m-1,d,12);
  if(date.getFullYear()!==y||date.getMonth()!==m-1||date.getDate()!==d)return null;
  date.setDate(date.getDate()+days);return localDate(date);
}

function cleanText(value,max=80){return typeof value==='string'?value.trim().slice(0,max):'';}
function cleanOutcome(row){
  if(!row||!PLACE_IDS.has(row.placeId)||!ITEM_IDS.has(row.itemId)||!OUTCOMES.has(row.outcome))return null;
  const expected={parking:'milk',guide:'apple',torii:'key'}[row.placeId];if(row.itemId!==expected)return null;
  return {placeId:row.placeId,itemId:row.itemId,outcome:row.outcome};
}
function cleanOutcomeList(rows){
  const used=new Set(),out=[];for(const row of Array.isArray(rows)?rows:[]){const clean=cleanOutcome(row);if(clean&&!used.has(clean.placeId)){used.add(clean.placeId);out.push(clean);}if(out.length===3)break;}return out;
}
function cleanSession(raw){
  if(!raw||typeof raw!=='object'||!STAGES.has(raw.stage))return null;
  const index=Number.isInteger(raw.index)?Math.max(0,Math.min(2,raw.index)):0;
  const associations={};
  for(const id of PLACE_IDS){const value=cleanText(raw.associations?.[id],120);if(value)associations[id]=value;}
  const outcomes=cleanOutcomeList(raw.outcomes);
  const routeOrder=[];for(const id of Array.isArray(raw.routeOrder)?raw.routeOrder:[]){if(id===['parking','guide','torii'][routeOrder.length])routeOrder.push(id);else break;}
  const homeOutcomes=Array.isArray(raw.homeOutcomes)?raw.homeOutcomes.filter(v=>v==='selfReported'||v==='forgotten').slice(0,3):[];
  return {stage:raw.stage,index,associations,outcomes,homeOutcomes,routeOrder,choiceMode:raw.choiceMode===true,assistedUsed:raw.assistedUsed===true,answerShown:raw.answerShown===true,reviewId:cleanText(raw.reviewId,80),reviewStep:Number.isInteger(raw.reviewStep)?Math.max(0,Math.min(5,raw.reviewStep)):0,updatedAt:cleanText(raw.updatedAt,40)};
}
function cleanReview(row){
  if(!row||typeof row!=='object'||addCalendarDays(row.dueDate||'',0)!==row.dueDate)return null;
  const outcomes=cleanOutcomeList(row.outcomes);
  return {id:cleanText(row.id,80),setId:'shrine-first3',dueDate:row.dueDate,step:Number.isInteger(row.step)?Math.max(0,Math.min(5,row.step)):0,outcomes,createdAt:cleanText(row.createdAt,40)};
}
export function defaults(){return {schemaVersion:SCHEMA_VERSION,prefs:{sound:false,reduced:null},session:null,associations:{},lastResult:null,reviews:[],homeNames:[],lastHomeResult:null};}
export function sanitizeData(raw){
  const out=defaults();if(!raw||typeof raw!=='object'||raw.schemaVersion!==SCHEMA_VERSION)return out;
  out.prefs={sound:raw.prefs?.sound===true,reduced:typeof raw.prefs?.reduced==='boolean'?raw.prefs.reduced:null};
  out.session=cleanSession(raw.session);
  for(const id of PLACE_IDS){const value=cleanText(raw.associations?.[id],120);if(value)out.associations[id]=value;}
  if(raw.lastResult&&typeof raw.lastResult==='object'){
    const outcomes=cleanOutcomeList(raw.lastResult.outcomes);
    if(outcomes.length)out.lastResult={outcomes,completedAt:cleanText(raw.lastResult.completedAt,40)};
  }
  out.reviews=Array.isArray(raw.reviews)?raw.reviews.map(cleanReview).filter(Boolean).slice(-20):[];
  const names=Array.isArray(raw.homeNames)?raw.homeNames.map(v=>cleanText(v,24)).filter(Boolean).slice(0,3):[];
  if(new Set(names).size===names.length)out.homeNames=names;
  if(raw.lastHomeResult&&typeof raw.lastHomeResult==='object')out.lastHomeResult={outcomes:Array.isArray(raw.lastHomeResult.outcomes)?raw.lastHomeResult.outcomes.filter(v=>v==='selfReported'||v==='forgotten').slice(0,3):[],completedAt:cleanText(raw.lastHomeResult.completedAt,40)};
  if(out.session?.stage.startsWith('home')&&out.homeNames.length!==3)out.session={...out.session,stage:'homeSetup',index:0,homeOutcomes:[],answerShown:false};
  return out;
}

export function loadFrom(storage){
  try{const text=storage.getItem(STORAGE_KEY);return {data:sanitizeData(text?JSON.parse(text):null),ok:true,warning:''};}
  catch{return {data:defaults(),ok:false,warning:'保存データを読み込めなかったため、新しい状態で始めます。'};}
}
export function saveTo(storage,data){
  try{storage.setItem(STORAGE_KEY,JSON.stringify(sanitizeData({...data,schemaVersion:SCHEMA_VERSION})));return {ok:true,warning:''};}
  catch{return {ok:false,warning:'このブラウザには保存できません。今回の体験はそのまま続けられます。'};}
}
export function makeReview(result,today=localDate()){
  const outcomes=cleanOutcomeList(result?.outcomes);
  const id=`shrine-first3:${result?.completedAt||today}`;
  return {id,setId:'shrine-first3',dueDate:addCalendarDays(today,1),step:0,outcomes,createdAt:result?.completedAt||new Date().toISOString()};
}
export function upsertReview(reviews,review){
  const rows=Array.isArray(reviews)?reviews.filter(row=>row?.id!==review.id):[];return [...rows,review].slice(-20);
}
export function rescheduleReview(review,outcomes,today=localDate()){
  const clean=cleanOutcomeList(outcomes),allSelf=clean.length===3&&clean.every(row=>row.outcome==='selfReported');
  const step=allSelf?Math.min(5,(Number.isInteger(review?.step)?review.step:0)+1):(Number.isInteger(review?.step)?Math.max(0,Math.min(5,review.step)):0);
  const days=allSelf?REVIEW_INTERVALS[step]:1;
  return {...review,outcomes:clean,step,dueDate:addCalendarDays(today,days),completedAt:new Date().toISOString()};
}
