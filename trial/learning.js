import {ROUTE} from './route.js?v=mountain15-20260926-b5';
export const EXAMPLES=Object.freeze({
 parking:'牛乳が大きくふくらみ、車止めに乗り上げる。',guide:'りんごが案内板の枠を転がる。',torii:'大きな鍵が赤い柱で揺れる。',trailhead:'黄色い傘が太い根に引っかかる。',
 'log-steps':'赤い長靴が丸太を一段ずつ跳ねる。','stream-bridge':'金色のベルが欄干で鳴る。','rest-area':'焼きたてのパンがベンチに並ぶ。','stone-lantern':'大時計が灯籠の窓にはまる。',
 lookout:'双眼鏡で谷をのぞくと景色が大きく迫る。','long-stairs':'ボールが石段を勢いよく跳ねる。',temizuya:'歯ブラシが水盤を大きく磨く。',komainu:'狛犬が帽子をかぶって首を振る。',
 'sacred-tree':'赤いリボンがご神木を一周する。',offertory:'手紙が賽銭箱からあふれる。','summit-bell':'星が大鈴の上で強く光る。'
});
export function pair(index){return {point:ROUTE[index],item:ROUTE[index]?.item};}
export function routeProgress(z){let best=0;for(let i=0;i<ROUTE.length;i++)if(z<=-ROUTE[i].pathY)best=i;return best;}
export function counts(rows=[]){return {selfReported:rows.filter(v=>v.outcome==='selfReported').length,choiceAssisted:rows.filter(v=>v.outcome==='choiceAssisted').length,forgotten:rows.filter(v=>v.outcome==='forgotten').length};}
export function recallChoices(index){const pool=[0,5,10].map(offset=>ROUTE[(index+offset)%15].item),shift=index%2+1;return [...pool.slice(shift),...pool.slice(0,shift)];}
