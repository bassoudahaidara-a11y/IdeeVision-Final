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
  for(let z=-5;z<=5;z+=3)for(let x=-5;x<=5;x+=3){if((x+z)%2===0)add('tree',x,z,.9);else{add('house',x,z,.8+(Math.abs(x-z)%3)*.12);elements[elements.length-1].door={side:'south',width:.25,height:.57};elements[elements.length-1].interior={rooms:['entrée','séjour','cuisine','chambre'],stairs:false,levels:1,layout:[{name:'séjour',x:-.45,z:-.35},{name:'cuisine',x:.45,z:-.35},{name:'chambre',x:.45,z:.4}]}}}
 }else{
  const blocks=[[-4,-4],[-1,-4],[2,-4],[5,-4],[-4,-1],[2,-1],[5,-1],[-4,2],[-1,2],[2,2],[5,2],[-4,5],[-1,5],[2,5],[5,5]];
  blocks.forEach(([x,z],i)=>{if(i%4===0)add('park',x,z,1);else{add('building',x,z,.8+(i%3)*.18,i%4);const b=elements[elements.length-1];b.floors=2+(i%4);b.door={side:'south',width:.28,height:.42};b.interior={rooms:['entrée','séjour','cuisine'],stairs:true,levels:b.floors,layout:[{name:'entrée',x:-.45,z:-.35},{name:'séjour',x:.45,z:-.35},{name:'cuisine',x:-.45,z:.4}]}}});
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
function getInteriorRoomConnections(rooms,customConnections){
 const names=Array.isArray(rooms)?rooms.map(v=>String(v)):[],links=[];
 if(Array.isArray(customConnections)){
  customConnections.forEach((item,i)=>{
   if(!item||typeof item!=='object')return;
   const from=String(item.from||''),to=String(item.to||'');
   if(!names.includes(from)||!names.includes(to)||from===to)return;
   const side=['back','left','right','front'].includes(item.side)?item.side:['back','left','right'][i%3];
   links.push({from,to,doorId:String(item.doorId||'door-'+i),side,width:Math.max(.2,Math.min(.7,Number(item.width)||.44)),openable:item.openable!==false});
  });
  return links;
 }
 if(names.length<2)return links;
 const find=(pattern)=>names.find(n=>pattern.test(n.toLowerCase()));
 const entry=find(/entrée|entree|hall/),living=find(/séjour|sejour|salon/),kitchen=find(/cuisine/),bedroom=find(/chambre/);
 if(entry&&living){
  links.push({from:entry,to:living,doorId:'door-entry-living',side:'back',width:.44,openable:true});
  if(kitchen)links.push({from:living,to:kitchen,doorId:'door-living-kitchen',side:'right',width:.42,openable:true});
  if(bedroom)links.push({from:living,to:bedroom,doorId:'door-living-bedroom',side:'left',width:.42,openable:true});
  const connected=new Set(links.flatMap(l=>[l.from,l.to]));
  names.filter(n=>!connected.has(n)).forEach((n,i)=>{
   const previous=names[names.indexOf(n)-1]||living;
   links.push({from:previous,to:n,doorId:'door-extra-'+i,side:['back','right','left'][i%3],width:.4,openable:true});
  });
  return links;
 }
 for(let i=0;i<names.length-1;i++)links.push({from:names[i],to:names[i+1],doorId:'door-'+i,side:['back','right','left'][i%3],width:.44,openable:true});
 return links;
}
function getConnectedRoomOptions(rooms,currentIndex,connections){
 if(!Array.isArray(rooms)||!rooms.length)return [];
 const index=Math.max(0,Math.min(rooms.length-1,Number(currentIndex)||0)),current=rooms[index];
 return getInteriorRoomConnections(rooms,connections).flatMap(link=>{
  if(!link.openable)return [];
  if(link.from===current)return [{target:link.to,targetIndex:rooms.indexOf(link.to),doorId:link.doorId,side:link.side,width:link.width,direction:'forward'}];
  if(link.to===current)return [{target:link.from,targetIndex:rooms.indexOf(link.from),doorId:link.doorId,side:link.side,width:link.width,direction:'backward'}];
  return [];
 }).filter(option=>option.targetIndex>=0);
}
function getNextConnectedRoomIndex(rooms,currentIndex,selectedOptionIndex,connections){
 const options=getConnectedRoomOptions(rooms,currentIndex,connections);
 if(!options.length)return Math.max(0,Number(currentIndex)||0);
 const selected=Math.max(0,Math.min(options.length-1,Number(selectedOptionIndex)||0));
 return options[selected].targetIndex;
}
function getInteriorRoomModel(roomName,doorways){
 const name=String(roomName||'séjour').toLowerCase();
 const furniture=/cuisine/.test(name)
  ?[{id:'plan-de-travail',left:.12,right:.72,top:-.22,bottom:.14,height:.34,color:'#927052'},{id:'ilot',left:-.58,right:-.22,top:.25,bottom:.58,height:.28,color:'#B5A58C'}]
  :/chambre/.test(name)
   ?[{id:'lit',left:-.62,right:-.06,top:-.24,bottom:.22,height:.24,color:'#7D9DBB'},{id:'armoire',left:.43,right:.72,top:.25,bottom:.68,height:.62,color:'#76513C'}]
   :[{id:'canape',left:-.38,right:.34,top:-.18,bottom:.12,height:.3,color:'#6D4937'},{id:'table-basse',left:-.22,right:.22,top:.35,bottom:.57,height:.16,color:'#A68A6D'}];
 return {
  name:roomName||'séjour',
  bounds:{left:-.88,right:.88,top:-.88,bottom:.88},
  walls:[
   {side:'left',from:-.88,to:.88,height:.9},
   {side:'right',from:-.88,to:.88,height:.9},
   {side:'back-left',from:-.88,to:-.22,height:.9},
   {side:'back-right',from:.22,to:.88,height:.9},
   {side:'back-lintel',from:-.22,to:.22,height:.28}
  ],
  doorway:{side:'back',left:-.22,right:.22,width:.44,headerHeight:.28,wallOpening:true},
  doorways:Array.isArray(doorways)?doorways.map(d=>({doorId:d.doorId,target:d.target,side:d.side,width:d.width})):[],
  windows:[
   {id:'window-left',side:'left',position:-.42,width:.34,height:.3,sill:.38},
   {id:'window-right',side:'right',position:.38,width:.3,height:.28,sill:.42}
  ],
  architecture:{skirtingHeight:.07,trimWidth:.035,ceilingHeight:.9,floorPattern:/cuisine/.test(name)?'tiles':/chambre/.test(name)?'wood':'planks'},
  lighting:getInteriorLighting(roomName),
  furniture
 };
}
function getInteriorWindows(roomName){
 const modelName=String(roomName||'').toLowerCase();
 const windows=[{id:'window-left',side:'left',position:-.42,width:.34,height:.3,sill:.38},{id:'window-right',side:'right',position:.38,width:.3,height:.28,sill:.42}];
 return windows.map(w=>Object.assign({},w,{room:modelName}));
}
function getInteriorLighting(roomName){
 const name=String(roomName||'').toLowerCase();
 const windowCount=getInteriorWindows(name).length;
 const ambient=/cuisine/.test(name)?.62:/chambre/.test(name)?.56:.6;
 return {ambient,windowLight:Math.min(.3,windowCount*.12),brightness:Math.min(1,ambient+windowCount*.12),direction:'left-to-right'};
}
function getNearbyFurniture(x,z,roomName,maxDistance){
 const limit=Number.isFinite(Number(maxDistance))?Math.max(0,Number(maxDistance)):.42;
 const furniture=getInteriorRoomModel(roomName).furniture;
 let best=null,bestDistance=Infinity;
 furniture.forEach(item=>{
  const qx=Math.max(item.left,Math.min(item.right,x));
  const qz=Math.max(item.top,Math.min(item.bottom,z));
  const distance=Math.hypot(x-qx,z-qz);
  if(distance<=limit&&distance<bestDistance){bestDistance=distance;best={id:item.id,label:item.id.replace(/-/g,' '),distance,action:'inspect'};}
 });
 return best;
}
function interactWithFurniture(roomName,furnitureId,states){
 const valid=getInteriorRoomModel(roomName).furniture.find(item=>item.id===furnitureId);
 if(!valid)return {ok:false,state:null,message:'Meuble introuvable.'};
 const next=Object.assign({},states||{}),opened=next[furnitureId]!=='open';
 next[furnitureId]=opened?'open':'closed';
 return {ok:true,state:next[furnitureId],states:next,message:opened?'Tu examines '+furnitureId.replace(/-/g,' ')+'.':'Tu termines l’interaction avec '+furnitureId.replace(/-/g,' ')+'.'};
}
function interactWithNearbyFurniture(x,z,roomName,states,maxDistance){
 const nearby=getNearbyFurniture(x,z,roomName,maxDistance);
 if(!nearby)return {ok:false,nearby:null,states:states||{},message:'Approche-toi d’un meuble pour interagir.'};
 const result=interactWithFurniture(roomName,nearby.id,states);
 return Object.assign({nearby},result);
}
function getInteriorTouchLayout(width,height){
 const w=Math.max(200,Number(width)||200),h=Math.max(160,Number(height)||160);
 const buttonWidth=Math.min(92,Math.max(64,(w-32)/3));
 const spacing=Math.min(106,Math.max(buttonWidth/2+5,(w-buttonWidth)/2-8));
 const center=w/2;
 return {buttonWidth,centers:[center-spacing,center,center+spacing],top:h-94,bottom:h-46,centerY:h-70};
}
function getInteriorTouchAction(x,y,width,height){
 const layout=getInteriorTouchLayout(width,height);
 if(y<layout.top||y>layout.bottom)return 'none';
 let nearest=-1,distance=Infinity;
 layout.centers.forEach((center,index)=>{const d=Math.abs(x-center);if(d<distance){distance=d;nearest=index;}});
 if(distance>layout.buttonWidth/2+4)return 'none';
 return ['door','examine','select-door'][nearest]||'none';
}
function selectNextInteriorDoor(options,selectedIndex){
 const doors=Array.isArray(options)?options:[];
 if(!doors.length)return {selectedIndex:0,doorOpen:0,doorTarget:0,choice:null,message:'Aucune autre pièce reliée.'};
 const current=Number.isFinite(Number(selectedIndex))?Math.floor(Number(selectedIndex)):0;
 const next=((current+1)%doors.length),choice=doors[next]||doors[0];
 return {selectedIndex:next,doorOpen:0,doorTarget:0,choice,message:'Porte choisie : '+String(choice.target||'Pièce inconnue')+' ('+String(choice.side||'inconnu')+').'};
}
function getInteriorInteractionStatus(doorOpen,doorTarget,selectedDoor,nearDoor,nearbyFurniture){
 const open=Number(doorOpen)||0,target=Number(doorTarget)||0;
 const doorState=target>.5&&open<.7?'OUVERTURE':open>.7?'OUVERTE':target>.5?'OUVERTURE':'FERMÉE';
 const passage=!selectedDoor?'AUCUNE ISSUE':open<=.7?'OUVRE LA PORTE':nearDoor?'PASSAGE ACCESSIBLE':'APPROCHE-TOI DE LA PORTE';
 const furniture=nearbyFurniture?'MEUBLE À EXAMINER':'AUCUN MEUBLE PROCHE';
 return {doorState,passage,furniture,canPass:!!selectedDoor&&open>.7&&!!nearDoor,canExamine:!!nearbyFurniture};
}
function getInteriorDoorIndicator(options,selectedIndex){
 const doors=Array.isArray(options)?options:[];
 if(!doors.length)return {available:false,index:0,count:0,label:'AUCUNE PORTE',target:null,side:null};
 const raw=Number.isFinite(Number(selectedIndex))?Math.floor(Number(selectedIndex)):0;
 const index=((raw%doors.length)+doors.length)%doors.length,door=doors[index]||{};
 const target=String(door.target||'Pièce inconnue'),side=String(door.side||'inconnu');
 return {available:true,index:index+1,count:doors.length,target,side,label:'PORTE '+(index+1)+'/'+doors.length+' : '+target.toLocaleUpperCase('fr')};
}
function getInteriorTouchLabels(doorOpen,doorTarget,doorCount,nearbyFurniture){
 return {
  door:doorTarget>.5||doorOpen>.5?'FERMER':'OUVRIR',
  examine:nearbyFurniture?'EXAMINER':'MEUBLE',
  selectDoor:doorCount>0?'PORTE SUIV.':'SANS PORTE',
  examineEnabled:!!nearbyFurniture,
  selectDoorEnabled:doorCount>0
 };
}
function getInteriorDoorThreshold(side){
 if(side==='left')return {x:-.79,z:0};
 if(side==='right')return {x:.79,z:0};
 if(side==='front')return {x:0,z:.79};
 return {x:0,z:-.79};
}
function isNearInteriorDoor(x,z,side,tolerance){
 const point=getInteriorDoorThreshold(side),limit=Number(tolerance)||.24;
 return Math.hypot(x-point.x,z-point.z)<=limit;
}
function getInteriorLevelEntryState(level){
 const value=Number.isFinite(Number(level))?Math.max(0,Math.floor(Number(level))):0;
 return {level:value,roomIndex:0,selectedDoorIndex:0,x:0,z:.55,doorOpen:0,doorTarget:0};
}
function getInteriorLevelIndicator(level,levels,hasStairs){
 const max=Math.max(1,Math.floor(Number(levels)||1));
 const current=Math.max(0,Math.min(max-1,Math.floor(Number(level)||0)));
 const floorName=current===0?'REZ-DE-CHAUSSÉE':'ÉTAGE '+(current+1);
 const stairs=!!hasStairs&&max>1;
 return {level:current+1,total:max,floorName,stairs,up:stairs&&current<max-1,down:stairs&&current>0,label:floorName+' • '+(current+1)+'/'+max,action:!stairs?'AUCUN ESCALIER':current===0?'MONTER':current===max-1?'DESCENDRE':'MONTER / DESCENDRE'};
}
function changeInteriorLevel(level,levels,direction,hasStairs){
 const max=Math.max(1,Math.floor(Number(levels)||1)),current=Math.max(0,Math.min(max-1,Math.floor(Number(level)||0)));
 if(!hasStairs||max<2)return {level:current,changed:false,reason:'no-stairs'};
 const next=Math.max(0,Math.min(max-1,current+(direction<0?-1:1)));
 return {level:next,changed:next!==current,reason:next===current?'limit':'changed'};
}
function resolveInteriorMovement(x,z,dx,dz,roomName,doorOpen,doorSide){
 const radius=.085,model=getInteriorRoomModel(roomName),b=model.bounds,side=doorSide||'back';
 const obstacles=model.furniture;
 const blocked=(px,pz)=>{
  const atOpening=side==='left'?px<b.left+.2&&Math.abs(pz)<.22:
   side==='right'?px>b.right-.2&&Math.abs(pz)<.22:
   side==='front'?pz>b.bottom-.2&&Math.abs(px)<.22:
   pz<b.top+.2&&Math.abs(px)<model.doorway.width/2;
  if(atOpening&&doorOpen<.7)return true;
  return obstacles.some(o=>{
   const qx=Math.max(o.left,Math.min(o.right,px));
   const qz=Math.max(o.top,Math.min(o.bottom,pz));
   return Math.hypot(px-qx,pz-qz)<radius;
  });
 };
 let nx=Math.max(b.left,Math.min(b.right,x+dx));
 if(blocked(nx,z))nx=x;
 let nz=Math.max(b.top,Math.min(b.bottom,z+dz));
 if(blocked(nx,nz))nz=z;
 return {x:nx,z:nz,blockedX:nx!==x+dx,blockedZ:nz!==z+dz,nearDoor:isNearInteriorDoor(nx,nz,side)};
}
function play(canvas,world,onCaption){
 const ctx=canvas.getContext('2d');let raf=0,stopped=false,yaw=.65,zoom=1,drag=false,lastX=0,lastY=0,pitch=.35,w=0,h=0,cameraX=0,cameraZ=0,moveX=0,moveZ=0,inside=null,pointerStart=null;
 const resize=()=>{const d=Math.min(root.devicePixelRatio||1,2);canvas.width=canvas.clientWidth*d;canvas.height=canvas.clientHeight*d;ctx.setTransform(d,0,0,d,0,0)};
 resize();root.addEventListener('resize',resize);
 const pointerDown=e=>{const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;pointerStart={x:e.clientX,y:e.clientY};if(inside){drag=false;if(x<118&&y>h-132){moveX=Math.max(-1,Math.min(1,(x-62)/42));moveZ=Math.max(-1,Math.min(1,(y-(h-72))/42));drag='interior-pad'}return}if(x<118&&y>h-132){drag=true;moveX=Math.max(-1,Math.min(1,(x-62)/42));moveZ=Math.max(-1,Math.min(1,(y-(h-72))/42));}else{drag=true;moveX=0;moveZ=0;lastX=e.clientX;lastY=e.clientY;drag='camera'}if(canvas.setPointerCapture)canvas.setPointerCapture(e.pointerId)};
 const pointerMove=e=>{if(drag==='camera'){yaw+=(e.clientX-lastX)*.008;pitch=Math.max(.12,Math.min(.72,pitch+(e.clientY-lastY)*.003));lastX=e.clientX;lastY=e.clientY}else if(drag==='interior-pad'){const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;moveX=Math.max(-1,Math.min(1,(x-62)/42));moveZ=Math.max(-1,Math.min(1,(y-(h-72))/42));}else if(drag){const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;moveX=Math.max(-1,Math.min(1,(x-62)/42));moveZ=Math.max(-1,Math.min(1,(y-(h-72))/42));}};
 const pointerUp=e=>{const wasCamera=drag==='camera',wasInteriorPad=drag==='interior-pad',start=pointerStart;drag=false;moveX=0;moveZ=0;if(!start||!e)return;const moved=Math.hypot(e.clientX-start.x,e.clientY-start.y);pointerStart=null;if(moved>9)return;if(inside){if(wasInteriorPad)return;const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;const touchAction=getInteriorTouchAction(x,y,w,h);if(touchAction==='door'){inside.doorTarget=inside.doorTarget?0:1;onCaption(inside.doorTarget?'La porte s’ouvre.':'La porte se ferme.');}else if(touchAction==='examine'){const rooms=inside.building.interior.rooms||['séjour'],name=rooms[inside.roomIndex]||rooms[0],result=interactWithNearbyFurniture(inside.x,inside.z,name,inside.furnitureStates,.5);if(result.ok){inside.furnitureStates=result.states;inside.selectedFurnitureId=result.nearby.id;}onCaption(result.message);}else if(touchAction==='select-door'){const rooms=inside.building.interior.rooms||['séjour'],options=getConnectedRoomOptions(rooms,inside.roomIndex,inside.building.interior.connections);if(options.length){const selection=selectNextInteriorDoor(options,inside.selectedDoorIndex);inside.selectedDoorIndex=selection.selectedIndex;inside.doorOpen=selection.doorOpen;inside.doorTarget=selection.doorTarget;onCaption(selection.message)}else onCaption('Aucune autre pièce reliée.');}else if(x>w*.5-62&&x<w*.5+62&&y>h-100&&y<h-42){const rooms=inside.building.interior.rooms||['séjour'],name=rooms[inside.roomIndex]||rooms[0],result=interactWithNearbyFurniture(inside.x,inside.z,name,inside.furnitureStates,.5);if(result.ok){inside.furnitureStates=result.states;inside.selectedFurnitureId=result.nearby.id;}onCaption(result.message);}else if(x>w*.9&&y>h*.58&&inside.building.interior.stairs){const change=changeInteriorLevel(inside.level,inside.building.interior.levels,1,true);if(change.changed){Object.assign(inside,getInteriorLevelEntryState(change.level));onCaption('Tu montes au niveau '+(inside.level+1)+'.')}else onCaption('Tu es déjà au dernier étage.')}else if(x>w*.78&&y<h*.42&&inside.building.interior.stairs){const change=changeInteriorLevel(inside.level,inside.building.interior.levels,-1,true);if(change.changed){Object.assign(inside,getInteriorLevelEntryState(change.level));onCaption('Tu descends au niveau '+(inside.level+1)+'.')}else onCaption('Tu es déjà au rez-de-chaussée.')}else if(y>h*.78&&isNearInteriorDoor(inside.x,inside.z,'front',.3)){inside=null;onCaption('Tu es ressorti du bâtiment.')}else if(x<w*.34){inside.doorTarget=inside.doorTarget?0:1;onCaption(inside.doorTarget?'La porte s’ouvre.':'La porte se ferme.')}else if(inside.doorOpen>.7&&x>w*.68){const options=getConnectedRoomOptions(inside.building.interior.rooms,inside.roomIndex,inside.building.interior.connections);if(options.length){const selection=selectNextInteriorDoor(options,inside.selectedDoorIndex);inside.selectedDoorIndex=selection.selectedIndex;inside.doorOpen=selection.doorOpen;inside.doorTarget=selection.doorTarget;onCaption(selection.message)}else onCaption('Aucune autre pièce reliée.')}else if(inside.doorOpen>.7){const options=getConnectedRoomOptions(inside.building.interior.rooms,inside.roomIndex,inside.building.interior.connections);const active=options[Math.min(inside.selectedDoorIndex||0,Math.max(0,options.length-1))];if(active&&!isNearInteriorDoor(inside.x,inside.z,active.side,.34)){onCaption('Approche-toi de la porte '+active.side+' avant de la franchir.')}else if(options.length){const selected=Math.min(inside.selectedDoorIndex||0,options.length-1),choice=options[selected];inside.roomIndex=getNextConnectedRoomIndex(inside.building.interior.rooms,inside.roomIndex,selected,inside.building.interior.connections);inside.selectedDoorIndex=0;inside.x=0;inside.z=.55;inside.doorOpen=0;inside.doorTarget=0;onCaption('Tu passes par la porte vers : '+choice.target+'.')}else onCaption('Cette pièce ne possède pas de porte reliée.')}return}const nearby=world.elements.filter(o=>(o.type==='house'||o.type==='building')&&Math.hypot(o.x-cameraX,o.z-cameraZ)<1.65).sort((a,b)=>Math.hypot(a.x-cameraX,a.z-cameraZ)-Math.hypot(b.x-cameraX,b.z-cameraZ))[0];if(nearby){inside={building:nearby,x:0,z:.55,level:0,roomIndex:0,selectedDoorIndex:0,doorOpen:0,doorTarget:0,furnitureStates:{},selectedFurnitureId:null};onCaption('Tu es entré dans '+(nearby.type==='house'?'la maison':'un immeuble')+'. Déplace-toi avec WASD ou le pavé tactile.')}};
 const keys=new Set();
 const keyDown=e=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','e','f'].includes(k)){keys.add(k);if(k==='e'&&inside&&!e.repeat){inside.doorTarget=inside.doorTarget?0:1;onCaption(inside.doorTarget?'La porte s’ouvre.':'La porte se ferme.')}if(k==='f'&&inside&&!e.repeat){const rooms=inside.building.interior.rooms||['séjour'],name=rooms[inside.roomIndex]||rooms[0],result=interactWithNearbyFurniture(inside.x,inside.z,name,inside.furnitureStates,.5);if(result.ok){inside.furnitureStates=result.states;inside.selectedFurnitureId=result.nearby.id;}onCaption(result.message)}e.preventDefault()}};
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
 function drawInterior(){
  const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#34495E');sky.addColorStop(1,'#101827');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  const cx=w*.5,top=h*.19,bottom=h*.82,half=Math.min(w*.43,250),floorY=bottom;
  const speed=.018;inside.doorOpen+=(inside.doorTarget-inside.doorOpen)*.12;
  const roomNames=inside.building.interior.rooms||['séjour'],roomName=roomNames[inside.roomIndex]||roomNames[0];
  const doorOptions=getConnectedRoomOptions(roomNames,inside.roomIndex,inside.building.interior.connections);
  const selectedDoor=doorOptions[Math.min(inside.selectedDoorIndex||0,Math.max(0,doorOptions.length-1))];
  const roomModel=getInteriorRoomModel(roomName,doorOptions);
  const dx=(keys.has('d')||keys.has('arrowright')?speed:0)-(keys.has('a')||keys.has('arrowleft')?speed:0)+moveX*speed;
  const dz=(keys.has('s')||keys.has('arrowdown')?speed:0)-(keys.has('w')||keys.has('arrowup')?speed:0)+moveZ*speed;
  const moved=resolveInteriorMovement(inside.x,inside.z,dx,dz,roomName,inside.doorOpen,selectedDoor?selectedDoor.side:'back');inside.x=moved.x;inside.z=moved.z;
  const left=cx-half,right=cx+half,back=top+70;
  poly([{x:left,y:back},{x:cx,y:top},{x:right,y:back},{x:right,y:floorY},{x:left,y:floorY}],'#B9AD98','#45413B');
  poly([{x:left,y:back},{x:cx,y:top},{x:cx,y:floorY-45},{x:left,y:floorY}],'#D7C9AE','#5C5145');
  poly([{x:cx,y:top},{x:right,y:back},{x:right,y:floorY},{x:cx,y:floorY-45}],'#B8AA91','#51483E');
  poly([{x:left,y:floorY},{x:cx,y:floorY-45},{x:right,y:floorY},{x:cx,y:h*.96}],'#776D5F','#403A34');
  // Mur du fond divisé en deux panneaux : le passage reste libre au centre.
  const doorW=half*roomModel.doorway.width*.78,doorH=(floorY-back)*.58,doorX=cx-doorW*.55,doorY=floorY-doorH;
  const wallTop=back+28,wallBottom=floorY;
  ctx.fillStyle='#A99D89';ctx.fillRect(left,wallTop,Math.max(0,doorX-left),wallBottom-wallTop);
  ctx.fillStyle='#988B78';ctx.fillRect(doorX+doorW,wallTop,Math.max(0,right-doorX-doorW),wallBottom-wallTop);
  ctx.fillStyle='#887A68';ctx.fillRect(doorX,wallTop,doorW,Math.max(0,doorY-wallTop));
  ctx.strokeStyle='#5B4939';ctx.lineWidth=5;ctx.strokeRect(doorX,doorY,doorW,doorH);
  // Porte en perspective, placée dans l'ouverture et animée sur ses gonds.
  ctx.fillStyle='#49382D';ctx.fillRect(doorX,doorY,doorW,doorH);
  ctx.save();ctx.translate(doorX+doorW,doorY+doorH*.5);ctx.rotate(-inside.doorOpen*.95);ctx.fillStyle='#95613F';ctx.fillRect(-doorW,-doorH*.5,doorW,doorH);ctx.restore();
  // Une porte secondaire est dessinée sur le mur latéral choisi.
  if(selectedDoor&&selectedDoor.side==='left'){
   const sx=left+half*.20,sw=doorW*.72,sy=floorY-doorH*.82,sh=doorH*.82;
   ctx.fillStyle='#5B4939';ctx.fillRect(sx-4,sy-4,sw+8,sh+4);
   ctx.fillStyle='#95613F';ctx.fillRect(sx,sy,sw,sh);
   ctx.strokeStyle='#D5B58A';ctx.lineWidth=2;ctx.strokeRect(sx,sy,sw,sh);
  }else if(selectedDoor&&selectedDoor.side==='right'){
   const sx=right-half*.43,sw=doorW*.72,sy=floorY-doorH*.82,sh=doorH*.82;
   ctx.fillStyle='#51483E';ctx.fillRect(sx-4,sy-4,sw+8,sh+4);
   ctx.fillStyle='#95613F';ctx.fillRect(sx,sy,sw,sh);
   ctx.strokeStyle='#D5B58A';ctx.lineWidth=2;ctx.strokeRect(sx,sy,sw,sh);
  }
  // Fenêtre et mobilier schématique en volume.
  ctx.fillStyle='#75B6D5';ctx.fillRect(left+half*.18,back+45,half*.27,doorH*.35);ctx.strokeStyle='#E5E9E7';ctx.lineWidth=4;ctx.strokeRect(left+half*.18,back+45,half*.27,doorH*.35);
  // Meubles en volumes bas-poly : dessus, face avant et côté.
  const floorDepth=(floorY-back)*.52;
  // Encadrements de fenêtres et lumière douce projetée dans la pièce.
  const windowY=back+48,windowH=doorH*.34;
  roomModel.windows.forEach((win,index)=>{
   const wx=win.side==='left'?left+half*.17:right-half*.44;
   const ww=half*win.width*.55,wy=windowY+index*5;
   ctx.fillStyle='#5A4637';ctx.fillRect(wx-5,wy-5,ww+10,windowH+10);
   ctx.fillStyle='#82C6E5';ctx.fillRect(wx,wy,ww,windowH);
   ctx.strokeStyle='#F1E8D7';ctx.lineWidth=3;ctx.strokeRect(wx,wy,ww,windowH);
   ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(wx+ww*.5,wy);ctx.lineTo(wx+ww*.5,wy+windowH);ctx.moveTo(wx,wy+windowH*.5);ctx.lineTo(wx+ww,wy+windowH*.5);ctx.stroke();
   ctx.fillStyle='rgba(255,231,166,.12)';ctx.beginPath();ctx.moveTo(wx+ww,wy+windowH);ctx.lineTo(cx+half*.35,floorY);ctx.lineTo(cx-half*.12,floorY);ctx.closePath();ctx.fill();
  });
  // Plinthes et moulures : détails simples, peu coûteux à dessiner.
  ctx.strokeStyle='#6F5E4C';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(left+8,floorY-7);ctx.lineTo(cx,floorY-52);ctx.lineTo(right-8,floorY-7);ctx.stroke();
  ctx.strokeStyle='rgba(245,235,215,.75)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(left+8,back+25);ctx.lineTo(cx,top+8);ctx.lineTo(right-8,back+25);ctx.stroke();
  // Meubles en volumes bas-poly : dessus, face avant et côté.
  const nearbyFurniture=getNearbyFurniture(inside.x,inside.z,roomName,.5);
  inside.selectedFurnitureId=nearbyFurniture?nearbyFurniture.id:null;
  roomModel.furniture.forEach(item=>{
   const sx=cx+item.left*half*.72,ex=cx+item.right*half*.72;
   const sy=floorY-(item.bottom+.88)*floorDepth,ey=floorY-(item.top+.88)*floorDepth;
   const lift=item.height*(floorY-back)*.48;
   ctx.fillStyle=item.color;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,sy);ctx.lineTo(ex,ey);ctx.lineTo(sx,ey);ctx.closePath();ctx.fill();
   ctx.fillStyle='rgba(20,25,32,.28)';ctx.beginPath();ctx.moveTo(sx,ey);ctx.lineTo(ex,ey);ctx.lineTo(ex,ey-lift);ctx.lineTo(sx,ey-lift);ctx.closePath();ctx.fill();
   ctx.fillStyle='rgba(255,255,255,.22)';ctx.beginPath();ctx.moveTo(sx,ey-lift);ctx.lineTo(ex,ey-lift);ctx.lineTo(ex-7,ey-lift-7);ctx.lineTo(sx-7,ey-lift-7);ctx.closePath();ctx.fill();
   if(inside.selectedFurnitureId===item.id){ctx.strokeStyle='#F4D27A';ctx.lineWidth=3;ctx.strokeRect(sx-3,ey-lift-3,ex-sx+6,lift+6);}
   if(inside.furnitureStates&&inside.furnitureStates[item.id]==='open'){ctx.fillStyle='#E9C47A';ctx.fillRect(sx+4,ey-lift+4,Math.max(5,ex-sx-8),5);}
  });
  // Éclairage ambiant simulé par un voile léger, sans calcul physique lourd.
  ctx.fillStyle='rgba(255,224,166,'+(Math.max(0,.16-roomModel.lighting.brightness*.1))+')';ctx.fillRect(left,back,right-left,floorY-back);
  ctx.fillStyle='#FFFFFF';ctx.font='700 17px system-ui';ctx.textAlign='center';ctx.fillText(roomName.toLocaleUpperCase('fr'),cx,34);
  ctx.font='12px system-ui';ctx.fillStyle='rgba(255,255,255,.92)';const levelIndicator=getInteriorLevelIndicator(inside.level,inside.building.interior.levels,inside.building.interior.stairs);ctx.fillText('Pièce '+(inside.roomIndex+1)+'/'+roomNames.length+' • '+levelIndicator.label,cx,54);
  const interactionStatus=getInteriorInteractionStatus(inside.doorOpen,inside.doorTarget,selectedDoor,selectedDoor&&isNearInteriorDoor(inside.x,inside.z,selectedDoor.side,.34),nearbyFurniture);const statusWidth=Math.min(w-16,320);ctx.fillStyle='rgba(10,16,24,.82)';ctx.fillRect(8,8,statusWidth,54);ctx.fillStyle='#F4D27A';ctx.textAlign='left';ctx.font='bold 11px system-ui';ctx.fillText('PORTE : '+interactionStatus.doorState,18,27);ctx.fillStyle='#FFF';ctx.font='11px system-ui';ctx.fillText(interactionStatus.passage,18,44);ctx.fillText(interactionStatus.furniture,18,57);
  ctx.textAlign='center';ctx.font='12px system-ui';ctx.fillStyle='rgba(255,255,255,.92)';
  const doorIndicator=getInteriorDoorIndicator(doorOptions,inside.selectedDoorIndex);ctx.fillText(doorIndicator.available?doorIndicator.label+' • mur '+doorIndicator.side.toLocaleUpperCase('fr'):doorIndicator.label,cx,h-30);
  ctx.fillText(nearbyFurniture?'Meuble proche : '+nearbyFurniture.label+' • F ou bouton pour examiner':'Approche-toi d’un meuble • F ou bouton pour examiner',cx,h-12);
  const touchLabels=getInteriorTouchLabels(inside.doorOpen,inside.doorTarget,doorOptions.length,nearbyFurniture),touchLayout=getInteriorTouchLayout(w,h);const touchButtons=[{x:touchLayout.centers[0],label:touchLabels.door,enabled:true},{x:touchLayout.centers[1],label:touchLabels.examine,enabled:touchLabels.examineEnabled},{x:touchLayout.centers[2],label:touchLabels.selectDoor,enabled:touchLabels.selectDoorEnabled}];touchButtons.forEach(button=>{const bw=touchLayout.buttonWidth;ctx.fillStyle=button.enabled?'rgba(20,29,42,.92)':'rgba(20,29,42,.55)';ctx.fillRect(button.x-bw/2,touchLayout.top,bw,touchLayout.bottom-touchLayout.top);ctx.strokeStyle=button.enabled?'#F4D27A':'rgba(190,198,208,.45)';ctx.lineWidth=1.5;ctx.strokeRect(button.x-bw/2,touchLayout.top,bw,touchLayout.bottom-touchLayout.top);ctx.fillStyle=button.enabled?'#F4D27A':'rgba(210,216,224,.6)';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText(button.label,button.x,touchLayout.centerY+4);});
 }
 function frame(){
  if(stopped)return;w=canvas.clientWidth;h=canvas.clientHeight;
  if(inside){drawInterior();raf=root.requestAnimationFrame(frame);return}
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
  const near=world.elements.find(o=>(o.type==='house'||o.type==='building')&&Math.hypot(o.x-cameraX,o.z-cameraZ)<1.65);
  if(near){ctx.fillStyle='rgba(10,16,24,.78)';ctx.fillRect(w*.5-116,h-92,232,34);ctx.fillStyle='#FFFFFF';ctx.textAlign='center';ctx.font='bold 13px system-ui';ctx.fillText('Touchez pour entrer',w*.5,h-70)}
  ctx.fillStyle='rgba(10,16,24,.5)';ctx.beginPath();ctx.arc(62,h-72,48,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(62,h-110);ctx.lineTo(62,h-34);ctx.moveTo(24,h-72);ctx.lineTo(100,h-72);ctx.stroke();ctx.fillStyle='#FFFFFF';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText('▲',62,h-92);ctx.fillText('▼',62,h-45);ctx.fillText('◀',42,h-68);ctx.fillText('▶',82,h-68);
  raf=root.requestAnimationFrame(frame);
 }
 onCaption('Un premier environnement 3D est généré. Tu peux faire tourner la caméra en glissant sur l’écran.');
 raf=root.requestAnimationFrame(frame);
 return ()=>{stopped=true;root.cancelAnimationFrame(raf);root.removeEventListener('resize',resize);root.removeEventListener('keydown',keyDown);root.removeEventListener('keyup',keyUp);canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',pointerUp);canvas.removeEventListener('wheel',wheel)};
}
root.IdeeVisionWorld=Object.freeze({version:1,isWorldRequest,create,terrainHeight,getInteriorRoomModel,getInteriorWindows,getInteriorLighting,getNearbyFurniture,interactWithFurniture,interactWithNearbyFurniture,getInteriorTouchAction,getInteriorTouchLayout,getInteriorTouchLabels,getInteriorDoorIndicator,getInteriorInteractionStatus,getInteriorLevelIndicator,selectNextInteriorDoor,getInteriorRoomConnections,getConnectedRoomOptions,getNextConnectedRoomIndex,getInteriorDoorThreshold,isNearInteriorDoor,changeInteriorLevel,getInteriorLevelEntryState,resolveInteriorMovement,play});
})(window);
