export const SET_FIRST='shrine-first3';
export const SET_TRAIL='shrine-trail3';

export const ROUTE=Object.freeze([
  {id:'parking',order:1,label:'駐車場',cue:'広い足元と、低い車止め。',elevation:0.15,scene:{position:[0,.15,2.5],itemPosition:[-2.2,.54,1.95]},camera:{position:[.25,2.30,7.2],target:[0,.55,2.2]},implemented:true},
  {id:'guide',order:2,label:'案内板',cue:'木の枠と、山へ続く道。',elevation:.67,scene:{position:[2.35,.67,-4],itemPosition:[2.35,1.91,-3.66]},camera:{position:[.25,2.82,.1],target:[2.25,1.8,-4]},implemented:true},
  {id:'torii',order:3,label:'鳥居',cue:'赤い柱。ここから森の参道へ。',elevation:1.18,scene:{position:[0,1.18,-10.4],itemPosition:[2.28,3.06,-10.06]},camera:{position:[.1,3.33,-5.45],target:[0,3.35,-10.4]},implemented:true},
  {id:'trailhead',order:4,label:'山道の入口',cue:'石畳が終わり、太い根をまたぐ土の道。',elevation:2.13,scene:{position:[0,2.13,-16],itemPosition:[-1.60,2.45,-15.60]},camera:{position:[.15,4.82,-11.80],target:[-1.60,2.43,-15.60]},implemented:true},
  {id:'log-steps',order:5,label:'丸太の階段',cue:'丸太の段が、一段ずつ山へ続く。',elevation:3.93,scene:{position:[0,3.93,-26],itemPosition:[1.05,4.48,-26.2]},camera:{position:[-.1,6.05,-20.2],target:[.25,4.35,-26]},implemented:true},
  {id:'stream-bridge',order:6,label:'沢の橋',cue:'岩の間の水と、赤い欄干の木の橋。',elevation:5.55,scene:{position:[0,5.55,-35],itemPosition:[1.42,7.05,-34.2]},camera:{position:[.2,7.78,-29.3],target:[.25,6.35,-35]},implemented:true},
  {id:'rest-area',order:7,label:'休憩所',elevation:8.40,scene:{position:[0,8.40,-43]},camera:{position:[0,10,-38],target:[0,9,-43]},implemented:false},
  {id:'stone-lantern',order:8,label:'石灯籠',elevation:10.60,scene:{position:[0,10.60,-51]},camera:{position:[0,12,-46],target:[0,11,-51]},implemented:false},
  {id:'lookout',order:9,label:'見晴らし台',elevation:13.20,scene:{position:[0,13.20,-59]},camera:{position:[0,15,-54],target:[0,14,-59]},implemented:false},
  {id:'long-stairs',order:10,label:'長い石段',elevation:15.40,scene:{position:[0,15.40,-68]},camera:{position:[0,17,-63],target:[0,16,-68]},implemented:false},
  {id:'temizuya',order:11,label:'手水舎',elevation:20.80,scene:{position:[0,20.80,-77]},camera:{position:[0,22,-72],target:[0,21,-77]},implemented:false},
  {id:'komainu',order:12,label:'狛犬',elevation:22.20,scene:{position:[0,22.20,-85]},camera:{position:[0,24,-80],target:[0,23,-85]},implemented:false},
  {id:'sacred-tree',order:13,label:'ご神木',elevation:22.70,scene:{position:[0,22.70,-93]},camera:{position:[0,24,-88],target:[0,23,-93]},implemented:false},
  {id:'offertory',order:14,label:'賽銭箱',elevation:23.00,scene:{position:[0,23,-102]},camera:{position:[0,25,-97],target:[0,24,-102]},implemented:false},
  {id:'bell',order:15,label:'鈴',elevation:23.00,scene:{position:[0,23,-110]},camera:{position:[0,25,-105],target:[0,24,-110]},implemented:false}
]);

export const ITEMS=Object.freeze([
  {id:'milk',label:'ぎゅうにゅう',model:'ItemMilk',placeId:'parking',baseScale:1.45},
  {id:'apple',label:'りんご',model:'ItemApple',placeId:'guide',baseScale:1.8},
  {id:'key',label:'かぎ',model:'ItemKey',placeId:'torii',baseScale:2.15},
  {id:'umbrella',label:'黄色いかさ',model:'ItemUmbrella',placeId:'trailhead',baseScale:1.65},
  {id:'boots',label:'赤いながぐつ',model:'ItemBoots',placeId:'log-steps',baseScale:1.55},
  {id:'bell',label:'金色のベル',model:'ItemBell',placeId:'stream-bridge',baseScale:1.9}
]);

export const COURSES=Object.freeze({
  [SET_FIRST]:Object.freeze({id:SET_FIRST,label:'神社の入口3地点',shortLabel:'入口の3地点',description:'駐車場から鳥居まで',pointIds:['parking','guide','torii'],itemIds:['milk','apple','key']}),
  [SET_TRAIL]:Object.freeze({id:SET_TRAIL,label:'鳥居の先・山道3地点',shortLabel:'山道の3地点',description:'太い根から沢の橋まで',pointIds:['trailhead','log-steps','stream-bridge'],itemIds:['umbrella','boots','bell']})
});
export const SET_IDS=Object.freeze(Object.keys(COURSES));
export const IMPLEMENTED_ROUTE=Object.freeze(ROUTE.filter(point=>point.implemented));
export function getPoint(id){return ROUTE.find(point=>point.id===id)||null;}
export function getItem(id){return ITEMS.find(item=>item.id===id)||null;}
export function getCourse(setId=SET_FIRST){return COURSES[setId]||COURSES[SET_FIRST];}
export function coursePoints(setId){return getCourse(setId).pointIds.map(getPoint);}
export function courseItems(setId){return getCourse(setId).itemIds.map(getItem);}
