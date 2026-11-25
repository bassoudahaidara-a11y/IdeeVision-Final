(function(){
'use strict';
const COLORS={bleu:'#58A6FF',rouge:'#FF6B6B',vert:'#58D68D',jaune:'#FFD166',violet:'#B892FF',orange:'#FF9F43',blanc:'#F4F7FF',gris:'#AAB3C5'};
function detect(idea){
 const t=idea.toLowerCase(), mode=/\b(3d|trois dimensions|volume|en relief)\b/.test(t)?'3D':/\b(2d|deux dimensions|à plat|schema|schéma|dessin)\b/.test(t)?'2D':'3D';
 const objects=[], add=(type,label,color,props={})=>objects.push({type,label,color,props});
 if(/maison|villa|bâtiment|batiment/.test(t)){add('house','Maison',COLORS.orange);if(/arbre/.test(t))add('tree','Arbre',COLORS.vert,{x:-2.7});if(/voiture|auto/.test(t))add('car','Voiture',COLORS.rouge,{x:2.5});}
 if(/robot/.test(t))add('robot','Robot',COLORS.bleu);
 if(/dragon/.test(t))add('dragon','Dragon',COLORS.violet);
 if(/voiture|voiture|véhicule|vehicule|auto/.test(t)&&!objects.some(o=>o.type==='car'))add('car','Voiture',COLORS.rouge);
 if(/arbre|forêt|foret/.test(t)&&!objects.some(o=>o.type==='tree'))add('tree','Arbre',COLORS.vert);
 if(/ballon|balle|sphère|sphere/.test(t))add('ball','Balle',COLORS.jaune);
 if(/cube|boîte|boite/.test(t))add('cube','Cube',COLORS.bleu);
 if(/table/.test(t))add('table','Table',COLORS.orange);
 if(/soleil/.test(t))add('sun','Soleil',COLORS.jaune);
 if(!objects.length)add('cube','Objet',COLORS.bleu);
 const quantityWords={'deux':2,'2':2,'trois':3,'3':3,'quatre':4,'4':4,'cinq':5,'5':5};
 const nouns={house:'maison|villa|bâtiment|batiment',tree:'arbre',car:'voiture|véhicule|vehicule|auto',robot:'robot',dragon:'dragon',ball:'ballon|balle|sphère|sphere',cube:'cube|boîte|boite',table:'table',sun:'soleil'};
 const expanded=[];
 objects.forEach(o=>{
  const pattern=nouns[o.type];
  const match=pattern?t.match(new RegExp('\\b(deux|2|trois|3|quatre|4|cinq|5)\\s+(?:[a-zà-ÿ-]+\\s+){0,2}(?:'+pattern+')s?\\b','i')):null;
  const amount=match?(quantityWords[match[1].toLowerCase()]||1):1;
  for(let i=0;i<amount;i++){
   const copy={type:o.type,label:o.label,color:o.color,props:Object.assign({},o.props)};
   if(amount>1)copy.props.x=copy.props.x||0;
   expanded.push(copy);
  }
 });
 objects.length=0;expanded.forEach(o=>objects.push(o));
 const colorMap={bleu:'#58A6FF',bleue:'#58A6FF',rouge:'#FF6B6B',rouge:'#FF6B6B',vert:'#58D68D',verte:'#58D68D',jaune:'#FFD166',violet:'#B892FF',orange:'#FF9F43',blanc:'#F4F7FF',blanche:'#F4F7FF',noir:'#30384D',noire:'#30384D',rose:'#FF8FC7',marron:'#A66A43'};
 objects.forEach(o=>{
  const pattern=nouns[o.type];
  const at=pattern?t.search(new RegExp('(?:'+pattern+')','i')):-1;
  if(at>=0){
   const around=t.slice(Math.max(0,at-24),Math.min(t.length,at+55));
   let best=null,bestDistance=Infinity;
   Object.keys(colorMap).forEach(word=>{
    const re=new RegExp(word,'g');let m;
    while((m=re.exec(around))!==null){const pos=Math.max(0,at-24)+m.index;const distance=Math.abs(pos-at);if(distance<bestDistance){bestDistance=distance;best=word}}
   });
   if(best)o.color=colorMap[best];
   if(/à gauche|a gauche|sur la gauche|à gauche de/.test(around))o.props.x=-2.0;
   if(/à droite|a droite|sur la droite|à droite de/.test(around))o.props.x=2.0;
   if(/au-dessus|au dessus|au-dessus de|au dessus de/.test(around))o.props.y=1.35;
   if(/en dessous|sous la|sous le|sous les/.test(around))o.props.y=-1.0;
   if(/devant/.test(around))o.props.z=1.0;
   if(/derrière|derriere/.test(around))o.props.z=-1.0;
   if(/immense|géant|geant|très grand|tres grand|grand|grande/.test(around))o.props.scale=1.25;
   if(/petit|petite|minuscule/.test(around))o.props.scale=.75;
  }
 });
 const actions=[];
 if(/tombe|chute|gravité|gravite|rebond/.test(t))actions.push({kind:'fall',text:'L’objet descend sous l’effet de la gravité puis rebondit.'});
 if(/tourne|rotation|pivote/.test(t))actions.push({kind:'rotate',text:'L’objet effectue une rotation.'});
 if(/ouvre|s'ouvre|porte/.test(t))actions.push({kind:'open',text:'La porte s’ouvre progressivement.'});
 actions.push({kind:'show',text:'La scène est construite à partir de ton idée.'});
 return {version:1,mode,objects,actions,caption:'Voici une première construction locale de ton idée.',source:idea};
}
function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function cubeMesh(w,h,d,color,x=0,y=0,z=0){
 const a=w/2,b=h/2,c=d/2;
 return {color,vertices:[[-a+x,-b+y,-c+z],[a+x,-b+y,-c+z],[a+x,b+y,-c+z],[-a+x,b+y,-c+z],[-a+x,-b+y,c+z],[a+x,-b+y,c+z],[a+x,b+y,c+z],[-a+x,b+y,c+z]],faces:[[0,1,2,3],[5,4,7,6],[4,0,3,7],[1,5,6,2],[3,2,6,7],[4,5,1,0]]};
}
function sphereMesh(r,color,x=0,y=0,z=0,sx=1,sy=1,sz=1){
 const v=[],f=[],rings=8,segments=12;
 for(let j=0;j<=rings;j++){const a=Math.PI*j/rings;for(let i=0;i<segments;i++){const b=2*Math.PI*i/segments;v.push([x+Math.sin(a)*Math.cos(b)*r*sx,y+Math.cos(a)*r*sy,z+Math.sin(a)*Math.sin(b)*r*sz])}}
 for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const n=j*segments+i,m=j*segments+(i+1)%segments;f.push([n,m,m+segments,n+segments])}
 return {color,vertices:v,faces:f};
}
function cylinderMesh(r,h,color,x=0,y=0,z=0,topR=r){
 const v=[],f=[],n=12;
 for(let ring=0;ring<2;ring++){const rr=ring?topR:r,yy=y+(ring ? 0.5 : -0.5)*h;for(let i=0;i<n;i++){const a=2*Math.PI*i/n;v.push([x+Math.cos(a)*rr,yy,z+Math.sin(a)*rr])}}
 for(let i=0;i<n;i++)f.push([i,(i+1)%n,(i+1)%n+n,i+n]);
 f.push(Array.from({length:n},(_,i)=>i).reverse(),Array.from({length:n},(_,i)=>i+n));
 return {color,vertices:v,faces:f};
}
function roofMesh(color){
 return {color,vertices:[[-.9,.48,-.68],[.9,.48,-.68],[0,1.2,-.68],[-.9,.48,.68],[.9,.48,.68],[0,1.2,.68]],faces:[[0,1,2],[5,4,3],[0,3,4,1],[0,2,5,3],[1,4,5,2]]};
}
function modelParts(type,color){
 if(type==='house')return [cubeMesh(1.5,.95,1.2,'#E8B66A',0,-.1,0),roofMesh('#C65A45'),cubeMesh(.28,.48,.05,'#71452F',0,-.32,.63),cubeMesh(.25,.22,.05,'#9BE0FF',-.48,-.05,.63),cubeMesh(.25,.22,.05,'#9BE0FF',.48,-.05,.63)];
 if(type==='tree')return [cylinderMesh(.13,.85,'#95613D',0,-.3,0),sphereMesh(.53,'#58D68D',0,.42,0,.95,1.05,.95),sphereMesh(.38,'#70E09A',-.22,.68,.05)];
 if(type==='car')return [cubeMesh(1.5,.38,.72,color,0,-.1,0),cubeMesh(.78,.42,.62,'#9BE0FF',-.08,.27,0),sphereMesh(.2,'#20283B',-.48,-.31,.38,1,1,.55),sphereMesh(.2,'#20283B',.48,-.31,.38,1,1,.55),sphereMesh(.2,'#20283B',-.48,-.31,-.38,1,1,.55),sphereMesh(.2,'#20283B',.48,-.31,-.38,1,1,.55)];
 if(type==='robot')return [cubeMesh(.62,.62,.48,color,0,-.08,0),cubeMesh(.72,.72,.56,'#A8C8E8',0,.66,0),sphereMesh(.09,'#FFFFFF',-.17,.72,.29),sphereMesh(.09,'#FFFFFF',.17,.72,.29),cylinderMesh(.09,.5,'#A8C8E8',-.48,-.25,0),cylinderMesh(.09,.5,'#A8C8E8',.48,-.25,0)];
 if(type==='dragon')return [sphereMesh(.52,color,-.05,0,0,1.45,.72,.72),sphereMesh(.25,color,.62,.22,.02),sphereMesh(.18,'#FFD166',.78,.17,.18),roofMesh('#B892FF'),cylinderMesh(.09,.8,color,-.66,-.05,0,.025),sphereMesh(.16,color,-.5,-.28,.32),sphereMesh(.16,color,.28,-.28,.32)];
 if(type==='table')return [cubeMesh(1.5,.16,.85,color,0,.22,0),cubeMesh(.13,.75,.13,'#95613D',-.58,-.2,-.28),cubeMesh(.13,.75,.13,'#95613D',.58,-.2,-.28),cubeMesh(.13,.75,.13,'#95613D',-.58,-.2,.28),cubeMesh(.13,.75,.13,'#95613D',.58,-.2,.28)];
 if(type==='ball'||type==='sun')return [sphereMesh(.55,color)];
 return [cubeMesh(.9,.9,.9,color)];
}
function project3D(p,s,rot){
 const c=Math.cos(rot),q=Math.sin(rot),x=p[0]*c-p[2]*q,z=p[0]*q+p[2]*c;
 return {x:(x-z)*.67*s,y:(-p[1]*.9+(x+z)*.28)*s,depth:x+z-p[1]*.2};
}
function shadeColor(hex,k){
 const n=parseInt(hex.slice(1),16),r=Math.min(255,Math.round(((n>>16)&255)*k)),g=Math.min(255,Math.round(((n>>8)&255)*k)),b=Math.min(255,Math.round((n&255)*k));
 return 'rgb('+r+','+g+','+b+')';
}
function drawModel3D(ctx,o,s,time){
 const parts=modelParts(o.type,o.color),rot=time*.22;
 const faces=[];
 parts.forEach(part=>part.faces.forEach(face=>{
  const pts=face.map(i=>project3D(part.vertices[i],s,rot));
  const depth=pts.reduce((a,p)=>a+p.depth,0)/pts.length;
  let light=.78;
  if(pts.length>=3){const a=pts[0],b=pts[1],c=pts[2],ux=b.x-a.x,uy=b.y-a.y,vx=c.x-a.x,vy=c.y-a.y;light=Math.max(.48,Math.min(1.12,.78+Math.abs(ux*vy-uy*vx)/(s*s)*.12))}
  faces.push({pts,depth,color:shadeColor(part.color,light)});
 }));
 faces.sort((a,b)=>a.depth-b.depth);
 faces.forEach(face=>{ctx.beginPath();ctx.moveTo(face.pts[0].x,face.pts[0].y);for(let i=1;i<face.pts.length;i++)ctx.lineTo(face.pts[i].x,face.pts[i].y);ctx.closePath();ctx.fillStyle=face.color;ctx.fill();ctx.strokeStyle='rgba(8,12,30,.55)';ctx.lineWidth=1;ctx.stroke()});
}
function drawObject(ctx,o,cx,cy,s,time,mode){
 s*=o.props.scale||1;const x=cx+((o.props.x||0)-(o.props.z||0)*.55)*s,y=cy-(o.props.y||0)*s;
 ctx.save();ctx.translate(x,y);ctx.fillStyle=o.color;ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=2;
 if(mode==='3D'){drawModel3D(ctx,o,s,time)}else{
 const depth=0;
 if(o.type==='house'){
  ctx.fillStyle='#E8B66A';rounded(ctx,-s*.75,-s*.2,s*1.5,s*.95,5);
  ctx.fillStyle='#C65A45';ctx.beginPath();ctx.moveTo(-s*.9,-s*.2);ctx.lineTo(0,-s*.95);ctx.lineTo(s*.9,-s*.2);ctx.closePath();ctx.fill();
  ctx.fillStyle='#71452F';rounded(ctx,-s*.16,s*.25,s*.32,s*.5,3);
  ctx.fillStyle='#9BE0FF';ctx.fillRect(-s*.55,s*.02,s*.25,s*.23);ctx.fillRect(s*.3,s*.02,s*.25,s*.23);
  if(depth){ctx.fillStyle='#A87949';ctx.beginPath();ctx.moveTo(s*.75,-s*.2);ctx.lineTo(s*.75+depth,-s*.2-depth*.5);ctx.lineTo(s*.75+depth,s*.75-depth*.5);ctx.lineTo(s*.75,s*.75);ctx.fill();}
 }else if(o.type==='tree'){
  ctx.fillStyle='#95613D';ctx.fillRect(-s*.11,-s*.05,s*.22,s*.8);
  ctx.fillStyle=o.color;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(0,-s*(.35+i*.24),s*(.43-i*.04),0,Math.PI*2);ctx.fill();}
 }else if(o.type==='car'){
  ctx.fillStyle=o.color;rounded(ctx,-s*.75,-s*.18,s*1.5,s*.48,10);
  ctx.fillStyle='#BDEBFF';rounded(ctx,-s*.4,-s*.48,s*.8,s*.36,8);
  ctx.fillStyle='#182033';for(const wx of [-.48,.48]){ctx.beginPath();ctx.arc(wx*s,s*.3,s*.16,0,Math.PI*2);ctx.fill();}
 }else if(o.type==='ball'||o.type==='sun'){
  ctx.beginPath();ctx.arc(0,0,s*.48,0,Math.PI*2);
  if(mode==='3D'){const g=ctx.createRadialGradient(-s*.18,-s*.2,s*.04,0,0,s*.5);g.addColorStop(0,'#FFFFFF');g.addColorStop(.22,o.color);g.addColorStop(1,'#26304A');ctx.fillStyle=g}else ctx.fillStyle=o.color;
  ctx.fill();ctx.globalAlpha=.35;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-s*.15,-s*.16,s*.13,0,Math.PI*2);ctx.fill();
 }else if(o.type==='robot'){
  rounded(ctx,-s*.42,-s*.75,s*.84,s*.65,12);rounded(ctx,-s*.32,-s*.03,s*.64,s*.7,9);
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-s*.17,-s*.48,s*.07,0,Math.PI*2);ctx.arc(s*.17,-s*.48,s*.07,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=o.color;ctx.lineWidth=s*.1;ctx.beginPath();ctx.moveTo(-s*.25,s*.66);ctx.lineTo(-s*.38,s*.95);ctx.moveTo(s*.25,s*.66);ctx.lineTo(s*.38,s*.95);ctx.stroke();
 }else if(o.type==='dragon'){
  ctx.beginPath();ctx.ellipse(0,0,s*.58,s*.28,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(-s*.1,-s*.05);ctx.lineTo(-s*.85,-s*.65);ctx.lineTo(-s*.55,s*.15);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.arc(s*.48,-s*.22,s*.22,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=o.color;ctx.lineWidth=s*.08;ctx.beginPath();ctx.moveTo(-s*.25,s*.2);ctx.lineTo(-s*.55,s*.55);ctx.moveTo(s*.2,s*.2);ctx.lineTo(s*.45,s*.5);ctx.stroke();
 }else if(o.type==='table'){
  ctx.fillRect(-s*.65,-s*.12,s*1.3,s*.18);ctx.fillRect(-s*.52,s*.05,s*.12,s*.55);ctx.fillRect(s*.4,s*.05,s*.12,s*.55);
 }else if(o.type==='cube'&&mode==='3D'){
  ctx.fillStyle=o.color;ctx.fillRect(-s*.42,-s*.32,s*.84,s*.84);
  ctx.fillStyle='rgba(255,255,255,.24)';ctx.beginPath();ctx.moveTo(-s*.42,-s*.32);ctx.lineTo(-s*.12,-s*.55);ctx.lineTo(s*.72,-s*.55);ctx.lineTo(s*.42,-s*.32);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.moveTo(s*.42,-s*.32);ctx.lineTo(s*.72,-s*.55);ctx.lineTo(s*.72,s*.29);ctx.lineTo(s*.42,s*.52);ctx.closePath();ctx.fill();
 }else{
  ctx.fillRect(-s*.42,-s*.42,s*.84,s*.84);
  if(depth){ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.moveTo(s*.42,-s*.42);ctx.lineTo(s*.42+depth,-s*.42-depth*.5);ctx.lineTo(s*.42+depth,s*.42-depth*.5);ctx.lineTo(s*.42,s*.42);ctx.fill();}
 }
 }
 ctx.restore();
 ctx.fillStyle='#F4F7FF';ctx.font='600 13px system-ui';ctx.textAlign='center';ctx.fillText(o.label,x,y+s*.82);
}
function create(idea){return detect(idea)}
function geometryInfo(type,color){const parts=modelParts(type,color||'#58A6FF');return {parts:parts.length,vertices:parts.reduce((n,p)=>n+p.vertices.length,0),faces:parts.reduce((n,p)=>n+p.faces.length,0),valid:parts.every(p=>p.faces.every(f=>f.length>=3&&f.every(i=>Number.isInteger(i)&&i>=0&&i<p.vertices.length)))}}
function play(canvas,scene,onCaption,onDone){
 const ctx=canvas.getContext('2d');let raf=0,start=0,stopped=false;
 const resize=()=>{const dpr=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};
 resize();window.addEventListener('resize',resize);
 const frame=t=>{
  if(stopped)return;if(!start)start=t;const sec=(t-start)/1000,w=innerWidth,h=innerHeight;
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#0A0D1F';ctx.fillRect(0,0,w,h);
  const horizon=h*.72;ctx.strokeStyle='rgba(255,184,77,.22)';ctx.lineWidth=1;
  for(let i=0;i<12;i++){ctx.beginPath();ctx.moveTo(0,horizon+i*i*2);ctx.lineTo(w,horizon+i*i*2);ctx.stroke();}
  const size=Math.min(w*.2,h*.22), spacing=Math.min(w*.29,size*1.5);
  scene.objects.forEach((o,i)=>{
   const bob=scene.actions.some(a=>a.kind==='fall')?Math.abs(Math.sin(sec*2.5))*size*.35:Math.sin(sec*1.1+i)*size*.025;
   const angle=scene.actions.some(a=>a.kind==='rotate')?sec:0;
   ctx.save();const x=w/2+(i-(scene.objects.length-1)/2)*spacing;
   ctx.translate(x,horizon-size*.6-bob);ctx.rotate(angle*.2);
   drawObject(ctx,o,0,0,size,sec,scene.mode);ctx.restore();
  });
  ctx.fillStyle='#FFB84D';ctx.font='700 12px system-ui';ctx.textAlign='center';ctx.fillText('IDÉE VISION • MODE '+scene.mode,w/2,38);
  if(sec<1.5){onCaption(scene.caption)}else if(sec<5){onCaption(scene.actions[0]?.text||scene.caption)}else{onCaption('Construction locale terminée.')}
  if(sec>=8){stopped=true;window.removeEventListener('resize',resize);if(onDone)onDone();return}
  raf=requestAnimationFrame(frame);
 };
 raf=requestAnimationFrame(frame);
 return ()=>{stopped=true;cancelAnimationFrame(raf);window.removeEventListener('resize',resize)};
}
window.IdeeVisionOffline=Object.freeze({version:1,create,play,geometryInfo});
})();