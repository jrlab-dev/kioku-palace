import {ROUTE} from './route.js?v=mountain15-20260926-assoc3';
export const EXAMPLES=Object.freeze({
 parking:'牛乳がふくらみながら車止めへ乗り上げる。',guide:'りんごが案内板の枠を転がる。',torii:'鍵が赤い柱でぶらぶら揺れる。',trailhead:'黄色い傘が太い根に引っかかる。',
 'log-steps':'赤い長靴が丸太を一段ずつ跳ねる。','stream-bridge':'金色のベルが欄干で揺れて鳴る。','rest-area':'パンがベンチの上へふわりと上がる。','stone-lantern':'時計が灯籠の横でくるりと回る。',
 lookout:'双眼鏡が見晴らし台でぐっと大きく伸びる。','long-stairs':'ボールが石段を勢いよく跳ねる。',temizuya:'歯ブラシが水盤を左右に磨く。',komainu:'帽子が上から狛犬の頭へ落ちてくる。',
 'sacred-tree':'リボンがご神木の手前を回って結びつく。',offertory:'手紙が賽銭箱から勢いよく飛び出す。','summit-bell':'星が大鈴のそばへ舞い上がって光る。'
});
export const ASSOCIATION_MOTIONS=Object.freeze({
 parking:{mode:'swellRide',from:[1.10,-.18,.95],to:[0,.12,0],scaleFrom:.24,scaleTo:1,duration:1.55},
 guide:{mode:'frameRoll',from:[-1.05,0,0],to:[.55,0,0],scaleFrom:1,scaleTo:1,duration:1.35},
 torii:{mode:'keySwing',from:[0,.65,.08],to:[0,.12,0],scaleFrom:.62,scaleTo:1,duration:1.35},
 trailhead:{mode:'umbrellaHook',from:[.75,-.35,.50],to:[0,0,0],scaleFrom:.42,scaleTo:1,duration:1.40},
 'log-steps':{mode:'bootSteps',from:[-.80,-.25,.60],to:[.22,.08,-.10],scaleFrom:1,scaleTo:1,duration:1.45},
 'stream-bridge':{mode:'bridgeRing',from:[0,-.55,.08],to:[0,.08,0],scaleFrom:.55,scaleTo:1.04,duration:1.35},
 'rest-area':{mode:'breadRise',from:[0,-.55,.32],to:[0,.05,0],scaleFrom:.58,scaleTo:1,duration:1.25},
 'stone-lantern':{mode:'watchFit',from:[0,-.42,.12],to:[0,.12,0],scaleFrom:.38,scaleTo:1,duration:1.35},
 lookout:{mode:'binocularExtend',from:[0,-.18,.58],to:[0,.10,-.15],scaleFrom:.48,scaleTo:1.02,duration:1.30},
 'long-stairs':{mode:'ballBounce',from:[-.65,-.18,.75],to:[.30,.05,-.20],scaleFrom:.88,scaleTo:1,duration:1.50},
 temizuya:{mode:'brushScrub',from:[0,0,0],to:[0,0,0],scaleFrom:1,scaleTo:1,duration:1.35},
 komainu:{mode:'hatDrop',from:[0,1.35,.08],to:[0,.04,0],scaleFrom:.72,scaleTo:1,duration:1.35},
 'sacred-tree':{mode:'ribbonWrap',from:[.65,.20,.25],to:[0,.08,0],scaleFrom:.72,scaleTo:1,duration:1.50},
 offertory:{mode:'letterBurst',from:[0,-.78,.18],to:[0,.20,-.08],scaleFrom:.48,scaleTo:1,duration:1.35},
 'summit-bell':{mode:'starGlow',from:[-.25,-.65,.12],to:[.10,.18,0],scaleFrom:.28,scaleTo:1.05,duration:1.55}
});
export function pair(index){return {point:ROUTE[index],item:ROUTE[index]?.item};}
export function routeProgress(z){let best=0;for(let i=0;i<ROUTE.length;i++)if(z<=-ROUTE[i].pathY)best=i;return best;}
export function counts(rows=[]){return {selfReported:rows.filter(v=>v.outcome==='selfReported').length,choiceAssisted:rows.filter(v=>v.outcome==='choiceAssisted').length,forgotten:rows.filter(v=>v.outcome==='forgotten').length};}
export function recallChoices(index){const pool=[0,5,10].map(offset=>ROUTE[(index+offset)%15].item),shift=index%2+1;return [...pool.slice(shift),...pool.slice(0,shift)];}
