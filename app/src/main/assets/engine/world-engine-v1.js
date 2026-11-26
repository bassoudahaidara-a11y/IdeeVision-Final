(function(root){
'use strict';
const COLORS={ground:'#536C55',road:'#353C48',line:'#E7D8A5',building:'#A9B4C5',glass:'#6CA6C8',tree:'#477B4E',car:'#C75B4D'};
function isWorldRequest(text){return /\b(monde ouvert|monde 3d|ville|village|quartier|rue|route|environnement|paysage|campagne|forêt|foret|aéroport|aeroport|port)\b/i.test(text||'')}
function create(text){
 const t=String(text||'').toLowerCase(),elements=[];
 const add=(type,x,z,scale=1,variant=0)=>elements.push({id:type+'-'+elements.length,type,x,z,scale,variant});
 const biome=/forêt|foret|bois/.test(t)?'forest':/campagne/.test(t)?'countryside':/port/.test(t)?'harbor':/aéroport|aeroport/.test(t)?'airport':'city';
 if(biome==='forest'){
  for(let z=-5;z<=5;z+=2)for(let x=-5;x<=5;x+=2)if(Math.abs(x)+Math.abs(z)>2)add('tree',x,z,.8+(Math.abs(x*z)%4)*.1);
 }else if(biome==='countryside'){
  for(let z=-5;z<=5;z+=3)for(let x=-5;x<=5;x+=3){if((x+z)%2===0)add('tree',x,z,.9);else add('house',x,z,.8+(Math.abs(x-z)%3)*.12)}
 }else{
  const blocks=[[-4,-4],[-1,-4],[2,-4],[5,-4],[-4,-1],[2,-1],[5,-1],[-4,2],[-1,2],[2,2],[5,2],[-4,5],[-1,5],[2,5],[5,5]];
  blocks.forEach(([x,z],i)=>{if(i%4===0)add('park',x,z,1);else add('building',x,z,.8+(i%3)*.18,i%4)});
  for(let z=-5;z<=5;z+=2){add('tree',-6,z,.8);add('tree',6,z,.8)}
  for(let x=-5;x<=5;x+=2){add('tree',x,-6,.8);add('tree',x,6,.8)}
  add('car',-2,-.6,1,0);add('car',2,.7,1,1);add('car',-1,3,1,2);
 }
 if(biome==='harbor'){for(let x=-5;x<=5;x+=2)add('crane',x,-4,1);for(let x=-4;x<=4;x+=2)add('boat',x,4,1)}
 if(biome==='airport'){add('terminal',0,-4,1.5);for(let x=-5;x<=5;x+=2)add('light',x,3,.8)}
 return {version:1,kind:'procedural-world',biome,title:biome==='forest'?'Forêt':biome==='countryside'?'Campagne':biome==='harbor'?'Port':biome==='airport'?'Aéroport':'Ville',ground:{width:16,depth:16,color:COLORS.ground},roads:biome==='forest'?[]:[{x:0,z:0,width:1.35,axis:'x'},{x:0,z:0,width:1.35,axis:'z'}],elements,controls:['Glisser pour tourner la caméra','Pincer ou utiliser la molette pour zoomer'],source:text};
}
function play(canvas,world,onCaption){
 const ctx=canvas.getContext('2d');let raf=0,stopped=false,yaw=.65,zoom=1,drag=false,lastX=0,lastY=0,pitch=.35,w=0,h=0;
 const resize=()=>{const d=Math.min(root.devicePixelRatio||1,2);canvas.width=canvas.clientWidth*d;canvas.height=canvas.clientHeight*d;ctx.setTransform(d,0,0,d,0,0)};
 resize();root.addEventListener('resize',resize);
 const pointerDown=e=>{drag=true;lastX=e.clientX;lastY=e.clientY;if(canvas.setPointerCapture)canvas.setPointerCapture(e.pointerId)};
 const pointerMove=e=>{if(!drag)return;yaw+=(e.clientX-lastX)*.008;pitch=Math.max(.12,Math.min(.72,pitch+(e.clientY-lastY)*.003));lastX=e.clientX;lastY=e.clientY};
 const pointerUp=()=>{drag=false};
 const wheel=e=>{zoom=Math.max(.65,Math.min(1.8,zoom+(e.deltaY<0?.08:-.08)))};
 canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);canvas.addEventListener('wheel',wheel,{passive:true});
 function project(x,y,z,w,h){
  const c=Math.cos(yaw),s=Math.sin(yaw),rx=x*c-z*s,rz=x*s+z*c;
  const scale=Math.min(w,h)*.046*zoom,depth=rz+11;
  const perspective=12/Math.max(4,depth);
  return {x:w*.5+rx*scale*perspective,y:h*.58+(rz* Math.cos(pitch)-y*2.2)*scale*perspective,depth:rz};
 }
 function poly(points,fill,stroke){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
 function box(x,z,wid,dep,hei,color){
  const y0=0,y1=hei;
  const p=[project(x-wid/2,y0,z-dep/2,w,h),project(x+wid/2,y0,z-dep/2,w,h),project(x+wid/2,y0,z+dep/2,w,h),project(x-wid/2,y0,z+dep/2,w,h)];
  const top=[project(x-wid/2,y1,z-dep/2,w,h),project(x+wid/2,y1,z-dep/2,w,h),project(x+wid/2,y1,z+dep/2,w,h),project(x-wid/2,y1,z+dep/2,w,h)];
  poly([p[0],p[1],top[1],top[0]],'#667487','#303A49');poly([p[1],p[2],top[2],top[1]],'#465366','#303A49');poly(top,color,'#D3DCE8');
  for(let row=0;row<Math.max(1,Math.floor(hei*2));row++)for(let col=0;col<Math.max(1,Math.floor(wid*2));col++){
   const xx=x-wid/2+(col+.5)*wid/Math.max(1,Math.floor(wid*2)),yy=.35+row*.42;
   if(yy<hei){const a=project(xx,yy,z-dep/2-.006,w,h),b=project(xx+.16,yy,z-dep/2-.006,w,h),c=project(xx+.16,yy+.2,z-dep/2-.006,w,h),d=project(xx,yy+.2,z-dep/2-.006,w,h);poly([a,b,c,d],'#83B7D0')}
  }
 }
 function tree(x,z,k){
  const b=project(x,0,z,w,h),top=project(x,1.4*k,z,w,h),r=9*k*zoom;
  ctx.strokeStyle='#65452F';ctx.lineWidth=4*k;ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(top.x,top.y+4);ctx.stroke();
  ctx.fillStyle='#477B4E';ctx.beginPath();ctx.arc(top.x,top.y,r*1.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#65945D';ctx.beginPath();ctx.arc(top.x-r*.4,top.y-r*.4,r,0,Math.PI*2);ctx.fill();
 }
 function frame(){
  if(stopped)return;w=canvas.clientWidth;h=canvas.clientHeight;
  const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#6C9FC5');sky.addColorStop(.58,'#C5D9E4');sky.addColorStop(.59,'#788C75');sky.addColorStop(1,'#3D5946');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  poly([project(-8,0,-8,w,h),project(8,0,-8,w,h),project(8,0,8,w,h),project(-8,0,8,w,h)],world.ground.color);
  world.roads.forEach(r=>{
   if(r.axis==='x')poly([project(-8,.015,-r.width/2,w,h),project(8,.015,-r.width/2,w,h),project(8,.015,r.width/2,w,h),project(-8,.015,r.width/2,w,h)],'#343B47');
   else poly([project(-r.width/2,.02,-8,w,h),project(r.width/2,.02,-8,w,h),project(r.width/2,.02,8,w,h),project(-r.width/2,.02,8,w,h)],'#343B47');
  });
  for(let n=-7;n<=7;n+=1){
   const a=project(n,.03,-8,w,h),b=project(n,.03,8,w,h),c=project(-8,.03,n,w,h),d=project(8,.03,n,w,h);
   ctx.strokeStyle='rgba(220,235,218,.12)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.moveTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.stroke();
  }
  const sorted=world.elements.slice().sort((a,b)=>a.z-b.z);
  sorted.forEach(e=>{
   if(e.type==='building')box(e.x,e.z,1.35*e.scale,1.2*e.scale,2.2+e.variant*.7,'#AAB6C4');
   else if(e.type==='house')box(e.x,e.z,1.25,1.1,1.05,'#D6B58B');
   else if(e.type==='park'){const p=project(e.x,0,e.z,w,h);ctx.fillStyle='#6D9560';ctx.beginPath();ctx.ellipse(p.x,p.y,19,11,0,0,Math.PI*2);ctx.fill();tree(e.x,e.z,.8)}
   else if(e.type==='tree')tree(e.x,e.z,e.scale);
   else if(e.type==='car'){const p=project(e.x,.15,e.z,w,h);ctx.fillStyle=e.variant===1?'#4D8BC5':e.variant===2?'#D7B44E':'#C75B4D';ctx.fillRect(p.x-12,p.y-6,24,11);ctx.fillStyle='#1C2837';ctx.fillRect(p.x-8,p.y-9,14,5)}
   else if(e.type==='crane'||e.type==='light'){const p=project(e.x,0,e.z,w,h);ctx.strokeStyle='#E2C16D';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x,p.y-40);ctx.lineTo(p.x+24,p.y-40);ctx.stroke()}
   else if(e.type==='boat'){const p=project(e.x,0,e.z,w,h);ctx.fillStyle='#B9D3E2';ctx.fillRect(p.x-16,p.y-5,32,10)}
   else if(e.type==='terminal')box(e.x,e.z,3,1.6,1.2,'#9EB5C8');
  });
  ctx.fillStyle='#FFFFFF';ctx.font='700 14px system-ui';ctx.textAlign='left';ctx.fillText('IDÉE VISION • MONDE PROCÉDURAL',16,28);
  ctx.font='12px system-ui';ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillText(world.title+' • '+world.elements.length+' éléments',16,48);
  ctx.fillText('Glisse pour tourner • Pince pour zoomer',16,h-20);
  raf=root.requestAnimationFrame(frame);
 }
 onCaption('Un premier environnement 3D est généré. Tu peux faire tourner la caméra en glissant sur l’écran.');
 raf=root.requestAnimationFrame(frame);
 return ()=>{stopped=true;root.cancelAnimationFrame(raf);root.removeEventListener('resize',resize);canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',pointerUp);canvas.removeEventListener('wheel',wheel)};
}
root.IdeeVisionWorld=Object.freeze({version:1,isWorldRequest,create,play});
})(window);
