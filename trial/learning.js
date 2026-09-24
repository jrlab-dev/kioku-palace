import {FIRST_ROUTE,ITEMS} from './route.js';

export const ASSOCIATIONS={
  parking:'牛乳が大きく膨らみ、車止めに乗り上げる。',
  guideChoices:['りんごが木の枠をころころ転がる。','大きなりんごが案内板の枠にはまる。'],
  toriiExample:'大きなかぎが赤い柱にぶら下がって、ゆらゆら揺れる。'
};

export function freshSession(){return {stage:'preview',index:0,associations:{},outcomes:[],homeOutcomes:[],routeOrder:[],choiceMode:false,assistedUsed:false,answerShown:false,reviewId:'',reviewStep:0,updatedAt:new Date().toISOString()};}
// choiceMode is only the open/closed UI. assistedUsed is evidence and stays true
// until this question receives its exclusive outcome.
export function stableSession(session){return {...session,choiceMode:false,answerShown:false,updatedAt:new Date().toISOString()};}
export function currentPair(index){return {point:FIRST_ROUTE[index],item:ITEMS[index]};}
export function outcomeCounts(outcomes=[]){return {
  selfReported:outcomes.filter(v=>v.outcome==='selfReported').length,
  choiceAssisted:outcomes.filter(v=>v.outcome==='choiceAssisted').length,
  forgotten:outcomes.filter(v=>v.outcome==='forgotten').length
};}
export function recordOutcome(outcomes,row){return [...outcomes.filter(v=>v.placeId!==row.placeId),row].slice(0,3);}
export function validateHomeNames(values){
  const names=values.map(v=>String(v??'').trim());
  if(names.some(v=>!v))return {ok:false,message:'3つすべてに、場所の名前を入れてください。'};
  if(names.some(v=>v.length>24))return {ok:false,message:'場所の名前は24文字以内にしてください。'};
  if(new Set(names).size<3)return {ok:false,message:'3つは違う場所にしてください。'};
  return {ok:true,names};
}
export function checkRoutePick(order,pick){
  const expected=FIRST_ROUTE[order.length]?.id;
  if(pick!==expected)return {ok:false,expected};
  const next=[...order,pick];return {ok:true,complete:next.length===FIRST_ROUTE.length,order:next};
}
