(function(root){
'use strict';
const COLORS={ground:'#536C55',road:'#353C48',line:'#E7D8A5',building:'#A9B4C5',glass:'#6CA6C8',tree:'#477B4E',car:'#C75B4D'};
function isWorldRequest(text){return /\b(monde ouvert|monde 3d|ville|village|quartier|rue|route|environnement|paysage|campagne|forêt|foret|montagne|montagnes|colline|collines|relief|aéroport|aeroport|port)\b/i.test(text||'')}
function create(text){
 const t=String(text||'').toLowerCase(),elements=[];
 const add=(type,x,z,scale=1,variant=0)=>elements.push({id:type+'-'+elements.length,type,x,z,scale,variant});
 const biome=/montagne|montagnes|colline|collines|relief/.test(t)?'mountain':/forêt|foret|bois/.test(t)?'forest':/campagne/.test(t)?'countryside':/port/.test(t)?'harbor':/aéroport|aeroport/.test(t)?'airport':'city';
 if(biome==='mountain'){
  for(let z=-5;z<=5;z+=2)for(let x=-5;x<=5;x+=2)if(Math.abs(x)+Math.abs(z)>3)add('tree',x,z,.65+(Math.abs(x*z)%4)*.1);
 }else if(biome==='forest'){
  for(let z=-5;z<=5;z+=2)for(let x=-5;x<=5;x+=2)if(Math.abs(x)+Math.abs(z)>2)add('tree',x,z,.8+(Math.abs(x*z)%4)*.1);
 }else if(biome==='countryside'){
  for(let z=-5;z<=5;z+=3)for(let x=-5;x<=5;x+=3){if((x+z)%2===0)add('tree',x,z,.9);else add('house',x,z,.8+(Math.abs(x-z)%3)*.12)}
 }else{
  const blocks=[[-4,-4],[-1,-4],[2,-4],[5,-4],[-4,-1],[2,-1],[5,-1],[-4,2],[-1,2],[2,2],[5,2],[-4,5],[-1,5],[2,5],[5,5]];
  blocks.forEach(([x,z],i)=>{if(i%4===0)add('park',x,z,1);else{add('building',x,z,.8+(i%3)*.18,i%4);elements[elements.length-1].floors=2+(i%4)}});
  for(let z=-5;z<=5;z+=2){add('tree',-6,z,.8);add('tree',6,z,.8)}
  for(let x=-5;x<=5;x+=2){add('tree',x,-6,.8);add('tree',x,6,.8)}
  add('car',-2,-.6,1,0);add('car',2,.7,1,1);add('car',-1,3,1,2);
 }
 if(biome==='harbor'){for(let x=-5;x<=5;x+=2)add('crane',x,-4,1);for(let x=-4;x<=4;x+=2)add('boat',x,4,1)}
 if(biome==='airport'){add('terminal',0,-4,1.5);for(let x=-5;x<=5;x+=2)add('light',x,3,.8)}
 const amplitude=biome==='mountain'?1.35:biome==='forest'?.72:biome==='countryside'?.48:.12;
 return {version:1,kind:'procedural-world',biome,title:biome==='mountain'?'Montagnes':biome==='forest'?'Forêt':biome==='countryside'?'Campagne':biome==='harbor'?'Port':biome==='airport'?'Aéroport':'Ville',ground:{width:16,depth:16,color:COLORS.ground},terrain:{resolution:16,amplitude,seed:biome},roads:biome==='forest'||biome==='mountain'?[]:[{x:0,z:0,width:1.35,axis:'x'},{x:0,z:0,width:1.35,axis:'z'}],elements,controls:['Glisser pour tourner la caméra','Touches WASD ou flèches pour avancer','Pavé directionnel à l’écran pour se déplacer','Pincer ou utiliser la molette pour zoomer'],source:text};
}
function terrainHeight(world,x,z){
 const a=world.terrain?world.terrain.amplitude:0;
 const rolling=(Math.sin(x*.62+1.1)*Math.cos(z*.51-.4)+Math.sin((x+z)*.34)*.5)*a*.34;
 const peaks=world.biome==='mountain'?(Math.exp(-((x+3)*(x+3)+(z+1)*(z+1))/8)*a+Math.exp(-((x-3)*(x-3)+(z-2)*(z-2))/6)*a*.8):0;
 return rolling+peaks;
}
function play(canvas,world,onCaption){
 const ctx=canvas.getContext('2d');let raf=0,stopped=false,yaw=.65,zoom=1,drag=false,lastX=0,lastY=0,pitch=.35,w=0,h=0,cameraX=0,cameraZ=0,moveX=0,moveZ=0;
 const resize=()=>{const d=Math.min(root.devicePixelRatio||1,2);canvas.width=canvas.clientWidth*d;canvas.height=canvas.clientHeight*d;ctx.setTransform(d,0,0,d,0,0)};
 resize();root.addEventListener('resize',resize);
 const pointerDown=e=>{const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;if(x<118&&y>h-132){drag=true;moveX=Math.max(-1,Math.min(1,(x-62)/42));moveZ=Math.max(-1,Math.min(1,(y-(h-72))/42));}else{drag=true;moveX=0;moveZ=0;lastX=e.clientX;lastY=e.clientY;drag='camera'}if(canvas.setPointerCapture)canvas.setPointerCapture(e.pointerId)};
 const pointerMove=e=>{if(drag==='camera'){yaw+=(e.clientX-lastX)*.008;pitch=Math.max(.12,Math.min(.72,pitch+(e.clientY-lastY)*.003));lastX=e.clientX;lastY=e.clientY}else if(drag){const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;moveX=Math.max(-1,Math.min(1,(x-62)/42));moveZ=Math.max(-1,Math.min(1,(y-(h-72))/42));}};
 const pointerUp=()=>{drag=false;moveX=0;moveZ=0};
 const keys=new Set();
 const keyDown=e=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){keys.add(k);e.preventDefault()}};
 const keyUp=e=>keys.delete(e.key.toLowerCase());
 root.addEventListener('keydown',keyDown);root.addEventListener('keyup',keyUp);
 const wheel=e=>{zoom=Math.max(.65,Math.min(1.8,zoom+(e.deltaY<0?.08:-.08)))};
 canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);canvas.addEventListener('wheel',wheel,{passive:true});
 function project(x,y,z,w,h){
  x-=cameraX;z-=cameraZ;
  const c=Math.cos(yaw),s=Math.sin(yaw),rx=x*c-z*s,rz=x*s+z*c;
  const scale=Math.min(w,h)*.046*zoom,depth=rz+11;
  const perspective=12/Math.max(4,depth);
  return {x:w*.5+rx*scale*perspective,y:h*.58+(rz* Math.cos(pitch)-y*2.2)*scale*perspective,depth:rz};
 }
 function poly(points,fill,stroke){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
 function box(x,z,wid,dep,hei,color,base=0){
  const y0=base,y1=base+hei;
  const p=[project(x-wid/2,y0,z-dep/2,w,h),project(x+wid/2,y0,z-dep/2,w,h),project(x+wid/2,y0,z+dep/2,w,h),project(x-wid/2,y0,z+dep/2,w,h)];
  const top=[project(x-wid/2,y1,z-dep/2,w,h),project(x+wid/2,y1,z-dep/2,w,h),project(x+wid/2,y1,z+dep/2,w,h),project(x-wid/2,y1,z+dep/2,w,h)];
  poly([p[0],p[1],top[1],top[0]],'#667487','#303A49');poly([p[1],p[2],top[2],top[1]],'#465366','#303A49');poly(top,color,'#D3DCE8');
  for(let row=0;row<Math.max(1,Math.floor(hei*2));row++)for(let col=0;col<Math.max(1,Math.floor(wid*2));col++){
   const xx=x-wid/2+(col+.5)*wid/Math.max(1,Math.floor(wid*2)),yy=.35+row*.42;
   if(yy<hei){const a=project(xx,yy,z-dep/2-.006,w,h),b=project(xx+.16,yy,z-dep/2-.006,w,h),c=project(xx+.16,yy+.2,z-dep/2-.006,w,h),d=project(xx,yy+.2,z-dep/2-.006,w,h);poly([a,b,c,d],'#83B7D0')}
  }
 }
 function faceRect(x,z,y,wid,hei,color){
  const a=project(x-wid/2,y,z,w,h),b=project(x+wid/2,y,z,w,h),c=project(x+wid/2,y+hei,z,w,h),d=project(x-wid/2,y+hei,z,w,h);
  poly([a,b,c,d],color,'#344252');
 }
 function drawHouse(x,z,scale,base){
  const wid=1.35*scale,dep=1.18*scale,hei=1.05*scale,roof=.48*scale;
  box(x,z,wid,dep,hei,'#D6B58B',base);
  faceRect(x,z-dep/2-.012,base+.08*scale,.25*scale,.57*scale,'#654C3A');
  faceRect(x-.38*scale,z-dep/2-.016,base+.48*scale,.27*scale,.28*scale,'#79B9D6');
  faceRect(x+.38*scale,z-dep/2-.016,base+.48*scale,.27*scale,.28*scale,'#79B9D6');
  const frontL=project(x-wid/2,base+hei,z-dep/2,w,h),frontR=project(x+wid/2,base+hei,z-dep/2,w,h);
  const backL=project(x-wid/2,base+hei,z+dep/2,w,h),backR=project(x+wid/2,base+hei,z+dep/2,w,h);
  const ridgeF=project(x,base+hei+roof,z-dep/2,w,h),ridgeB=project(x,base+hei+roof,z+dep/2,w,h);
  poly([frontL,frontR,ridgeF],'#9B5546','#603B36');
  poly([backL,backR,ridgeB],'#A95F4D','#603B36');
  poly([frontL,ridgeF,ridgeB,backL],'#B86A57','#603B36');
  poly([frontR,ridgeF,ridgeB,backR],'#8F493F','#603B36');
 }
 function drawBuilding(e,base){
  const wid=1.35*e.scale,dep=1.2*e.scale,hei=2.1+e.floors*.48;
  box(e.x,e.z,wid,dep,hei,'#AAB6C4',base);
  const floors=e.floors||3;
  for(let floor=0;floor<floors;floor++){
   const y=base+.32+floor*.48;
   for(let col=0;col<2;col++){
    const xx=e.x+(col===0?-.34:.34)*e.scale;
    faceRect(xx,e.z-dep/2-.018,y,.22*e.scale,.25,'#76AFCF');
   }
   if(floor>0){
    const left=project(e.x-wid/2,y-.06,e.z-dep/2-.022,w,h),right=project(e.x+wid/2,y-.06,e.z-dep/2-.022,w,h);
    ctx.strokeStyle='#E0E5E9';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(left.x,left.y);ctx.lineTo(right.x,right.y);ctx.stroke();
   }
  }
  faceRect(e.x,e.z-dep/2-.024,base,.28,.42,'#47566A');
  const roofL=project(e.x-wid/2,base+hei,e.z-dep/2,w,h),roofR=project(e.x+wid/2,base+hei,e.z-dep/2,w,h);
  const roofBackR=project(e.x+wid/2,base+hei,e.z+dep/2,w,h),roofBackL=project(e.x-wid/2,base+hei,e.z+dep/2,w,h);
  const capL=project(e.x-wid/2,base+hei+.12,e.z-dep/2,w,h),capR=project(e.x+wid/2,base+hei+.12,e.z-dep/2,w,h),capBR=project(e.x+wid/2,base+hei+.12,e.z+dep/2,w,h),capBL=project(e.x-wid/2,base+hei+.12,e.z+dep/2,w,h);
  poly([roofL,roofR,capR,capL],'#8795A5');poly([roofR,roofBackR,capBR,capR],'#778697');poly([capL,capR,capBR,capBL],'#C4CED8');
 }
 function tree(x,z,k,base=0){
  const b=project(x,base,z,w,h),top=project(x,base+1.4*k,z,w,h),r=9*k*zoom;
  ctx.strokeStyle='#65452F';ctx.lineWidth=4*k;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(top.x,top.y+4);ctx.stroke();
  ctx.fillStyle='#477B4E';ctx.beginPath();ctx.arc(top.x,top.y,r*1.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#65945D';ctx.beginPath();ctx.arc(top.x-r*.4,top.y-r*.4,r,0,Math.PI*2);ctx.fill();
 }
 function frame(){
  if(stopped)return;w=canvas.clientWidth;h=canvas.clientHeight;
  const forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0)-moveZ;
  const sideways=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+moveX;
  cameraX+=((sideways*Math.cos(yaw))-(forward*Math.sin(yaw)))*.055;
  cameraZ+=((sideways*Math.sin(yaw))+(forward*Math.cos(yaw)))*.055;
  cameraX=Math.max(-7,Math.min(7,cameraX));cameraZ=Math.max(-7,Math.min(7,cameraZ));
  const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#6C9FC5');sky.addColorStop(.58,'#C5D9E4');sky.addColorStop(.59,'#788C75');sky.addColorStop(1,'#3D5946');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  const cells=[];for(let z=-8;z<8;z+=1)for(let x=-8;x<8;x+=1){const mid=project(x+.5,0,z+.5,w,h);cells.push({x,z,depth:mid.depth})}cells.sort((a,b)=>b.depth-a.depth);
  cells.forEach(cell=>{const x=cell.x,z=cell.z,h1=terrainHeight(world,x,z),h2=terrainHeight(world,x+1,z),h3=terrainHeight(world,x+1,z+1),h4=terrainHeight(world,x,z+1);const avg=(h1+h2+h3+h4)/4;const shade=Math.max(0,Math.min(30,Math.round(avg*20)));const color=world.biome==='mountain'?(avg>.65?'#8A8D8B':avg>.3?'#747F70':'#536C55'):world.biome==='forest'?'#496C4B':world.biome==='countryside'?'#68865A':'#536C55';poly([project(x,h1,z,w,h),project(x+1,h2,z,w,h),project(x+1,h3,z+1,w,h),project(x,h4,z+1,w,h)],color);});
  world.roads.forEach(r=>{
   if(r.axis==='x')poly([project(-8,terrainHeight(world,-8,-r.width/2)+.025,-r.width/2,w,h),project(8,terrainHeight(world,8,-r.width/2)+.025,-r.width/2,w,h),project(8,terrainHeight(world,8,r.width/2)+.025,r.width/2,w,h),project(-8,terrainHeight(world,-8,r.width/2)+.025,r.width/2,w,h)],'#343B47');
   else poly([project(-r.width/2,terrainHeight(world,-r.width/2,-8)+.025,-8,w,h),project(r.width/2,terrainHeight(world,r.width/2,-8)+.025,-8,w,h),project(r.width/2,terrainHeight(world,r.width/2,8)+.025,8,w,h),project(-r.width/2,terrainHeight(world,-r.width/2,8)+.025,8,w,h)],'#343B47');
  });
  const sorted=world.elements.slice().sort((a,b)=>b.z-a.z);
  sorted.forEach(e=>{
   const base=terrainHeight(world,e.x,e.z);
   if(e.type==='building')drawBuilding(e,base);
   else if(e.type==='house')drawHouse(e.x,e.z,e.scale,base);
   else if(e.type==='park'){const p=project(e.x,base,e.z,w,h);ctx.fillStyle='#6D9560';ctx.beginPath();ctx.ellipse(p.x,p.y,19,11,0,0,Math.PI*2);ctx.fill();tree(e.x,e.z,.8,base)}
   else if(e.type==='tree')tree(e.x,e.z,e.scale,base);
   else if(e.type==='car'){const p=project(e.x,base+.15,e.z,w,h);ctx.fillStyle=e.variant===1?'#4D8BC5':e.variant===2?'#D7B44E':'#C75B4D';ctx.fillRect(p.x-12,p.y-6,24,11);ctx.fillStyle='#1C2837';ctx.fillRect(p.x-8,p.y-9,14,5)}
   else if(e.type==='crane'||e.type==='light'){const p=project(e.x,0,e.z,w,h);ctx.strokeStyle='#E2C16D';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x,p.y-40);ctx.lineTo(p.x+24,p.y-40);ctx.stroke()}
   else if(e.type==='boat'){const p=project(e.x,0,e.z,w,h);ctx.fillStyle='#B9D3E2';ctx.fillRect(p.x-16,p.y-5,32,10)}
   else if(e.type==='terminal')box(e.x,e.z,3,1.6,1.2,'#9EB5C8');
  });
  ctx.fillStyle='#FFFFFF';ctx.font='700 14px system-ui';ctx.textAlign='left';ctx.fillText('IDÉE VISION • MONDE PROCÉDURAL',16,28);
  ctx.font='12px system-ui';ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillText(world.title+' • '+world.elements.length+' éléments',16,48);
  ctx.fillText('Glisse : caméra • Pavé en bas à gauche : avancer • WASD : clavier',16,h-20);
  ctx.fillStyle='rgba(10,16,24,.5)';ctx.beginPath();ctx.arc(62,h-72,48,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(62,h-110);ctx.lineTo(62,h-34);ctx.moveTo(24,h-72);ctx.lineTo(100,h-72);ctx.stroke();ctx.fillStyle='#FFFFFF';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText('▲',62,h-92);ctx.fillText('▼',62,h-45);ctx.fillText('◀',42,h-68);ctx.fillText('▶',82,h-68);
  raf=root.requestAnimationFrame(frame);
 }
 onCaption('Un premier environnement 3D est généré. Tu peux faire tourner la caméra en glissant sur l’écran.');
 raf=root.requestAnimationFrame(frame);
 return ()=>{stopped=true;root.cancelAnimationFrame(raf);root.removeEventListener('resize',resize);root.removeEventListener('keydown',keyDown);root.removeEventListener('keyup',keyUp);canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',pointerUp);canvas.removeEventListener('wheel',wheel)};
}
root.IdeeVisionWorld=Object.freeze({version:1,isWorldRequest,create,terrainHeight,play});
})(window);
