export const ROUTE=Object.freeze([
  ['parking','駐車場','広い足元と低い車止め',-2.5,.15,'milk','ぎゅうにゅう','ItemMilk',[-2.2,.54,1.95]],
  ['guide','案内板','木の枠と山へ続く道',4,.67,'apple','りんご','ItemApple',[2.35,1.91,-3.66]],
  ['torii','鳥居','赤い柱と森の入口',10.4,1.18,'key','かぎ','ItemKey',[2.28,3.06,-10.06]],
  ['trailhead','山道の入口','太い根をまたぐ土の道',16,2.13,'umbrella','黄色いかさ','ItemUmbrella',[-1.6,2.45,-15.6]],
  ['log-steps','丸太の階段','丸太の段が山へ続く',26,3.93,'boots','赤いながぐつ','ItemBoots',[1.05,4.48,-26.2]],
  ['stream-bridge','沢の橋','沢と赤い欄干の橋',35,5.55,'gold-bell','金色のベル','ItemBell',[1.42,7.05,-34.2]],
  ['rest-area','休憩所','腰掛けと木漏れ日の広場',43,8.40,'bread','パン','ItemBread',[-3.5,9.05,-43]],
  ['stone-lantern','石灯籠','苔むした石灯籠',51,10.60,'watch','時計','ItemWatch',[1.0,12.0,-51]],
  ['lookout','見晴らし台','谷とふもとを見渡す舞台',59,13.20,'binoculars','双眼鏡','ItemBinoculars',[-1.0,14.35,-59]],
  ['long-stairs','長い石段','空へ伸びる長い石段',68,15.40,'ball','ボール','ItemBall',[1.0,16.05,-68]],
  ['temizuya','手水舎','水盤と木の屋根',77,20.80,'toothbrush','歯ブラシ','ItemToothbrush',[-2.5,21.90,-75.3],1.2,1.2],
  ['komainu','狛犬','参道を守る石の狛犬',85,22.20,'hat','帽子','ItemHat',[2.1,24.42,-85]],
  ['sacred-tree','ご神木','しめ縄を巻いた大木',93,22.70,'ribbon','リボン','ItemRibbon',[-3.0,24.0,-92.0]],
  ['offertory','賽銭箱','拝殿正面の木の賽銭箱',107.8,23.00,'letter','手紙','ItemLetter',[0,24.50,-107.42],3.5],
  ['summit-bell','鈴','山頂の拝殿と大鈴',110,23.00,'star','星','ItemStar',[.65,26.0,-109.5]]
].map((r,i)=>Object.freeze({id:r[0],order:i+1,label:r[1],cue:r[2],elevation:r[4],pathY:r[3],item:{id:r[5],label:r[6],model:r[7]},scene:{position:[0,r[4],-r[3]],itemPosition:r[8],stopOffset:r[9]??4.5,itemScale:r[10]??1.7},implemented:true})));
export const ITEMS=Object.freeze(ROUTE.map(p=>Object.freeze({...p.item,placeId:p.id,baseScale:p.scene.itemScale})));
export const PROFILE=Object.freeze(ROUTE.map(p=>Object.freeze({z:-p.pathY,elevation:p.elevation})));
export function getPoint(id){return ROUTE.find(p=>p.id===id)||null;}
export function getItem(id){return ITEMS.find(item=>item.id===id)||null;}
export function elevationAt(z){
  if(z>=PROFILE[0].z)return PROFILE[0].elevation;if(z<=PROFILE.at(-1).z)return PROFILE.at(-1).elevation;
  for(let i=1;i<PROFILE.length;i++){const a=PROFILE[i-1],b=PROFILE[i];if(z<=a.z&&z>=b.z){const t=(a.z-z)/(a.z-b.z);return a.elevation+(b.elevation-a.elevation)*t;}}return 0;
}
