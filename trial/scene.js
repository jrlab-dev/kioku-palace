import * as THREE from 'three';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {DRACOLoader} from './vendor/loaders/DRACOLoader.js';
import {FIRST_ROUTE,ITEMS} from './route.js';

const vec=values=>new THREE.Vector3(...values);

export async function createPalaceScene({container,reduced=false,onProgress=()=>{},onError=()=>{},onStats=()=>{}}){
  let renderer,scene,camera,model,travel=null,last=0,lookYaw=0,lookPitch=0,drag=null;
  let currentReduced=reduced,elapsed=0,frames=[],frameElapsed=0,ring,ring2;
  const items=[],templates=[],thumbnails=[];
  const view={position:new THREE.Vector3(),target:new THREE.Vector3()};
  const overview={position:new THREE.Vector3(0,3.45,9.6),target:new THREE.Vector3(.2,1.8,-4.2)};
  const stats={assetBytes:0,loadMs:0,fps:null,frameP95:null,drawCalls:0,triangles:0,viewport:[innerWidth,innerHeight],quality:'標準'};
  const started=performance.now();

  try{
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;container.append(renderer.domElement);
    scene=new THREE.Scene();scene.fog=new THREE.Fog('#d6ddc5',22,76);
    camera=new THREE.PerspectiveCamera(innerWidth<640?58:51,innerWidth/innerHeight,.1,220);
    makeSky(scene);scene.add(new THREE.HemisphereLight(0xfaf1e1,0x71845a,1.85));
    const sun=new THREE.DirectionalLight(0xffe4bc,2.6);sun.position.set(-10,18,5);sun.target.position.set(0,0,-7);sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-18,right:18,top:21,bottom:-15,near:1,far:65});sun.shadow.bias=-.00025;sun.shadow.normalBias=.035;scene.add(sun,sun.target);
    const loader=new GLTFLoader(),draco=new DRACOLoader();draco.setDecoderPath('./vendor/draco/');draco.setWorkerLimit(2);loader.setDRACOLoader(draco);
    const gltf=await loader.loadAsync('./assets/shrine_learning.glb',progress=>{if(progress.total){stats.assetBytes=progress.total;onProgress(Math.round(progress.loaded/progress.total*100));}});
    draco.dispose();model=gltf.scene;scene.add(model);
    model.traverse(object=>{if(object.isMesh){object.castShadow=!object.name.includes('Mountain')&&!object.name.includes('Stream');object.receiveShadow=true;if(object.material?.map)object.material.map.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());}});
    ITEMS.forEach((item,index)=>{
      const source=model.getObjectByName(item.model);if(!source)throw new Error(`Missing model ${item.model}`);
      source.visible=false;templates.push(source);const copy=source.clone(true);copy.visible=false;copy.name=`Placed_${item.id}`;
      const baseScale=index===0?1.45:index===1?1.8:2.15;copy.scale.setScalar(baseScale);copy.position.copy(vec(FIRST_ROUTE[index].scene.itemPosition));
      copy.userData.base=copy.position.y;copy.userData.baseScale=baseScale;copy.userData.motion=0;copy.userData.association=null;scene.add(copy);items.push(copy);
    });
    thumbnails.push(...makeThumbnails(templates));
    ({ring,ring2}=makeRing(scene));ring.visible=false;
    stats.loadMs=Math.round(performance.now()-started);view.position.copy(overview.position);view.target.copy(overview.target);
    animate(performance.now());bindLook();
  }catch(error){console.error(error);onError(error);throw error;}

  function animate(now){
    requestAnimationFrame(animate);const raw=last?(now-last)/1000:0;last=now;if(document.hidden)return;const dt=Math.min(raw,.05);elapsed+=dt;
    if(travel){travel.time+=dt;const t=Math.min(1,travel.time/travel.duration),ease=t*t*(3-2*t);view.position.lerpVectors(travel.from,travel.to,ease);view.target.lerpVectors(travel.fromTarget,travel.toTarget,ease);if(t>=1){const done=travel.resolve;travel=null;done();}}
    camera.position.copy(view.position);camera.lookAt(view.target);camera.rotateY(lookYaw);camera.rotateX(lookPitch);
    if(ring.visible){ring.scale.setScalar(currentReduced?1:1+Math.sin(elapsed*2.3)*.055);ring2.material.opacity=currentReduced?.48:.38+Math.sin(elapsed*2.3)*.18;}
    items.forEach((item,index)=>{if(!item.visible)return;const association=item.userData.association;if(association){association.time=Math.min(association.duration,association.time+dt);const p=association.duration?association.time/association.duration:1,ease=p*p*(3-2*p);item.position.lerpVectors(association.from,association.to,ease);const scale=THREE.MathUtils.lerp(association.scaleFrom,association.scaleTo,ease);item.scale.setScalar(scale);if(association.roll)item.rotation.z=-p*Math.PI*4;if(association.sway)item.rotation.z=Math.sin(p*Math.PI*5)*(1-p)*.38;if(p>=1){item.userData.association=null;item.userData.base=item.position.y;}}else{const motion=item.userData.motion;if(!currentReduced&&motion>0){item.userData.motion=Math.max(0,motion-dt);const p=1-item.userData.motion;item.position.y=item.userData.base+Math.abs(Math.sin(p*Math.PI*2))*item.userData.motion*.32;if(index===2)item.rotation.z=Math.sin(p*Math.PI*4)*item.userData.motion*.25;}else item.position.y=item.userData.base;}});
    renderer.render(scene,camera);
    if(raw>0&&raw<.5){frames.push(raw*1000);frameElapsed+=raw;}if(frameElapsed>=2){const sorted=[...frames].sort((a,b)=>a-b);Object.assign(stats,{fps:Math.round(frames.length/frameElapsed),frameP95:Math.round(sorted[Math.floor(sorted.length*.95)]||0),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,viewport:[innerWidth,innerHeight]});onStats({...stats});frames=[];frameElapsed=0;}
  }
  function bindLook(){
    container.addEventListener('pointerdown',event=>{drag={x:event.clientX,y:event.clientY};container.setPointerCapture(event.pointerId);});
    container.addEventListener('pointermove',event=>{if(!drag)return;lookYaw=THREE.MathUtils.clamp(lookYaw-(event.clientX-drag.x)*.0022,-.30,.30);lookPitch=THREE.MathUtils.clamp(lookPitch-(event.clientY-drag.y)*.0015,-.12,.12);drag={x:event.clientX,y:event.clientY};});
    container.addEventListener('pointerup',()=>drag=null);container.addEventListener('pointercancel',()=>drag=null);
  }
  async function moveTo(point){
    if(travel)travel.resolve();lookYaw=lookPitch=0;const position=vec(point.camera.position),target=vec(point.camera.target);
    if(innerWidth<640){
      // The same framing serves preview and learning: keep the landmark visible,
      // while centering the future item position above the bottom action card.
      const itemTarget=vec(point.scene.itemPosition);target.copy(itemTarget);target.y+=.16;
      position.x=THREE.MathUtils.lerp(position.x,itemTarget.x,.18);
      position.y=Math.max(position.y,point.elevation+2.20);
      position.add(position.clone().sub(target).normalize().multiplyScalar(.85));
    }
    return new Promise(resolve=>{travel={from:view.position.clone(),fromTarget:view.target.clone(),to:position,toTarget:target,time:0,duration:currentReduced?.12:1.75,resolve};});
  }
  function setItem(index,visible,animate=false){items.forEach((item,i)=>item.visible=visible&&i===index);if(visible){const item=items[index];item.position.copy(vec(FIRST_ROUTE[index].scene.itemPosition));item.scale.setScalar(item.userData.baseScale);item.rotation.set(0,0,0);item.userData.association=null;item.userData.base=item.position.y;item.userData.motion=animate&&!currentReduced?1:0;}}
  function playAssociation(index,variant,animate=true){setItem(index,true,false);const item=items[index],base=item.userData.baseScale;let from=item.position.clone(),to=item.position.clone(),scaleFrom=base,scaleTo=base,roll=false,sway=false;
    if(index===0){from=new THREE.Vector3(-.35,.36,2.85);to=vec(FIRST_ROUTE[0].scene.itemPosition).add(new THREE.Vector3(0,.18,0));scaleFrom=.38;scaleTo=2.35;}
    else if(index===1&&variant==='roll'){from=new THREE.Vector3(1.20,1.93,-3.66);to=new THREE.Vector3(2.92,1.93,-3.66);scaleFrom=scaleTo=1.8;roll=true;}
    else if(index===1){from=new THREE.Vector3(2.35,1.50,-3.66);to=new THREE.Vector3(2.35,2.67,-3.76);scaleFrom=.65;scaleTo=2.65;}
    else{sway=true;to=vec(FIRST_ROUTE[2].scene.itemPosition);from=to.clone().add(new THREE.Vector3(0,-.42,.05));scaleFrom=.8;scaleTo=2.15;}
    item.visible=true;if(!animate||currentReduced){item.position.copy(to);item.scale.setScalar(scaleTo);item.userData.base=to.y;return;}
    item.position.copy(from);item.scale.setScalar(scaleFrom);item.userData.association={from,to,scaleFrom,scaleTo,roll,sway,time:0,duration:index===0?1.55:1.25};
  }
  function hideItems(){items.forEach(item=>item.visible=false);}
  function mark(index,visible=true){ring.visible=visible;if(!visible)return;ring.position.copy(vec(FIRST_ROUTE[index].scene.position));ring.position.y+=.06;}
  function showOverview(){if(travel)travel.resolve();view.position.copy(overview.position);view.target.copy(overview.target);lookYaw=lookPitch=0;hideItems();mark(0,false);}
  function setReduced(value){currentReduced=value===true;}
  function handleResize(){camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<640?58:51;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
  addEventListener('resize',handleResize);
  return {moveTo,setItem,playAssociation,hideItems,mark,showOverview,setReduced,thumbnails,stats};
}

function makeSky(scene){
  const geometry=new THREE.SphereGeometry(190,32,16),material=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{top:{value:new THREE.Color('#9cc5cf')},bottom:{value:new THREE.Color('#eee7ce')}},vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec3 vP;uniform vec3 top;uniform vec3 bottom;void main(){float h=clamp(normalize(vP).y*1.5,0.,1.);gl_FragColor=vec4(mix(bottom,top,pow(h,.65)),1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'});
  scene.add(new THREE.Mesh(geometry,material));
}
function makeRing(scene){
  const group=new THREE.Group(),material=new THREE.MeshBasicMaterial({color:'#ffdc84',transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false});
  const ring=new THREE.Mesh(new THREE.RingGeometry(.34,.39,64),material);ring.rotation.x=-Math.PI/2;group.add(ring);
  const ring2=new THREE.Mesh(new THREE.RingGeometry(.42,.44,64),material.clone());ring2.rotation.x=-Math.PI/2;group.add(ring2);scene.add(group);return {ring:group,ring2};
}
function makeThumbnails(templates){
  const output=[],renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(140,140);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
  for(const template of templates){const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xfff9de,0x688063,2.6));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-2,4,3);scene.add(light);const item=template.clone(true);item.visible=true;item.position.set(0,0,0);scene.add(item);const box=new THREE.Box3().setFromObject(item),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),span=Math.max(size.x,size.y,size.z)*1.35;const camera=new THREE.OrthographicCamera(-span/2,span/2,span/2,-span/2,.01,20);camera.position.copy(center).add(new THREE.Vector3(.8,.45,1.8));camera.lookAt(center);renderer.render(scene,camera);output.push(renderer.domElement.toDataURL('image/png'));}renderer.dispose();renderer.forceContextLoss();return output;
}
