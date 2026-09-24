export const ROUTE = Object.freeze([
  {id:'parking',order:1,label:'駐車場',elevation:0.15,scene:{position:[0,0.15,2.5],itemPosition:[-2.2,0.54,1.95]},camera:{position:[0.25,2.30,7.2],target:[0,0.55,2.2]},implemented:true},
  {id:'guide',order:2,label:'案内板',elevation:0.67,scene:{position:[2.35,0.67,-4.0],itemPosition:[2.35,1.91,-3.66]},camera:{position:[0.25,2.82,0.1],target:[2.25,1.80,-4.0]},implemented:true},
  {id:'torii',order:3,label:'鳥居',elevation:1.18,scene:{position:[0,1.18,-10.4],itemPosition:[2.28,3.06,-10.06]},camera:{position:[0.10,3.33,-5.45],target:[0,3.35,-10.4]},implemented:true},
  {id:'trailhead',order:4,label:'山道の入口',elevation:2.20,scene:{position:[0,2.20,-16]},camera:{position:[0,3.8,-11],target:[0,2.8,-16]},implemented:false},
  {id:'log-steps',order:5,label:'丸太の階段',elevation:4.40,scene:{position:[0,4.40,-23]},camera:{position:[0,6,-18],target:[0,5,-23]},implemented:false},
  {id:'stream-bridge',order:6,label:'沢の橋',elevation:6.40,scene:{position:[0,6.40,-31]},camera:{position:[0,8,-26],target:[0,7,-31]},implemented:false},
  {id:'rest-area',order:7,label:'休憩所',elevation:8.40,scene:{position:[0,8.40,-39]},camera:{position:[0,10,-34],target:[0,9,-39]},implemented:false},
  {id:'stone-lantern',order:8,label:'石灯籠',elevation:10.60,scene:{position:[0,10.60,-47]},camera:{position:[0,12,-42],target:[0,11,-47]},implemented:false},
  {id:'lookout',order:9,label:'見晴らし台',elevation:13.20,scene:{position:[0,13.20,-55]},camera:{position:[0,15,-50],target:[0,14,-55]},implemented:false},
  {id:'long-stairs',order:10,label:'長い石段',elevation:15.40,scene:{position:[0,15.40,-64]},camera:{position:[0,17,-59],target:[0,16,-64]},implemented:false},
  {id:'temizuya',order:11,label:'手水舎',elevation:20.80,scene:{position:[0,20.80,-73]},camera:{position:[0,22,-68],target:[0,21,-73]},implemented:false},
  {id:'komainu',order:12,label:'狛犬',elevation:22.20,scene:{position:[0,22.20,-81]},camera:{position:[0,24,-76],target:[0,23,-81]},implemented:false},
  {id:'sacred-tree',order:13,label:'ご神木',elevation:22.70,scene:{position:[0,22.70,-89]},camera:{position:[0,24,-84],target:[0,23,-89]},implemented:false},
  {id:'offertory',order:14,label:'賽銭箱',elevation:23.00,scene:{position:[0,23.00,-98]},camera:{position:[0,25,-93],target:[0,24,-98]},implemented:false},
  {id:'bell',order:15,label:'鈴',elevation:23.00,scene:{position:[0,23.00,-106]},camera:{position:[0,25,-101],target:[0,24,-106]},implemented:false}
]);

export const FIRST_ROUTE = Object.freeze(ROUTE.filter(point=>point.implemented));
export const ITEMS = Object.freeze([
  {id:'milk',label:'ぎゅうにゅう',model:'ItemMilk',placeId:'parking'},
  {id:'apple',label:'りんご',model:'ItemApple',placeId:'guide'},
  {id:'key',label:'かぎ',model:'ItemKey',placeId:'torii'}
]);

export function getPoint(id){return ROUTE.find(point=>point.id===id)||null;}
