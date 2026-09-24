import {SET_FIRST,SET_IDS,getCourse,coursePoints,courseItems} from './route.js?v=trail6-20260925-final2';

export const STORAGE_KEY='palace_learning_v1';
export const SCHEMA_VERSION=1;
export const REVIEW_INTERVALS=[1,3,7,14,30,60];
const STAGES=new Set(['preview','routeCheck','associate','recall','result','homeSetup','homeAssociate','homeRecall','homeResult']);
const OUTCOMES=new Set(['selfReported','choiceAssisted','forgotten']);

export function localDate(value=new Date()){
  const date=value instanceof Date?value:new Date(value);if(Number.isNaN(date.getTime()))return null;
  const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`;
}
export function addCalendarDays(dateText,days){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dateText)||!Number.isInteger(days))return null;
  const [y,m,d]=dateText.split('-').map(Number),date=new Date(y,m-1,d,12);if(date.getFullYear()!==y||date.getMonth()!==m-1||date.getDate()!==d)return null;
  date.setDate(date.getDate()+days);return localDate(date);
}
function cleanText(value,max=80){return typeof value==='string'?value.trim().slice(0,max):'';}
function cleanSetId(value){return SET_IDS.includes(value)?value:SET_FIRST;}
function cleanAssociations(raw,setId){const out={};for(const point of coursePoints(setId)){const value=cleanText(raw?.[point.id],120);if(value)out[point.id]=value;}return out;}
function cleanOutcome(row,setId){
  const points=coursePoints(setId),items=courseItems(setId),index=points.findIndex(point=>point.id===row?.placeId);
  if(index<0||items[index]?.id!==row?.itemId||!OUTCOMES.has(row?.outcome))return null;
  return {placeId:row.placeId,itemId:row.itemId,outcome:row.outcome};
}
function cleanOutcomeList(rows,setId){
  const used=new Set(),out=[];for(const row of Array.isArray(rows)?rows:[]){const clean=cleanOutcome(row,setId);if(clean&&!used.has(clean.placeId)){used.add(clean.placeId);out.push(clean);}if(out.length===3)break;}return out;
}
function cleanSession(raw){
  if(!raw||typeof raw!=='object'||!STAGES.has(raw.stage))return null;
  const setId=cleanSetId(raw.setId),course=getCourse(setId),index=Number.isInteger(raw.index)?Math.max(0,Math.min(2,raw.index)):0;
  const routeOrder=[];for(const id of Array.isArray(raw.routeOrder)?raw.routeOrder:[]){if(id===course.pointIds[routeOrder.length])routeOrder.push(id);else break;}
  const homeOutcomes=Array.isArray(raw.homeOutcomes)?raw.homeOutcomes.filter(value=>value==='selfReported'||value==='forgotten').slice(0,3):[];
  return {setId,stage:raw.stage,index,associations:cleanAssociations(raw.associations,setId),outcomes:cleanOutcomeList(raw.outcomes,setId),homeOutcomes,routeOrder,choiceMode:raw.choiceMode===true,assistedUsed:raw.assistedUsed===true,answerShown:raw.answerShown===true,reviewId:cleanText(raw.reviewId,80),reviewStep:Number.isInteger(raw.reviewStep)?Math.max(0,Math.min(5,raw.reviewStep)):0,updatedAt:cleanText(raw.updatedAt,40)};
}
function cleanResult(raw,setId){if(!raw||typeof raw!=='object')return null;const outcomes=cleanOutcomeList(raw.outcomes,setId);return outcomes.length?{setId,outcomes,completedAt:cleanText(raw.completedAt,40)}:null;}
function cleanReview(row){
  if(!row||typeof row!=='object'||addCalendarDays(row.dueDate||'',0)!==row.dueDate)return null;
  const setId=cleanSetId(row.setId),id=cleanText(row.id,80);if(!id)return null;
  return {id,setId,dueDate:row.dueDate,step:Number.isInteger(row.step)?Math.max(0,Math.min(5,row.step)):0,outcomes:cleanOutcomeList(row.outcomes,setId),createdAt:cleanText(row.createdAt,40)};
}
export function defaults(){return {schemaVersion:SCHEMA_VERSION,prefs:{sound:false,reduced:null},session:null,associationsBySet:{[SET_FIRST]:{}},lastResults:{},reviews:[],homeNames:[],lastHomeResult:null};}
export function sanitizeData(raw){
  const out=defaults();if(!raw||typeof raw!=='object'||raw.schemaVersion!==SCHEMA_VERSION)return out;
  out.prefs={sound:raw.prefs?.sound===true,reduced:typeof raw.prefs?.reduced==='boolean'?raw.prefs.reduced:null};out.session=cleanSession(raw.session);
  for(const setId of SET_IDS){
    const source=raw.associationsBySet?.[setId]??(setId===SET_FIRST?raw.associations:null);out.associationsBySet[setId]=cleanAssociations(source,setId);
    const result=cleanResult(raw.lastResults?.[setId]??(setId===SET_FIRST?raw.lastResult:null),setId);if(result)out.lastResults[setId]=result;
  }
  out.reviews=Array.isArray(raw.reviews)?raw.reviews.map(cleanReview).filter(Boolean).slice(-40):[];
  const names=Array.isArray(raw.homeNames)?raw.homeNames.map(value=>cleanText(value,24)).filter(Boolean).slice(0,3):[];if(new Set(names).size===names.length)out.homeNames=names;
  if(raw.lastHomeResult&&typeof raw.lastHomeResult==='object')out.lastHomeResult={outcomes:Array.isArray(raw.lastHomeResult.outcomes)?raw.lastHomeResult.outcomes.filter(value=>value==='selfReported'||value==='forgotten').slice(0,3):[],completedAt:cleanText(raw.lastHomeResult.completedAt,40)};
  if(out.session?.stage.startsWith('home')){out.session.setId=SET_FIRST;if(out.homeNames.length!==3)out.session={...out.session,stage:'homeSetup',index:0,homeOutcomes:[],answerShown:false};}
  return out;
}
export function loadFrom(storage){try{const text=storage.getItem(STORAGE_KEY);return {data:sanitizeData(text?JSON.parse(text):null),ok:true,warning:''};}catch{return {data:defaults(),ok:false,warning:'保存データを読み込めなかったため、新しい状態で始めます。'};}}
export function saveTo(storage,data){try{storage.setItem(STORAGE_KEY,JSON.stringify(sanitizeData({...data,schemaVersion:SCHEMA_VERSION})));return {ok:true,warning:''};}catch{return {ok:false,warning:'このブラウザには保存できません。今回の体験はそのまま続けられます。'};}}
export function makeReview(result,setId=SET_FIRST,today=localDate()){
  if(/^\d{4}-\d{2}-\d{2}$/.test(setId)){today=setId;setId=SET_FIRST;}setId=cleanSetId(setId);
  const outcomes=cleanOutcomeList(result?.outcomes,setId),stamp=result?.completedAt||new Date().toISOString();return {id:`${setId}:${stamp}`,setId,dueDate:addCalendarDays(today,1),step:0,outcomes,createdAt:stamp};
}
export function upsertReview(reviews,review){const rows=Array.isArray(reviews)?reviews.filter(row=>row?.id!==review.id):[];return [...rows,review].slice(-40);}
export function rescheduleReview(review,outcomes,today=localDate()){
  const setId=cleanSetId(review?.setId),clean=cleanOutcomeList(outcomes,setId),allSelf=clean.length===3&&clean.every(row=>row.outcome==='selfReported');
  const oldStep=Number.isInteger(review?.step)?Math.max(0,Math.min(5,review.step)):0,step=allSelf?Math.min(5,oldStep+1):oldStep,days=allSelf?REVIEW_INTERVALS[step]:1;
  return {...review,setId,outcomes:clean,step,dueDate:addCalendarDays(today,days),completedAt:new Date().toISOString()};
}
