import {ROUTE} from './route.js?v=mountain15-20260926-b5';
export const STORAGE_KEY='palace_mountain_v2';
export const LEGACY_KEYS=['palace_learning_v1','palace_srs'];
export const REVIEW_INTERVALS=[1,3,7,14,30,60];
const PHASES=new Set(['travel-learn','arrived-learn','summit','travel-recall','arrived-recall','result']);
const OUTCOMES=new Set(['selfReported','choiceAssisted','forgotten']);
const byPlace=new Map(ROUTE.map(p=>[p.id,p]));
export function localDate(value=new Date()){const d=value instanceof Date?value:new Date(value);if(Number.isNaN(d.getTime()))return null;return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function addCalendarDays(text,days){if(!/^\d{4}-\d{2}-\d{2}$/.test(text)||!Number.isInteger(days))return null;const [y,m,d]=text.split('-').map(Number),date=new Date(y,m-1,d,12);if(date.getFullYear()!==y||date.getMonth()!==m-1||date.getDate()!==d)return null;date.setDate(date.getDate()+days);return localDate(date);}
const text=(v,n=140)=>typeof v==='string'?v.trim().slice(0,n):'';
function cleanOutcome(v){const p=byPlace.get(v?.placeId);return p&&p.item.id===v.itemId&&OUTCOMES.has(v.outcome)?{placeId:p.id,itemId:p.item.id,outcome:v.outcome}:null;}
export function cleanOutcomes(rows){const map=new Map();for(const row of Array.isArray(rows)?rows:[]){const v=cleanOutcome(row);if(v)map.set(v.placeId,v);}return ROUTE.map(p=>map.get(p.id)).filter(Boolean);}
export function freshSession(mode='learn'){return {phase:mode==='review'?'travel-recall':'travel-learn',mode,index:0,position:{x:0,z:5,yaw:0,pitch:0},associations:{},outcomes:[],choiceUsed:false,answerShown:false,reviewId:'',updatedAt:new Date().toISOString()};}
export function defaults(){return {schemaVersion:2,prefs:{sound:false,reduced:null},session:null,associations:{},lastResult:null,reviews:[]};}
export function sanitizeData(raw){
 const out=defaults();if(!raw||raw.schemaVersion!==2)return out;out.prefs={sound:raw.prefs?.sound===true,reduced:typeof raw.prefs?.reduced==='boolean'?raw.prefs.reduced:null};
 for(const p of ROUTE){const v=text(raw.associations?.[p.id]);if(v)out.associations[p.id]=v;}
 if(raw.session&&PHASES.has(raw.session.phase)){const s=raw.session,index=Number.isInteger(s.index)?Math.max(0,Math.min(14,s.index)):0,pos=s.position||{};out.session={phase:s.phase,mode:s.mode==='review'?'review':'learn',index,position:{x:Number.isFinite(pos.x)?Math.max(-2,Math.min(2,pos.x)):0,z:Number.isFinite(pos.z)?Math.max(-112,Math.min(7,pos.z)):5,yaw:Number.isFinite(pos.yaw)?pos.yaw:0,pitch:Number.isFinite(pos.pitch)?Math.max(-.8,Math.min(.8,pos.pitch)):0},associations:{...out.associations},outcomes:cleanOutcomes(s.outcomes),choiceUsed:s.choiceUsed===true,answerShown:s.answerShown===true,reviewId:text(s.reviewId,100),updatedAt:text(s.updatedAt,40)};for(const p of ROUTE){const v=text(s.associations?.[p.id]);if(v)out.session.associations[p.id]=v;}}
 const result=raw.lastResult;if(result){const outcomes=cleanOutcomes(result.outcomes);if(outcomes.length)out.lastResult={outcomes,completedAt:text(result.completedAt,40)};}
 out.reviews=Array.isArray(raw.reviews)?raw.reviews.map(r=>{if(!r||addCalendarDays(r.dueDate||'',0)!==r.dueDate)return null;return {id:text(r.id,100),dueDate:r.dueDate,step:Number.isInteger(r.step)?Math.max(0,Math.min(5,r.step)):0,outcomes:cleanOutcomes(r.outcomes),createdAt:text(r.createdAt,40)};}).filter(r=>r?.id).slice(-10):[];return out;
}
export function loadFrom(storage){try{const raw=storage.getItem(STORAGE_KEY);return {data:sanitizeData(raw?JSON.parse(raw):null),ok:true,hasLegacy:LEGACY_KEYS.some(k=>storage.getItem(k)!==null),warning:''};}catch{return {data:defaults(),ok:false,hasLegacy:false,warning:'保存データを読み込めませんでした。新しい状態で続けます。'};}}
export function saveTo(storage,data){try{storage.setItem(STORAGE_KEY,JSON.stringify(sanitizeData({...data,schemaVersion:2})));return {ok:true,warning:''};}catch{return {ok:false,warning:'このブラウザには保存できません。画面を閉じると進みは残りません。'};}}
export function recordOutcome(rows,row){return cleanOutcomes([...(rows||[]).filter(v=>v.placeId!==row.placeId),row]);}
export function makeReview(result,today=localDate()){const stamp=result?.completedAt||new Date().toISOString();return {id:`mountain:${stamp}`,dueDate:addCalendarDays(today,1),step:0,outcomes:cleanOutcomes(result?.outcomes),createdAt:stamp};}
export function upsertReview(rows,review){return [...(rows||[]).filter(r=>r.id!==review.id),review].slice(-10);}
export function rescheduleReview(review,outcomes,today=localDate()){const clean=cleanOutcomes(outcomes),allSelf=clean.length===15&&clean.every(v=>v.outcome==='selfReported'),old=Number.isInteger(review?.step)?review.step:0,step=allSelf?Math.min(5,old+1):old;return {...review,outcomes:clean,step,dueDate:addCalendarDays(today,allSelf?REVIEW_INTERVALS[step]:1)};}
