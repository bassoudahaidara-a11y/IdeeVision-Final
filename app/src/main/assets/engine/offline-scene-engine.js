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
 const count=(t.match(/\b(deux|2|trois|3|quatre|4|cinq|5)\b/g)||[]).length;
 const actions=[];
 if(/tombe|chute|gravité|gravite|rebond/.test(t))actions.push({kind:'fall',text:'L’objet descend sous l’effet de la gravité puis rebondit.'});
 if(/tourne|rotation|pivote/.test(t))actions.push({kind:'rotate',text:'L’objet effectue une rotation.'});
 if(/ouvre|s'ouvre|porte/.test(t))actions.push({kind:'open',text:'La porte s’ouvre progressivement.'});
 actions.push({kind:'show',text:'La scène est construite à partir de ton idée.'});
 return {version:1,mode,objects,actions,caption:'Voici une première construction locale de ton idée.',source:idea};
}
function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function drawObject(ctx,o,cx,cy,s,time,mode){
 const x=cx+(o.props.x||0)*s,y=cy+(o.props.y||0)*s;
 ctx.save();ctx.translate(x,y);ctx.fillStyle=o.color;ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=2;
 const depth=mode==='3D'?s*.22:0;
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
 ctx.restore();
 ctx.fillStyle='#F4F7FF';ctx.font='600 13px system-ui';ctx.textAlign='center';ctx.fillText(o.label,x,y+s*.82);
}
function create(idea){return detect(idea)}
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
 return ()=>{stopped=true;cancelAnimationFrame(raf);window.removeEventListener('resize',resize);onDone&&onDone()};
}
window.IdeeVisionOffline=Object.freeze({version:1,create,play});
})();