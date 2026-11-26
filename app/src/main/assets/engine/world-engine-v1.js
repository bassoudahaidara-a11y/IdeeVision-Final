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
   links.push({from,to,doorId:String(item.doorId||'door-'+i),side,width:Math.max(.2,Math.min(.7,Number(item.width)||.44)),openable:item.openable!==false,locked:!!item.locked,requiredKey:item.requiredKey?String(item.requiredKey):null,requiredAccessLevel:Number.isFinite(Number(item.requiredAccessLevel))?Math.max(0,Number(item.requiredAccessLevel)):0,oneWay:!!item.oneWay,initialState:item.initialState==='open'?'open':'closed'});
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
function analyzeInteriorRoomNetwork(rooms,connections,startRoom){
 const names=Array.isArray(rooms)?Array.from(new Set(rooms.map(v=>String(v||'').trim()).filter(Boolean))):[];
 const links=getInteriorRoomConnections(names,connections),adjacency=new Map(names.map(name=>[name,[]]));
 const openLinks=links.filter(link=>link.openable!==false&&adjacency.has(link.from)&&adjacency.has(link.to));
 openLinks.forEach(link=>{
  adjacency.get(link.from).push({room:link.to,doorId:link.doorId});
  adjacency.get(link.to).push({room:link.from,doorId:link.doorId});
 });
 const start=names.includes(String(startRoom||''))?String(startRoom):names[0]||null;
 const paths=Object.create(null),distances=Object.create(null),queue=[];
 if(start){paths[start]=[start];distances[start]=0;queue.push(start);}
 while(queue.length){
  const current=queue.shift();
  adjacency.get(current).forEach(edge=>{
   if(Object.prototype.hasOwnProperty.call(paths,edge.room))return;
   paths[edge.room]=paths[current].concat(edge.room);
   distances[edge.room]=distances[current]+1;
   queue.push(edge.room);
  });
 }
 const components=[],visited=new Set();
 names.forEach(name=>{
  if(visited.has(name))return;
  const component=[],pending=[name];visited.add(name);
  while(pending.length){
   const current=pending.shift();component.push(current);
   adjacency.get(current).forEach(edge=>{
    if(visited.has(edge.room))return;
    visited.add(edge.room);pending.push(edge.room);
   });
  }
  components.push(component);
 });
 const roomDetails=names.map(name=>{
  const degree=adjacency.get(name).length,reachable=Object.prototype.hasOwnProperty.call(paths,name);
  return {name,degree,reachable,distance:reachable?distances[name]:null,deadEnd:reachable&&degree===1,isolated:degree===0,connections:adjacency.get(name).map(edge=>({room:edge.room,doorId:edge.doorId}))};
 });
 const reachableRooms=roomDetails.filter(room=>room.reachable).map(room=>room.name);
 const unreachableRooms=roomDetails.filter(room=>!room.reachable).map(room=>room.name);
 const deadEnds=roomDetails.filter(room=>room.deadEnd).map(room=>room.name);
 const isolatedRooms=roomDetails.filter(room=>room.isolated).map(room=>room.name);
 const cycleRank=Math.max(0,openLinks.length-names.length+components.length);
 return {roomCount:names.length,connectionCount:links.length,openConnectionCount:openLinks.length,componentCount:components.length,components,cycleRank,startRoom:start,isConnected:names.length>0&&components.length===1,rooms:roomDetails,reachableRooms,unreachableRooms,deadEnds,isolatedRooms,paths,distances};
}
function findInteriorRoute(rooms,connections,fromRoom,toRoom){
 const analysis=analyzeInteriorRoomNetwork(rooms,connections,fromRoom);
 const from=String(fromRoom||''),to=String(toRoom||'');
 if(!analysis.rooms.some(room=>room.name===from)||!analysis.rooms.some(room=>room.name===to))
  return {reachable:false,from,to,rooms:[],doorIds:[],steps:0,message:'Pièce de départ ou destination inconnue.'};
 const route=analysis.paths[to];
 if(!route)return {reachable:false,from,to,rooms:[],doorIds:[],steps:0,message:'Aucun passage accessible vers cette pièce.'};
 const links=getInteriorRoomConnections(analysis.rooms.map(room=>room.name),connections);
 const doorIds=[];
 for(let i=0;i<route.length-1;i++){
  const link=links.find(item=>item.openable!==false&&((item.from===route[i]&&item.to===route[i+1])||(item.to===route[i]&&item.from===route[i+1])));
  if(link)doorIds.push(link.doorId);
 }
 return {reachable:true,from,to,rooms:route,doorIds,steps:Math.max(0,route.length-1),message:route.length===1?'Tu es déjà dans cette pièce.':'Itinéraire trouvé : '+route.join(' → ')};
}
function resolveInteriorDoorAccess(door,context){
 const item=door&&typeof door==='object'?door:{},user=context&&typeof context==='object'?context:{};
 const keys=Array.isArray(user.keys)?user.keys.map(String):[];
 const level=Math.max(0,Number(user.accessLevel)||0);
 if(item.openable===false)return {allowed:false,canOpen:false,reason:'unavailable',message:'Cette porte ne peut pas être ouverte.'};
 if(item.locked&&(!item.requiredKey||!keys.includes(String(item.requiredKey))))return {allowed:false,canOpen:false,reason:'locked',message:'Porte verrouillée : clé nécessaire.'};
 if(level<Math.max(0,Number(item.requiredAccessLevel)||0))return {allowed:false,canOpen:false,reason:'access-level',message:'Niveau d’accès insuffisant.'};
 return {allowed:true,canOpen:true,reason:'allowed',message:item.initialState==='open'?'Passage ouvert.':'Passage autorisé : porte à ouvrir.'};
}
function analyzeInteriorAccessNetwork(rooms,connections,startRoom,context){
 const names=Array.isArray(rooms)?Array.from(new Set(rooms.map(v=>String(v||'').trim()).filter(Boolean))):[];
 const links=getInteriorRoomConnections(names,connections),adjacency=new Map(names.map(name=>[name,[]]));
 const doorDetails=links.map(link=>{
  const access=resolveInteriorDoorAccess(link,context);
  return {doorId:link.doorId,from:link.from,to:link.to,side:link.side,oneWay:!!link.oneWay,locked:!!link.locked,requiredKey:link.requiredKey,requiredAccessLevel:link.requiredAccessLevel,access};
 });
 doorDetails.forEach(door=>{
  if(!door.access.allowed)return;
  adjacency.get(door.from).push({room:door.to,doorId:door.doorId});
  if(!door.oneWay)adjacency.get(door.to).push({room:door.from,doorId:door.doorId});
 });
 const start=names.includes(String(startRoom||''))?String(startRoom):names[0]||null;
 const paths=Object.create(null),queue=[];
 if(start){paths[start]=[start];queue.push(start);}
 while(queue.length){
  const current=queue.shift();
  adjacency.get(current).forEach(edge=>{
   if(Object.prototype.hasOwnProperty.call(paths,edge.room))return;
   paths[edge.room]=paths[current].concat(edge.room);queue.push(edge.room);
  });
 }
 const reachableRooms=names.filter(name=>Object.prototype.hasOwnProperty.call(paths,name));
 const unreachableRooms=names.filter(name=>!Object.prototype.hasOwnProperty.call(paths,name));
 const blockedDoors=doorDetails.filter(door=>!door.access.allowed);
 return {roomCount:names.length,startRoom:start,reachableRooms,unreachableRooms,paths,doors:doorDetails,blockedDoors,accessibleDoorCount:doorDetails.length-blockedDoors.length,lockedDoorCount:doorDetails.filter(door=>door.access.reason==='locked').length,accessLevelBlockedCount:doorDetails.filter(door=>door.access.reason==='access-level').length};
}
function findInteriorRouteAlternatives(rooms,connections,fromRoom,toRoom,maxRoutes,context){
 const names=Array.isArray(rooms)?Array.from(new Set(rooms.map(v=>String(v||'').trim()).filter(Boolean))):[];
 const from=String(fromRoom||''),to=String(toRoom||'');
 const limit=Math.max(1,Math.min(10,Math.floor(Number(maxRoutes)||3)));
 if(!names.includes(from)||!names.includes(to))return {reachable:false,from,to,shortestSteps:null,routes:[],message:'Pièce de départ ou destination inconnue.'};
 if(from===to)return {reachable:true,from,to,shortestSteps:0,routes:[{rooms:[from],doorIds:[],steps:0}],message:'Tu es déjà dans cette pièce.'};
 const links=getInteriorRoomConnections(names,connections);
 const adjacency=new Map(names.map(name=>[name,[]]));
 links.forEach(link=>{
  if(!adjacency.has(link.from)||!adjacency.has(link.to))return;
  const access=resolveInteriorDoorAccess(link,context);
  if(!access.allowed)return;
  adjacency.get(link.from).push({room:link.to,doorId:link.doorId});
  if(!link.oneWay)adjacency.get(link.to).push({room:link.from,doorId:link.doorId});
 });
 const queue=[{rooms:[from],doorIds:[]}],routes=[];let shortest=null;
 while(queue.length&&routes.length<limit){
  const current=queue.shift();
  if(shortest!==null&&current.doorIds.length>=shortest)continue;
  const last=current.rooms[current.rooms.length-1];
  adjacency.get(last).forEach(edge=>{
   if(current.rooms.includes(edge.room))return;
   const next={rooms:current.rooms.concat(edge.room),doorIds:current.doorIds.concat(edge.doorId)};
   if(edge.room===to){
    if(shortest===null)shortest=next.doorIds.length;
    if(next.doorIds.length===shortest)routes.push({rooms:next.rooms,doorIds:next.doorIds,steps:next.doorIds.length});
   }else if(shortest===null||next.doorIds.length<shortest)queue.push(next);
  });
 }
 return {reachable:routes.length>0,from,to,shortestSteps:shortest,routes,message:routes.length?'Plusieurs itinéraires courts disponibles.':'Aucun passage accessible vers cette pièce.'};
}
function analyzeInteriorCirculation(rooms,connections){
 const names=Array.isArray(rooms)?Array.from(new Set(rooms.map(v=>String(v||'').trim()).filter(Boolean))):[];
 const links=getInteriorRoomConnections(names,connections).filter(link=>link.openable!==false);
 const adjacency=new Map(names.map(name=>[name,[]]));
 links.forEach((link,index)=>{
  if(!adjacency.has(link.from)||!adjacency.has(link.to))return;
  adjacency.get(link.from).push({room:link.to,index,doorId:link.doorId});
  adjacency.get(link.to).push({room:link.from,index,doorId:link.doorId});
 });
 let clock=0;const discovery=new Map(),low=new Map(),criticalRooms=new Set(),criticalDoors=[];
 function visit(room,parentEdge){
  discovery.set(room,++clock);low.set(room,discovery.get(room));
  let children=0;
  adjacency.get(room).forEach(edge=>{
   if(edge.index===parentEdge)return;
   if(!discovery.has(edge.room)){
    children++;
    visit(edge.room,edge.index);
    low.set(room,Math.min(low.get(room),low.get(edge.room)));
    if(parentEdge!==null&&low.get(edge.room)>=discovery.get(room))criticalRooms.add(room);
    if(low.get(edge.room)>discovery.get(room))criticalDoors.push({doorId:edge.doorId,from:room,to:edge.room});
   }else low.set(room,Math.min(low.get(room),discovery.get(edge.room)));
  });
  if(parentEdge===null&&children>1)criticalRooms.add(room);
 }
 names.forEach(name=>{if(!discovery.has(name))visit(name,null);});
 return {criticalRooms:names.filter(name=>criticalRooms.has(name)),criticalDoors,hasSinglePointOfFailure:criticalRooms.size>0||criticalDoors.length>0,openDoorCount:links.length};
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
function getInteriorFloorNavigation(level,levels,hasStairs){
 const indicator=getInteriorLevelIndicator(level,levels,hasStairs);
 const canMove=indicator.stairs;
 return {
  level:indicator.level,total:indicator.total,floorName:indicator.floorName,
  hasStairs:canMove,canGoUp:indicator.up,canGoDown:indicator.down,
  upLabel:indicator.up?'MONTER':'',downLabel:indicator.down?'DESCENDRE':'',
  nextAction:indicator.up&&indicator.down?'MONTER / DESCENDRE':indicator.up?'MONTER':indicator.down?'DESCENDRE':'AUCUN ACCÈS',
  description:!canMove?'Bâtiment sans escalier':indicator.up&&indicator.down?'Accès aux étages supérieur et inférieur':indicator.up?'Dernier étage accessible vers le haut':indicator.down?'Dernier étage accessible vers le bas':''
 };
}
function getInteriorLevelIndicator(level,levels,hasStairs){
 const max=Math.max(1,Math.floor(Number(levels)||1));
 const current=Math.max(0,Math.min(max-1,Math.floor(Number(level)||0)));
 const floorName=current===0?'REZ-DE-CHAUSSÉE':'ÉTAGE '+(current+1);
 const stairs=!!hasStairs&&max>1;
 return {level:current+1,total:max,floorName,stairs,up:stairs&&current<max-1,down:stairs&&current>0,label:floorName+' • '+(current+1)+'/'+max,action:!stairs?'AUCUN ESCALIER':current===0?'MONTER':current===max-1?'DESCENDRE':'MONTER / DESCENDRE'};
}
function getInteriorStairModel(level,levels,hasStairs){
 const indicator=getInteriorLevelIndicator(level,levels,hasStairs);
 if(!indicator.stairs)return {visible:false,level:indicator.level,total:indicator.total,steps:[],direction:'none',landing:false};
 const count=10,steps=[];
 for(let i=0;i<count;i++)steps.push({index:i+1,progress:(i+1)/count,rise:(i+1)/count,run:(i+1)/count});
 return {visible:true,level:indicator.level,total:indicator.total,steps,direction:indicator.up?'up':'down',canGoUp:indicator.up,canGoDown:indicator.down,landing:true,railings:true};
}
function getInteriorStairPrompt(x,z,level,levels,hasStairs,tolerance){
 const access=getInteriorStairInteraction(x,z,level,levels,hasStairs,tolerance);
 if(!access.visible)return {visible:false,near:false,ready:false,label:'AUCUN ESCALIER',distance:access.distance,action:'none'};
 if(!access.near)return {visible:true,near:false,ready:false,label:'APPROCHE-TOI DES ESCALIERS',distance:access.distance,action:'approach'};
 if(access.canGoUp&&access.canGoDown)return {visible:true,near:true,ready:true,label:'PRÊT : MONTER / DESCENDRE',distance:access.distance,action:'both'};
 if(access.canGoUp)return {visible:true,near:true,ready:true,label:'PRÊT : MONTER',distance:access.distance,action:'up'};
 if(access.canGoDown)return {visible:true,near:true,ready:true,label:'PRÊT : DESCENDRE',distance:access.distance,action:'down'};
 return {visible:true,near:true,ready:false,label:'AUCUN ÉTAGE ACCESSIBLE',distance:access.distance,action:'limit'};
}
function getInteriorStairInteraction(x,z,level,levels,hasStairs,tolerance){
 const model=getInteriorStairModel(level,levels,hasStairs);
 const point={x:.58,z:-.55},distance=Math.hypot((Number(x)||0)-point.x,(Number(z)||0)-point.z);
 const near=model.visible&&distance<=(Number.isFinite(Number(tolerance))?Math.max(.05,Number(tolerance)):.3);
 return {visible:model.visible,near,distance,canGoUp:near&&model.canGoUp,canGoDown:near&&model.canGoDown,position:point,message:!model.visible?'AUCUN ESCALIER':!near?'APPROCHE-TOI DES ESCALIERS':model.canGoUp&&model.canGoDown?'ESCALIER : MONTER / DESCENDRE':model.canGoUp?'ESCALIER : MONTER':'ESCALIER : DESCENDRE'};
}
function getInteriorStairTraversal(x,z,dx,dz,level,levels,hasStairs,tolerance){
 const access=getInteriorStairInteraction(x,z,level,levels,hasStairs,tolerance);
 const moving=Math.hypot(Number(dx)||0,Number(dz)||0)>.001;
 const toward=((.58-(Number(x)||0))*(Number(dx)||0)+(-.55-(Number(z)||0))*(Number(dz)||0))>0;
 if(!access.visible)return {triggered:false,reason:'no-stairs',level:access.visible?access.level:Math.max(1,Math.floor(Number(level)||0)+1)};
 if(!access.near)return {triggered:false,reason:'too-far',level:access.level};
 if(!moving||!toward)return {triggered:false,reason:'not-approaching',level:access.level};
 const approachDirection=(Number(z)>-.55)?1:-1;const direction=approachDirection>0?(access.canGoUp?1:0):(access.canGoDown?-1:0);
 if(!direction)return {triggered:false,reason:'limit',level:access.level};
 const change=changeInteriorLevel(level,levels,direction,true);
 return {triggered:change.changed,reason:change.reason,level:change.level+1,direction:direction>0?'up':'down'};
}
function getInteriorStairLanding(level,levels,hasStairs,direction){
 const indicator=getInteriorLevelIndicator(level,levels,hasStairs);
 const dir=direction==='down'?'down':'up';
 const canReach=dir==='up'?indicator.up:indicator.down;
 const target=canReach?indicator.level+(dir==='up'?1:-1):indicator.level;
 return {visible:indicator.stairs,accessible:canReach,direction:dir,currentLevel:indicator.level,targetLevel:target,label:!indicator.stairs?'AUCUN PALIER':!canReach?'PALIER INACCESSIBLE':dir==='up'?'PALIER ÉTAGE '+(target+1):'PALIER ÉTAGE '+target,marker:dir==='up'?'▲':'▼'};
}
function getInteriorStairAnimation(transition,stepCount){
 const count=Math.max(1,Math.floor(Number(stepCount)||10));
 if(!transition||!transition.active)return {active:false,direction:null,progress:0,percent:0,currentStep:-1,completedSteps:0,totalSteps:count};
 const progress=Math.max(0,Math.min(1,Number(transition.progress)||0));
 const direction=transition.direction==='down'?'down':'up';
 const completedSteps=Math.min(count,Math.floor(progress*count));
 const currentStep=progress>=1?-1:Math.min(count-1,completedSteps);
 return {active:true,direction,progress,percent:Math.round(progress*100),currentStep,completedSteps,totalSteps:count};
}
function getInteriorTransitionIndicator(transition){
 if(!transition||!transition.active)return {active:false,direction:null,label:'',phase:'idle',phaseLabel:'',phaseProgress:0,progress:0,percent:0};
 const progress=Math.max(0,Math.min(1,Number(transition.progress)||0));
 const direction=transition.direction==='down'?'down':'up';
 const phase=progress<.4?'departure':progress<.6?'switch':'arrival';
 const phaseLabel=phase==='departure'?'DÉPART':phase==='switch'?'CHANGEMENT D’ÉTAGE':'ARRIVÉE';
 const phaseProgress=phase==='departure'?progress/.4:phase==='switch'?(progress-.4)/.2:(progress-.6)/.4;
 return {active:true,direction,label:direction==='up'?'MONTÉE EN COURS':'DESCENTE EN COURS',phase,phaseLabel,phaseProgress:Math.max(0,Math.min(1,phaseProgress)),progress,percent:Math.round(progress*100)};
}
function createInteriorLevelTransition(targetLevel,direction){
 const level=Math.max(0,Math.floor(Number(targetLevel)||0));
 return {active:true,targetLevel:level,direction:direction==='down'?'down':'up',progress:0,switched:false,complete:false};
}
function getInteriorTransitionOpacity(progress){
 const p=Math.max(0,Math.min(1,Number(progress)||0));
 const phase=p<.5?p*2:(1-p)*2;
 return phase*phase*(3-2*phase);
}
function advanceInteriorLevelTransition(transition,step){
 if(!transition||!transition.active)return {transition:null,switchLevel:false,complete:true,opacity:0};
 const amount=Number.isFinite(Number(step))?Math.max(0,Math.min(.25,Number(step))):.05;
 const progress=Math.min(1,transition.progress+amount),switchLevel=!transition.switched&&transition.progress<.5&&progress>=.5;
 const next={...transition,progress,switched:transition.switched||switchLevel,complete:progress>=1,active:progress<1};
 return {transition:next.active?next:null,switchLevel,complete:progress>=1,opacity:getInteriorTransitionOpacity(progress)};
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

function createBoxGeometry(width,height,depth,material){
 const w=Math.max(.001,Math.abs(Number(width)||1))/2,h=Math.max(.001,Math.abs(Number(height)||1))/2,d=Math.max(.001,Math.abs(Number(depth)||1))/2;
 return {type:'mesh',primitive:'box',vertices:[[-w,-h,-d],[w,-h,-d],[w,-h,d],[-w,-h,d],[-w,h,-d],[w,h,-d],[w,h,d],[-w,h,d]],faces:[[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]],material:material||'#AAB6C4'};
}
function createCylinderGeometry(radius,height,segments,material){
 const r=Math.max(.001,Math.abs(Number(radius)||.5)),h=Math.max(.001,Math.abs(Number(height)||1)),count=Math.max(3,Math.min(128,Math.floor(Number(segments)||16))),vertices=[],faces=[];
 for(let y of [-h/2,h/2])for(let i=0;i<count;i++){const a=2*Math.PI*i/count;vertices.push([Math.cos(a)*r,y,Math.sin(a)*r]);}
 const bottom=count*2,top=bottom+1;vertices.push([0,-h/2,0],[0,h/2,0]);
 for(let i=0;i<count;i++){const next=(i+1)%count;faces.push([i,next,count+next,count+i]);faces.push([bottom,next,i]);faces.push([top,count+i,count+next]);}
 return {type:'mesh',primitive:'cylinder',vertices,faces,material:material||'#AAB6C4'};
}
function createSphereGeometry(radius,segments,rings,material){
 const r=Math.max(.001,Math.abs(Number(radius)||.5)),s=Math.max(3,Math.min(64,Math.floor(Number(segments)||16))),lat=Math.max(2,Math.min(32,Math.floor(Number(rings)||10))),vertices=[[0,r,0]],faces=[];
 for(let ring=1;ring<lat;ring++){const phi=Math.PI*ring/lat;for(let i=0;i<s;i++){const theta=2*Math.PI*i/s;vertices.push([r*Math.sin(phi)*Math.cos(theta),r*Math.cos(phi),r*Math.sin(phi)*Math.sin(theta)]);}}
 const bottom=vertices.length;vertices.push([0,-r,0]);
 for(let i=0;i<s;i++)faces.push([0,1+i,1+(i+1)%s]);
 for(let ring=0;ring<lat-2;ring++)for(let i=0;i<s;i++){const a=1+ring*s+i,b=1+ring*s+(i+1)%s,c=b+s,d=a+s;faces.push([a,d,c,b]);}
 const last=1+(lat-2)*s;for(let i=0;i<s;i++)faces.push([last+i,bottom,last+(i+1)%s]);
 return {type:'mesh',primitive:'sphere',vertices,faces,material:material||'#AAB6C4'};
}
function transformGeometryMesh(mesh,transform){
 if(!mesh||!Array.isArray(mesh.vertices))return null;
 const t=transform&&typeof transform==='object'?transform:{},position=t.position||{},rotation=t.rotation||{},scale=t.scale||{};
 const px=Number(position.x)||0,py=Number(position.y)||0,pz=Number(position.z)||0;
 const rx=Number(rotation.x)||0,ry=Number(rotation.y)||0,rz=Number(rotation.z)||0;
 const sx=scale.x===undefined?1:Number(scale.x),sy=scale.y===undefined?1:Number(scale.y),sz=scale.z===undefined?1:Number(scale.z);
 const vertices=mesh.vertices.map(v=>{
  let x=v[0]*sx,y=v[1]*sy,z=v[2]*sz;
  let qy=y*Math.cos(rx)-z*Math.sin(rx),qz=y*Math.sin(rx)+z*Math.cos(rx);y=qy;z=qz;
  let qx=x*Math.cos(ry)+z*Math.sin(ry);qz=-x*Math.sin(ry)+z*Math.cos(ry);x=qx;z=qz;
  qx=x*Math.cos(rz)-y*Math.sin(rz);qy=x*Math.sin(rz)+y*Math.cos(rz);x=qx;y=qy;
  return [x+px,y+py,z+pz];
 });
 return Object.assign({},mesh,{vertices,faces:mesh.faces.map(face=>face.slice())});
}
function mergeGeometryMeshes(meshes){
 const list=Array.isArray(meshes)?meshes:[],vertices=[],faces=[],materials=[];
 list.forEach((mesh,index)=>{
  if(!mesh||!Array.isArray(mesh.vertices)||!Array.isArray(mesh.faces))return;
  const offset=vertices.length;mesh.vertices.forEach(v=>vertices.push(v.slice()));
  mesh.faces.forEach(face=>{faces.push(face.map(i=>i+offset));materials.push(mesh.material||'#AAB6C4');});
 });
 return {type:'mesh',primitive:'merged',vertices,faces,faceMaterials:materials,material:'#AAB6C4'};
}
function validateGeometryMesh(mesh){
 const errors=[],vertices=mesh&&mesh.vertices,faces=mesh&&mesh.faces;
 if(!mesh||mesh.type!=='mesh')errors.push('type-mesh-required');
 if(!Array.isArray(vertices)||vertices.length<3)errors.push('vertices-required');
 if(!Array.isArray(faces)||faces.length<1)errors.push('faces-required');
 if(!Array.isArray(vertices)||!Array.isArray(faces))return {valid:false,errors,vertexCount:0,faceCount:0};
 vertices.forEach((v,i)=>{if(!Array.isArray(v)||v.length<3||!v.slice(0,3).every(Number.isFinite))errors.push('invalid-vertex-'+i);});
 faces.forEach((face,i)=>{
  if(!Array.isArray(face)||face.length<3){errors.push('invalid-face-'+i);return;}
  if(new Set(face).size!==face.length)errors.push('duplicate-index-face-'+i);
  if(face.some(index=>!Number.isInteger(index)||index<0||index>=vertices.length))errors.push('out-of-range-face-'+i);
  if(face.every(index=>Number.isInteger(index)&&index>=0&&index<vertices.length)&&face.length>=3){
   const a=vertices[face[0]],b=vertices[face[1]],c=vertices[face[2]];
   if([a,b,c].every(v=>Array.isArray(v)&&v.slice(0,3).every(Number.isFinite))){
    const ab=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],ac=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];
    const cross=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
    if(Math.hypot(...cross)<1e-10)errors.push('degenerate-face-'+i);
   }
  }
 });
 return {valid:errors.length===0,errors,vertexCount:vertices.length,faceCount:faces.length};
}
function measureGeometryMesh(mesh){
 const validation=validateGeometryMesh(mesh),vertices=mesh&&Array.isArray(mesh.vertices)?mesh.vertices:[],faces=mesh&&Array.isArray(mesh.faces)?mesh.faces:[];
 if(!vertices.length)return {valid:false,bounds:null,surfaceArea:0,signedVolume:0,volume:0,isClosed:false,validation};
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 vertices.forEach(v=>{for(let i=0;i<3;i++){min[i]=Math.min(min[i],v[i]);max[i]=Math.max(max[i],v[i]);}});
 let area=0,volume=0;const edges=new Map();
 faces.forEach(face=>{
  if(!Array.isArray(face)||face.length<3||face.some(i=>!vertices[i]))return;
  for(let i=1;i<face.length-1;i++){
   const a=vertices[face[0]],b=vertices[face[i]],c=vertices[face[i+1]];
   const ab=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],ac=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];
   const cross=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
   area+=Math.hypot(...cross)/2;
   volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;
  }
  for(let i=0;i<face.length;i++){const a=face[i],b=face[(i+1)%face.length],key=a<b?a+':'+b:b+':'+a;edges.set(key,(edges.get(key)||0)+1);}
 });
 const isClosed=edges.size>0&&Array.from(edges.values()).every(count=>count===2);
 return {valid:validation.valid,bounds:{min,max,size:max.map((v,i)=>v-min[i]),center:max.map((v,i)=>(v+min[i])/2)},surfaceArea:area,signedVolume:volume,volume:isClosed?Math.abs(volume):null,isClosed,validation};
}
function assembleGeometryModel(name,parts){
 const components=(Array.isArray(parts)?parts:[]).map((part,index)=>{
  const source=part&&part.mesh,mesh=transformGeometryMesh(source,part&&part.transform);
  return {id:String(part&&part.id||'component-'+index),mesh,validation:validateGeometryMesh(mesh)};
 });
 const mesh=mergeGeometryMeshes(components.filter(c=>c.mesh).map(c=>c.mesh)),metrics=measureGeometryMesh(mesh);
 const errors=components.flatMap(c=>c.validation.errors.map(error=>c.id+':'+error));
 return {kind:'geometry-model',name:String(name||'Modèle 3D'),components,mesh,metrics,validation:{valid:errors.length===0&&components.length>0,errors,componentCount:components.length}};
}
function createBuildingGeometry(options){
 const o=options&&typeof options==='object'?options:{},width=Math.max(3,Math.min(80,Number(o.width)||10)),depth=Math.max(3,Math.min(80,Number(o.depth)||8)),floors=Math.max(1,Math.min(20,Math.floor(Number(o.floors)||2))),floorHeight=Math.max(2.2,Math.min(6,Number(o.floorHeight)||3)),wall=Math.max(.12,Math.min(.5,Number(o.wallThickness)||.22)),slab=.18,parts=[];
 const add=(id,w,h,d,x,y,z,material)=>parts.push({id,mesh:createBoxGeometry(w,h,d,material),transform:{position:{x,y,z}}});
 for(let level=0;level<floors;level++){
  const base=level*floorHeight;
  add('floor-slab-'+level,width,slab,depth,0,base+slab/2,0,'#8B8174');
  add('back-wall-'+level,width,floorHeight,wall,0,base+floorHeight/2,depth/2-wall/2,'#D5D0C7');
  add('left-wall-'+level,wall,floorHeight,depth-2*wall,-width/2+wall/2,base+floorHeight/2,0,'#C8C2B8');
  add('right-wall-'+level,wall,floorHeight,depth-2*wall,width/2-wall/2,base+floorHeight/2,0,'#C8C2B8');
  const frontZ=-depth/2+wall/2;
  if(level===0){
   const doorWidth=Math.min(1.5,width*.22),doorHeight=Math.min(2.15,floorHeight*.78),sideWidth=(width-doorWidth)/2;
   add('front-wall-left-'+level,sideWidth,floorHeight,wall,-(doorWidth+sideWidth)/2,base+floorHeight/2,frontZ,'#D5D0C7');
   add('front-wall-right-'+level,sideWidth,floorHeight,wall,(doorWidth+sideWidth)/2,base+floorHeight/2,frontZ,'#D5D0C7');
   add('door-lintel-'+level,doorWidth,floorHeight-doorHeight,wall,0,base+doorHeight+(floorHeight-doorHeight)/2,frontZ,'#D5D0C7');
   add('door-panel',doorWidth*.9,doorHeight*.96,.06,0,base+doorHeight/2,frontZ-wall/2,'#79563D');
  }else add('front-wall-'+level,width,floorHeight,wall,0,base+floorHeight/2,frontZ,'#D5D0C7');
  const windowY=base+floorHeight*.58,windowW=Math.min(1.25,width*.18),windowH=Math.min(1.05,floorHeight*.38);
  [-width*.27,width*.27].forEach((x,index)=>{
   add('window-glass-'+level+'-'+index,windowW,windowH,.045,x,windowY,frontZ-wall*.35,'#78B9D7');
   add('window-frame-top-'+level+'-'+index,windowW+.12,.07,.08,x,windowY+windowH/2,frontZ-wall*.3,'#F0E8D9');
   add('window-frame-bottom-'+level+'-'+index,windowW+.12,.07,.08,x,windowY-windowH/2,frontZ-wall*.3,'#F0E8D9');
   add('window-frame-left-'+level+'-'+index,.07,windowH,.08,x-windowW/2,windowY,frontZ-wall*.3,'#F0E8D9');
   add('window-frame-right-'+level+'-'+index,.07,windowH,.08,x+windowW/2,windowY,frontZ-wall*.3,'#F0E8D9');
  });
 }
 add('roof-slab',width+wall,.22,depth+wall,0,floors*floorHeight+.11,0,'#68798A');
 return assembleGeometryModel(o.name||'Bâtiment modulaire',parts);
}
function createFurnitureGeometry(type,options){
 const kind=String(type||'table').toLowerCase(),o=options&&typeof options==='object'?options:{},w=Math.max(.4,Math.min(5,Number(o.width)||1.4)),h=Math.max(.35,Math.min(3,Number(o.height)||.8)),d=Math.max(.4,Math.min(5,Number(o.depth)||.8)),parts=[];
 const add=(id,bw,bh,bd,x,y,z,material)=>parts.push({id,mesh:createBoxGeometry(bw,bh,bd,material),transform:{position:{x,y,z}}});
 if(kind==='table'){
  add('table-top',w,.1,d,0,h-.05,0,'#9B7654');
  for(const x of [-1,1])for(const z of [-1,1])add('table-leg-'+x+'-'+z,.09,h-.1,.09,x*(w/2-.1),(h-.1)/2,z*(d/2-.1),'#76543A');
 }else if(kind==='chair'){
  add('seat',w,.12,d,0,h*.48,0,'#9B7654');
  for(const x of [-1,1])for(const z of [-1,1])add('chair-leg-'+x+'-'+z,.07,h*.48,.07,x*(w/2-.06),h*.24,z*(d/2-.06),'#76543A');
  add('backrest',w,.12,.1,0,h*.78,d/2-.05,'#9B7654');
 }else if(kind==='bed'){
  add('bed-frame',w,.22,d,0,.11,0,'#76543A');
  add('mattress',w*.96,.2,d*.94,0,.32,0,'#D5DCE5');
  add('headboard',w,.85,.12,0,.52,d/2-.06,'#79563D');
 }else if(kind==='cabinet'){
  add('cabinet-body',w,h,d,0,h/2,0,'#8B654A');
  add('cabinet-door',w*.86,h*.82,.045,0,h/2,-d/2-.03,'#B18A66');
  add('cabinet-handle',.045,.16,.06,w*.28,h/2,-d/2-.07,'#D7BD85');
 }else if(kind==='sofa'){
  add('sofa-base',w,h*.35,d,0,h*.18,0,'#6D849B');
  add('sofa-back',w,h*.55,.18,0,h*.58,d/2-.09,'#7896B0');
  for(const x of [-1,1])add('sofa-arm-'+x,.18,h*.55,d,x*(w/2-.09),h*.45,0,'#607B94');
 }else return {kind:'geometry-model',name:'Meuble inconnu',components:[],mesh:mergeGeometryMeshes([]),metrics:measureGeometryMesh(null),validation:{valid:false,errors:['unsupported-furniture-type'],componentCount:0}};
 return assembleGeometryModel(String(o.name||kind),parts);
}


function normalizeHexColor(value,fallback){
 const color=String(value||fallback||'#AAB6C4').trim();
 return /^#[0-9a-fA-F]{6}$/.test(color)?color.toUpperCase():String(fallback||'#AAB6C4').toUpperCase();
}
function hexToRgb(color){
 const hex=normalizeHexColor(color,'#AAB6C4');
 return [parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];
}
function rgbToHex(rgb){
 return '#'+rgb.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('').toUpperCase();
}
function mixColors(a,b,t){
 const x=hexToRgb(a),y=hexToRgb(b),f=Math.max(0,Math.min(1,Number(t)||0));
 return rgbToHex(x.map((v,i)=>v+(y[i]-v)*f));
}
function createMaterial(options){
 const o=options&&typeof options==='object'?options:{},opacity=Math.max(0,Math.min(1,o.opacity===undefined?1:Number(o.opacity)));
 const textures={};
 ['baseColor','normal','roughness','opacity','emissive'].forEach(slot=>{
  const texture=o.textures&&o.textures[slot];
  if(texture&&typeof texture==='object'){
   const type=['checker','stripes','grid','gradient','wood'].includes(texture.type)?texture.type:'checker';
   textures[slot]={type,scale:Math.max(.01,Math.min(100,Number(texture.scale)||4)),colorA:normalizeHexColor(texture.colorA,o.baseColor||'#AAB6C4'),colorB:normalizeHexColor(texture.colorB,'#FFFFFF'),strength:Math.max(0,Math.min(1,texture.strength===undefined?1:Number(texture.strength))),axis:texture.axis==='v'?'v':'u'};
  }
 });
 return {kind:'material',id:String(o.id||'material-custom'),name:String(o.name||'Matériau personnalisé'),baseColor:normalizeHexColor(o.baseColor,'#AAB6C4'),roughness:Math.max(0,Math.min(1,o.roughness===undefined?.65:Number(o.roughness))),metallic:Math.max(0,Math.min(1,Number(o.metallic)||0)),opacity,transparent:opacity<1||o.transparent===true,alphaMode:['opaque','blend','mask'].includes(o.alphaMode)?o.alphaMode:(opacity<1?'blend':'opaque'),alphaCutoff:Math.max(0,Math.min(1,o.alphaCutoff===undefined?.5:Number(o.alphaCutoff))),emissive:normalizeHexColor(o.emissive,'#000000'),emissiveStrength:Math.max(0,Math.min(5,Number(o.emissiveStrength)||0)),doubleSided:o.doubleSided===true,shadingModel:['lambert','standard','unlit'].includes(o.shadingModel)?o.shadingModel:'standard',textures};
}
function validateMaterial(material){
 const errors=[];
 if(!material||material.kind!=='material')errors.push('material-kind-required');
 else{
  if(!/^#[0-9A-F]{6}$/.test(material.baseColor))errors.push('invalid-base-color');
  ['roughness','metallic','opacity','alphaCutoff'].forEach(k=>{if(!Number.isFinite(material[k])||material[k]<0||material[k]>1)errors.push('invalid-'+k)});
  if(material.transparent!==(material.opacity<1||material.alphaMode==='blend'))errors.push('transparency-mismatch');
  if(!['opaque','blend','mask'].includes(material.alphaMode))errors.push('invalid-alpha-mode');
  if(!['lambert','standard','unlit'].includes(material.shadingModel))errors.push('invalid-shading-model');
  Object.keys(material.textures||{}).forEach(slot=>{const tex=material.textures[slot];if(!['baseColor','normal','roughness','opacity','emissive'].includes(slot)||!['checker','stripes','grid','gradient','wood'].includes(tex.type))errors.push('invalid-texture-'+slot)});
 }
 return {valid:errors.length===0,errors};
}
function createMaterialLibrary(){
 const definitions=[
  {id:'wall-plaster',name:'Enduit mural',baseColor:'#D8D0C2',roughness:.92},
  {id:'oak-wood',name:'Bois de chêne',baseColor:'#986B43',roughness:.72,textures:{baseColor:{type:'wood',scale:7,colorA:'#68452D',colorB:'#C0925F'}}},
  {id:'polished-metal',name:'Métal poli',baseColor:'#AAB7C4',roughness:.2,metallic:.88},
  {id:'clear-glass',name:'Verre transparent',baseColor:'#B8E6F2',roughness:.08,opacity:.28,transparent:true,doubleSided:true},
  {id:'ceramic-tile',name:'Carrelage',baseColor:'#D9DDE2',roughness:.3,textures:{baseColor:{type:'grid',scale:5,colorA:'#D9DDE2',colorB:'#AEB8C3',strength:.22}}},
  {id:'fabric-blue',name:'Tissu bleu',baseColor:'#52718F',roughness:.98,textures:{baseColor:{type:'checker',scale:18,colorA:'#52718F',colorB:'#6685A2',strength:.16}}}
 ];
 return definitions.map(createMaterial);
}
function getMaterialPreset(library,id){
 const list=Array.isArray(library)?library:createMaterialLibrary();
 const found=list.find(item=>item&&item.id===id);
 return found?createMaterial(found):null;
}
function generatePlanarUV(mesh,axis){
 if(!mesh||!Array.isArray(mesh.vertices)||!mesh.vertices.length)return [];
 const selected=['xy','xz','yz'].includes(axis)?axis:'xz',indices=selected==='xy'?[0,1]:selected==='yz'?[1,2]:[0,2];
 const min=[Infinity,Infinity],max=[-Infinity,-Infinity];
 mesh.vertices.forEach(v=>indices.forEach((k,j)=>{min[j]=Math.min(min[j],v[k]);max[j]=Math.max(max[j],v[k])}));
 return mesh.vertices.map(v=>indices.map((k,j)=>max[j]-min[j]<1e-12?0:(v[k]-min[j])/(max[j]-min[j])));
}
function sampleMaterialTexture(texture,uv){
 if(!texture)return null;
 const u=((Number(uv&&uv[0])||0)*texture.scale),v=((Number(uv&&uv[1])||0)*texture.scale);
 let factor=0;
 if(texture.type==='checker')factor=(Math.floor(u)+Math.floor(v))%2;
 else if(texture.type==='stripes')factor=(Math.floor(texture.axis==='v'?v:u)%2);
 else if(texture.type==='grid'){const lineU=Math.abs(u-Math.round(u))<.12,lineV=Math.abs(v-Math.round(v))<.12;factor=lineU||lineV?1:0;}
 else if(texture.type==='gradient')factor=Math.max(0,Math.min(1,texture.axis==='v'?uv[1]:uv[0]));
 else if(texture.type==='wood'){const wave=Math.sin(v*2.7+Math.sin(u*1.4)*1.8);factor=(wave+1)/2;}
 return mixColors(texture.colorA,texture.colorB,factor*texture.strength);
}
function applyMaterialToMesh(mesh,material,options){
 if(!mesh||!Array.isArray(mesh.vertices)||!Array.isArray(mesh.faces))return null;
 const mat=createMaterial(material),o=options&&typeof options==='object'?options:{},indices=Array.isArray(o.faceIndices)?o.faceIndices:null;
 const faceMaterials=mesh.faces.map((_,i)=>indices&&!indices.includes(i)?(mesh.faceMaterials&&mesh.faceMaterials[i]||mesh.material||mat.baseColor):mat.id);
 const materials=Object.assign({},mesh.materials||{});
 materials[mat.id]=mat;
 return Object.assign({},mesh,{vertices:mesh.vertices.map(v=>v.slice()),faces:mesh.faces.map(f=>f.slice()),material:mat.baseColor,materials,faceMaterials,uvs:generatePlanarUV(mesh,o.uvAxis||'xz')});
}
function evaluateMaterialAppearance(material,uv,lighting){
 const mat=createMaterial(material),light=lighting&&typeof lighting==='object'?lighting:{},base=sampleMaterialTexture(mat.textures.baseColor,uv)||mat.baseColor;
 const ambient=Math.max(0,Math.min(1,light.ambient===undefined?.35:Number(light.ambient))),diffuse=Math.max(0,Math.min(1,light.diffuse===undefined?.65:Number(light.diffuse)));
 const intensity=mat.shadingModel==='unlit'?1:Math.max(.04,Math.min(1.5,ambient+diffuse*(1-mat.roughness*.18)));
 const shaded=rgbToHex(hexToRgb(base).map(v=>v*intensity));
 const specular=mat.shadingModel==='unlit'?0:(1-mat.roughness)*(.15+.65*mat.metallic);
 const opacity=mat.alphaMode==='mask'?(mat.opacity>=mat.alphaCutoff?1:0):mat.opacity;
 return {color:shaded,baseColor:base,opacity,transparent:opacity<1||mat.transparent,roughness:mat.roughness,metallic:mat.metallic,specular,emissive:mat.emissive,emissiveStrength:mat.emissiveStrength,shadingModel:mat.shadingModel};
}
function createMaterialSurfacePreview(material,uvSamples){
 const mat=createMaterial(material),samples=Array.isArray(uvSamples)&&uvSamples.length?uvSamples:[[0,0],[.25,.25],[.5,.5],[.75,.75],[1,1]];
 return {materialId:mat.id,name:mat.name,properties:{baseColor:mat.baseColor,roughness:mat.roughness,metallic:mat.metallic,opacity:mat.opacity,alphaMode:mat.alphaMode},samples:samples.map(uv=>({uv:uv.slice(0,2),appearance:evaluateMaterialAppearance(mat,uv)})),validation:validateMaterial(mat)};
}


function getSceneObjectWorldMesh(object){
 const source=object&&(object.mesh||(object.geometry&&object.geometry.mesh));
 if(!source)return null;
 return transformGeometryMesh(source,object.transform||{});
}
function getMeshBounds(mesh){
 if(!mesh||!Array.isArray(mesh.vertices)||!mesh.vertices.length)return null;
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 mesh.vertices.forEach(v=>{for(let i=0;i<3;i++){min[i]=Math.min(min[i],v[i]);max[i]=Math.max(max[i],v[i]);}});
 return {min,max,size:max.map((v,i)=>v-min[i]),center:max.map((v,i)=>(v+min[i])/2)};
}
function createInteractiveScene(objects,options){
 const o=options&&typeof options==='object'?options:{};
 const source=Array.isArray(objects)?objects:[];
 const normalized=source.map((item,index)=>{
  const object=item||{},mesh=object.mesh||(object.geometry&&object.geometry.mesh);
  const id=String(object.id||'scene-object-'+index);
  return {id,name:String(object.name||id),mesh,transform:Object.assign({position:{x:0,y:0,z:0},rotation:{x:0,y:0,z:0},scale:{x:1,y:1,z:1}},object.transform||{}),visible:object.visible!==false,selectable:object.selectable!==false,locked:object.locked===true,metadata:object.metadata||{}};
 });
 const ids=new Set(),errors=[];
 normalized.forEach(item=>{if(ids.has(item.id))errors.push('duplicate-object-id:'+item.id);ids.add(item.id);if(!item.mesh||!validateGeometryMesh(item.mesh).valid)errors.push('invalid-object-mesh:'+item.id);});
 return {kind:'interactive-3d-scene',objects:normalized,selectedId:null,hoveredId:null,revision:0,validation:{valid:errors.length===0,errors},settings:{collisionDetection:o.collisionDetection!==false,selectionEnabled:o.selectionEnabled!==false}};
}
function intersectRayBounds(ray,bounds,maxDistance){
 if(!ray||!ray.origin||!ray.direction||!bounds)return null;
 const origin=[Number(ray.origin.x),Number(ray.origin.y),Number(ray.origin.z)],direction=[Number(ray.direction.x),Number(ray.direction.y),Number(ray.direction.z)];
 if(!origin.every(Number.isFinite)||!direction.every(Number.isFinite))return null;
 const length=Math.hypot(...direction);if(length<1e-12)return null;
 for(let i=0;i<3;i++)direction[i]/=length;
 let near=-Infinity,far=Infinity;
 for(let i=0;i<3;i++){
  if(Math.abs(direction[i])<1e-12){if(origin[i]<bounds.min[i]||origin[i]>bounds.max[i])return null;continue;}
  let a=(bounds.min[i]-origin[i])/direction[i],b=(bounds.max[i]-origin[i])/direction[i];
  if(a>b){const swap=a;a=b;b=swap;}
  near=Math.max(near,a);far=Math.min(far,b);
  if(near>far)return null;
 }
 if(far<0)return null;
 const distance=near>=0?near:far;
 if(Number.isFinite(maxDistance)&&distance>maxDistance)return null;
 return {distance,point:{x:origin[0]+direction[0]*distance,y:origin[1]+direction[1]*distance,z:origin[2]+direction[2]*distance}};
}
function pickSceneObject(scene,ray,options){
 if(!scene||!Array.isArray(scene.objects)||scene.settings&&scene.settings.selectionEnabled===false)return null;
 const o=options&&typeof options==='object'?options:{},hits=[];
 scene.objects.forEach(object=>{
  if(!object.visible||!object.selectable||object.locked)return;
  const bounds=getMeshBounds(getSceneObjectWorldMesh(object));
  const hit=intersectRayBounds(ray,bounds,o.maxDistance);
  if(hit)hits.push(Object.assign({id:object.id,name:object.name},hit));
 });
 hits.sort((a,b)=>a.distance-b.distance);
 return hits[0]||null;
}
function selectSceneObject(scene,ray,options){
 if(!scene||!Array.isArray(scene.objects))return null;
 const hit=pickSceneObject(scene,ray,options),selectedId=hit?hit.id:null;
 return Object.assign({},scene,{selectedId,hoveredId:selectedId,revision:(scene.revision||0)+1,lastSelection:hit?{id:hit.id,distance:hit.distance,point:hit.point}:null});
}
function updateSceneObjectTransform(scene,id,patch){
 if(!scene||!Array.isArray(scene.objects))return null;
 const changes=patch&&typeof patch==='object'?patch:{};
 let found=false;
 const objects=scene.objects.map(object=>{
  if(object.id!==id)return object;
  found=true;
  const previous=object.transform||{},next={};
  ['position','rotation','scale'].forEach(key=>next[key]=Object.assign({},previous[key]||{},changes[key]||{}));
  return Object.assign({},object,{transform:next});
 });
 if(!found)return scene;
 return Object.assign({},scene,{objects,revision:(scene.revision||0)+1});
}
function moveSceneObject(scene,id,delta,options){
 const object=scene&&scene.objects&&scene.objects.find(item=>item.id===id);
 if(!object||object.locked)return {scene,updated:false,reason:object?'object-locked':'object-not-found',collisions:[]};
 const d=delta&&typeof delta==='object'?delta:{},p=object.transform.position||{};
 const next=updateSceneObjectTransform(scene,id,{position:{x:(Number(p.x)||0)+(Number(d.x)||0),y:(Number(p.y)||0)+(Number(d.y)||0),z:(Number(p.z)||0)+(Number(d.z)||0)}});
 const collisions=detectSceneCollisions(next);
 const collision=collisions.filter(item=>item.objectA===id||item.objectB===id);
 if(options&&options.preventCollision&&collision.length)return {scene,updated:false,reason:'collision-blocked',collisions:collision};
 return {scene:next,updated:true,reason:null,collisions:collision};
}
function rotateSceneObject(scene,id,delta){
 const object=scene&&scene.objects&&scene.objects.find(item=>item.id===id);
 if(!object||object.locked)return {scene,updated:false,reason:object?'object-locked':'object-not-found'};
 const d=delta&&typeof delta==='object'?delta:{},r=object.transform.rotation||{};
 return {scene:updateSceneObjectTransform(scene,id,{rotation:{x:(Number(r.x)||0)+(Number(d.x)||0),y:(Number(r.y)||0)+(Number(d.y)||0),z:(Number(r.z)||0)+(Number(d.z)||0)}}),updated:true,reason:null};
}
function scaleSceneObject(scene,id,factor){
 const object=scene&&scene.objects&&scene.objects.find(item=>item.id===id);
 if(!object||object.locked)return {scene,updated:false,reason:object?'object-locked':'object-not-found'};
 const f=typeof factor==='number'?{x:factor,y:factor,z:factor}:factor||{},s=object.transform.scale||{};
 const validAxis=key=>Math.max(.01,Math.min(100,(Number(s[key])||1)*(Number(f[key])||1)));
 return {scene:updateSceneObjectTransform(scene,id,{scale:{x:validAxis('x'),y:validAxis('y'),z:validAxis('z')}}),updated:true,reason:null};
}
function detectSceneCollisions(scene,options){
 if(!scene||!Array.isArray(scene.objects))return [];
 const o=options&&typeof options==='object'?options:{},tolerance=Math.max(0,Number(o.tolerance)||0),items=scene.objects.filter(object=>object.visible).map(object=>({id:object.id,bounds:getMeshBounds(getSceneObjectWorldMesh(object))})).filter(item=>item.bounds),collisions=[];
 for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
  const a=items[i],b=items[j],overlap=[0,1,2].every(axis=>a.bounds.max[axis]-tolerance>b.bounds.min[axis]&&b.bounds.max[axis]-tolerance>a.bounds.min[axis]);
  if(overlap){const depth=[0,1,2].map(axis=>Math.min(a.bounds.max[axis],b.bounds.max[axis])-Math.max(a.bounds.min[axis],b.bounds.min[axis]));collisions.push({objectA:a.id,objectB:b.id,depth,penetration:Math.min(...depth)});}
 }
 return collisions;
}
function setSceneObjectVisibility(scene,id,visible){
 if(!scene||!Array.isArray(scene.objects))return null;
 let found=false;
 const objects=scene.objects.map(object=>{if(object.id!==id)return object;found=true;return Object.assign({},object,{visible:visible===true})});
 return found?Object.assign({},scene,{objects,revision:(scene.revision||0)+1}):scene;
}
function setSceneObjectLock(scene,id,locked){
 if(!scene||!Array.isArray(scene.objects))return null;
 let found=false;
 const objects=scene.objects.map(object=>{if(object.id!==id)return object;found=true;return Object.assign({},object,{locked:locked===true})});
 return found?Object.assign({},scene,{objects,revision:(scene.revision||0)+1}):scene;
}
function getSceneInteractionSummary(scene){
 const objects=scene&&Array.isArray(scene.objects)?scene.objects:[];
 const selected=objects.find(item=>item.id===(scene&&scene.selectedId))||null;
 return {objectCount:objects.length,visibleCount:objects.filter(item=>item.visible).length,lockedCount:objects.filter(item=>item.locked).length,selectedId:selected?selected.id:null,selectedName:selected?selected.name:null,collisionCount:detectSceneCollisions(scene).length,revision:scene&&scene.revision||0,valid:!!(scene&&scene.validation&&scene.validation.valid)};
}


function clampNumber(value,min,max,fallback){const n=Number(value);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;}
function vector3(value,fallback){const v=value&&typeof value==='object'?value:{},f=fallback||{x:0,y:0,z:0};return {x:Number.isFinite(Number(v.x))?Number(v.x):f.x,y:Number.isFinite(Number(v.y))?Number(v.y):f.y,z:Number.isFinite(Number(v.z))?Number(v.z):f.z};}
function createCameraState(options){
 const o=options&&typeof options==='object'?options:{},target=vector3(o.target),position=vector3(o.position,{x:0,y:3,z:8}),mode=['orbit','free','first-person','third-person','follow'].includes(o.mode)?o.mode:'orbit';
 return {kind:'ideevision-camera',version:1,mode,position,target,yaw:clampNumber(o.yaw,-Math.PI*8,Math.PI*8,0),pitch:clampNumber(o.pitch,-1.52,1.52,0),distance:clampNumber(o.distance,.25,500,Math.max(.25,Math.hypot(position.x-target.x,position.y-target.y,position.z-target.z))),fov:clampNumber(o.fov,20,100,60),near:clampNumber(o.near,.001,10,.05),far:clampNumber(o.far,10,100000,2000),moveSpeed:clampNumber(o.moveSpeed,.001,100,.18),zoomSpeed:clampNumber(o.zoomSpeed,.001,10,.12),bounds:o.bounds&&typeof o.bounds==='object'?Object.assign({},o.bounds):null,followId:o.followId?String(o.followId):null,enabled:o.enabled!==false,revision:0};
}
function getCameraDirection(camera){const c=camera||createCameraState(),cp=Math.cos(c.pitch||0),d={x:Math.sin(c.yaw||0)*cp,y:Math.sin(c.pitch||0),z:-Math.cos(c.yaw||0)*cp},l=Math.hypot(d.x,d.y,d.z)||1;return {x:d.x/l,y:d.y/l,z:d.z/l};}
function clampCameraPosition(position,bounds){const p=vector3(position);if(!bounds)return p;return {x:clampNumber(p.x,bounds.minX??-Infinity,bounds.maxX??Infinity,p.x),y:clampNumber(p.y,bounds.minY??-Infinity,bounds.maxY??Infinity,p.y),z:clampNumber(p.z,bounds.minZ??-Infinity,bounds.maxZ??Infinity,p.z)};}
function updateCameraMode(camera,mode,options){if(!camera||!['orbit','free','first-person','third-person','follow'].includes(mode))return camera;const o=options||{},n=Object.assign({},camera,{mode,revision:(camera.revision||0)+1});if(o.followId!==undefined)n.followId=o.followId===null?null:String(o.followId);if(o.target)n.target=vector3(o.target,n.target);if(mode==='first-person'){n.target=vector3(o.target,{x:n.position.x,y:n.position.y,z:n.position.z-1});n.distance=1;}if((mode==='third-person'||mode==='orbit')&&o.distance!==undefined)n.distance=clampNumber(o.distance,.25,500,n.distance);return n;}
function orbitCamera(camera,deltaYaw,deltaPitch){if(!camera||camera.enabled===false)return camera;const n=Object.assign({},camera,{yaw:(camera.yaw||0)+(Number(deltaYaw)||0),pitch:clampNumber((camera.pitch||0)+(Number(deltaPitch)||0),-1.52,1.52,0),revision:(camera.revision||0)+1});if(n.mode==='orbit'||n.mode==='third-person'){const d=n.distance,cp=Math.cos(n.pitch);n.position=clampCameraPosition({x:n.target.x+Math.sin(n.yaw)*cp*d,y:n.target.y+Math.sin(n.pitch)*d,z:n.target.z+Math.cos(n.yaw)*cp*d},n.bounds);}return n;}
function dollyCamera(camera,amount){if(!camera||camera.enabled===false)return camera;const n=Object.assign({},camera,{distance:clampNumber((camera.distance||5)+(Number(amount)||0),.25,500,5),revision:(camera.revision||0)+1});if(n.mode==='orbit'||n.mode==='third-person'){const d=n.distance,cp=Math.cos(n.pitch);n.position=clampCameraPosition({x:n.target.x+Math.sin(n.yaw)*cp*d,y:n.target.y+Math.sin(n.pitch)*d,z:n.target.z+Math.cos(n.yaw)*cp*d},n.bounds);}return n;}
function zoomCamera(camera,delta){if(!camera||camera.enabled===false)return camera;const f=Math.exp(clampNumber(delta,-5,5,0)*(camera.zoomSpeed||.12));return dollyCamera(camera,(camera.distance||5)*(f-1));}
function moveCamera(camera,movement,options){if(!camera||camera.enabled===false)return camera;const m=vector3(movement),o=options||{},speed=clampNumber(o.speed,camera.moveSpeed*.01,camera.moveSpeed*100,camera.moveSpeed),yaw=camera.yaw||0,right={x:Math.cos(yaw),z:Math.sin(yaw)},forward=(camera.mode==='first-person'||camera.mode==='free')?getCameraDirection(camera):{x:Math.sin(yaw),z:-Math.cos(yaw)},dx=(right.x*m.x+forward.x*m.z)*speed,dy=m.y*speed,dz=(right.z*m.x+forward.z*m.z)*speed,p=clampCameraPosition({x:camera.position.x+dx,y:camera.position.y+dy,z:camera.position.z+dz},camera.bounds),t=clampCameraPosition({x:camera.target.x+dx,y:camera.target.y+dy,z:camera.target.z+dz},camera.bounds);return Object.assign({},camera,{position:p,target:t,revision:(camera.revision||0)+1});}
function focusCameraOnObject(camera,object,options){if(!camera||!object)return camera;const o=options||{},mesh=getSceneObjectWorldMesh(object),b=getMeshBounds(mesh),center=o.target?vector3(o.target):b?{x:b.center[0],y:b.center[1],z:b.center[2]}:vector3(object.transform&&object.transform.position),radius=b?Math.max(.5,Math.hypot(...b.size)/2):1,n=Object.assign({},camera,{target:center,distance:clampNumber(o.distance,radius*.8,500,radius*2.8),followId:object.id||null,revision:(camera.revision||0)+1});return orbitCamera(n,0,0);}
function updateCameraFollow(camera,objects,delta){if(!camera||camera.mode!=='follow'||!camera.followId||!Array.isArray(objects))return camera;const obj=objects.find(v=>v&&v.id===camera.followId);if(!obj)return camera;const p=vector3(obj.transform&&obj.transform.position),t=camera.target,a=clampNumber(delta,.001,1,.18),target={x:t.x+(p.x-t.x)*a,y:t.y+(p.y-t.y)*a,z:t.z+(p.z-t.z)*a};return orbitCamera(Object.assign({},camera,{target,revision:(camera.revision||0)+1}),0,0);}
function serializeCameraState(camera){if(!camera||camera.kind!=='ideevision-camera')return null;return JSON.stringify({version:1,mode:camera.mode,position:camera.position,target:camera.target,yaw:camera.yaw,pitch:camera.pitch,distance:camera.distance,fov:camera.fov,near:camera.near,far:camera.far,moveSpeed:camera.moveSpeed,zoomSpeed:camera.zoomSpeed,bounds:camera.bounds,followId:camera.followId,enabled:camera.enabled});}
function restoreCameraState(value){try{const d=typeof value==='string'?JSON.parse(value):value;if(!d||d.version!==1)return {ok:false,camera:null,error:'unsupported-camera-state'};return {ok:true,camera:createCameraState(d),error:null};}catch(e){return {ok:false,camera:null,error:'invalid-camera-state'};}}

function createRenderEnvironment(options){
 const o=options&&typeof options==='object'?options:{};
 const lights=Array.isArray(o.lights)?o.lights.slice(0,16).map((l,i)=>({id:String(l.id||'light-'+i),type:['directional','point'].includes(l.type)?l.type:'directional',direction:vector3(l.direction,{x:-.4,y:1,z:.3}),position:vector3(l.position,{x:0,y:5,z:0}),color:normalizeHexColor(l.color,'#FFFFFF'),intensity:clampNumber(l.intensity,0,8,1),range:clampNumber(l.range,.01,10000,20),enabled:l.enabled!==false})): [{id:'sun',type:'directional',direction:{x:-.4,y:1,z:.3},position:{x:0,y:5,z:0},color:'#FFFFFF',intensity:1,range:100,enabled:true}];
 return {kind:'ideevision-render-environment',version:1,skyTop:normalizeHexColor(o.skyTop,'#6C9FC5'),skyHorizon:normalizeHexColor(o.skyHorizon,'#C5D9E4'),groundColor:normalizeHexColor(o.groundColor,'#536C55'),ambient:clampNumber(o.ambient,0,1,.32),fogColor:normalizeHexColor(o.fogColor,'#C5D9E4'),fogNear:clampNumber(o.fogNear,0,100000,35),fogFar:clampNumber(o.fogFar,1,100000,120),fogDensity:clampNumber(o.fogDensity,0,1,0),lights};
}
function normalize3(v){const n=Math.hypot(v.x,v.y,v.z)||1;return {x:v.x/n,y:v.y/n,z:v.z/n};}
function evaluateRenderLighting(normal,environment,point){
 const env=environment&&environment.kind==='ideevision-render-environment'?environment:createRenderEnvironment(environment),n=normalize3(normal||{x:0,y:1,z:0});
 let diffuse=0;
 env.lights.forEach(light=>{if(!light.enabled)return;let direction;if(light.type==='point'){const p=vector3(point),d={x:light.position.x-p.x,y:light.position.y-p.y,z:light.position.z-p.z},distance=Math.hypot(d.x,d.y,d.z);direction=normalize3(d);diffuse+=Math.max(0,n.x*direction.x+n.y*direction.y+n.z*direction.z)*light.intensity/(1+(distance/light.range)**2);}else{direction=normalize3(light.direction);diffuse+=Math.max(0,n.x*direction.x+n.y*direction.y+n.z*direction.z)*light.intensity;}});
 return {ambient:env.ambient,diffuse:Math.min(1,diffuse),total:Math.min(1.5,env.ambient+diffuse)};
}
function drawEnvironmentBackground(ctx,width,height,environment){
 if(!ctx||typeof ctx.createLinearGradient!=='function')return false;
 const env=environment&&environment.kind==='ideevision-render-environment'?environment:createRenderEnvironment(environment),gradient=ctx.createLinearGradient(0,0,0,height);
 gradient.addColorStop(0,env.skyTop);gradient.addColorStop(.58,env.skyHorizon);gradient.addColorStop(.59,env.groundColor);gradient.addColorStop(1,env.groundColor);
 ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);return true;
}
function projectMeshVertex(vertex,camera,width,height){
 const c=camera||createCameraState(),position=vector3(c.position,{x:0,y:3,z:8}),forward=getCameraDirection(c),right=normalize3({x:-forward.z,y:0,z:forward.x}),up=normalize3({x:forward.y*right.z-forward.z*right.y,y:forward.z*right.x-forward.x*right.z,z:forward.x*right.y-forward.y*right.x});
 const rel={x:vertex[0]-position.x,y:vertex[1]-position.y,z:vertex[2]-position.z},depth=rel.x*forward.x+rel.y*forward.y+rel.z*forward.z,near=c.near||.05;
 if(depth<near)return null;
 const focal=(height/2)/Math.tan((c.fov||60)*Math.PI/360);
 return {x:width/2+(rel.x*right.x+rel.y*right.y+rel.z*right.z)*focal/depth,y:height/2-(rel.x*up.x+rel.y*up.y+rel.z*up.z)*focal/depth,depth};
}
function renderMeshToCanvas(ctx,mesh,camera,options){
 const o=options&&typeof options==='object'?options:{},env=createRenderEnvironment(o.environment||{}),width=Math.max(1,Number(o.width)||ctx&&ctx.canvas&&ctx.canvas.width||1),height=Math.max(1,Number(o.height)||ctx&&ctx.canvas&&ctx.canvas.height||1);
 if(!ctx||!mesh||!Array.isArray(mesh.vertices)||!Array.isArray(mesh.faces))return {ok:false,drawnFaces:0,skippedFaces:0,error:'invalid-render-input'};
 const vertices=mesh.vertices.map(v=>projectMeshVertex(v,camera,width,height)),faces=[];
 mesh.faces.forEach((face,index)=>{if(!Array.isArray(face)||face.length<3)return;const points=face.map(i=>vertices[i]);if(points.some(p=>!p))return;
  const a=mesh.vertices[face[0]],b=mesh.vertices[face[1]],c=mesh.vertices[face[2]],u={x:b[0]-a[0],y:b[1]-a[1],z:b[2]-a[2]},v={x:c[0]-a[0],y:c[1]-a[1],z:c[2]-a[2]},normal=normalize3({x:u.y*v.z-u.z*v.y,y:u.z*v.x-u.x*v.z,z:u.x*v.y-u.y*v.x}),uvs=mesh.uvs||[],uv=face.reduce((sum,vi)=>({x:sum.x+(uvs[vi]?uvs[vi][0]:.5)/face.length,y:sum.y+(uvs[vi]?uvs[vi][1]:.5)/face.length}),{x:0,y:0});
  const matId=mesh.faceMaterials&&mesh.faceMaterials[index],material=mesh.materials&&mesh.materials[matId]||mesh.materials&&mesh.materials[mesh.material]||mesh.material||'#AAB6C4',light=evaluateRenderLighting(normal,env,a),appearance=evaluateMaterialAppearance(material, [uv.x,uv.y],{ambient:light.ambient,diffuse:light.diffuse});
  const fog=env.fogDensity>0?Math.max(0,Math.min(1,(points.reduce((s,p)=>s+p.depth,0)/points.length-env.fogNear)/Math.max(1,env.fogFar-env.fogNear)))*env.fogDensity:0;
  faces.push({points,depth:points.reduce((s,p)=>s+p.depth,0)/points.length,color:appearance.color,opacity:appearance.opacity*(1-fog),fogColor:env.fogColor,index});
 });
 faces.sort((a,b)=>b.depth-a.depth);let drawn=0;
 faces.forEach(face=>{if(face.opacity<=0)return;ctx.beginPath();ctx.moveTo(face.points[0].x,face.points[0].y);for(let i=1;i<face.points.length;i++)ctx.lineTo(face.points[i].x,face.points[i].y);ctx.closePath();ctx.globalAlpha=face.opacity;ctx.fillStyle=face.color;ctx.fill();if(o.wireframe){ctx.strokeStyle=o.wireframeColor||'#202833';ctx.lineWidth=Number(o.lineWidth)||1;ctx.stroke();}drawn++;});
 ctx.globalAlpha=1;
 return {ok:true,drawnFaces:drawn,skippedFaces:mesh.faces.length-drawn,transparentFaces:faces.filter(f=>f.opacity<1).length,environment:env.kind};
}
function play(canvas,world,onCaption){
 const ctx=canvas.getContext('2d');let raf=0,stopped=false,yaw=.65,zoom=1,drag=false,lastX=0,lastY=0,pitch=.35,w=0,h=0,cameraX=0,cameraZ=0,moveX=0,moveZ=0,inside=null,pointerStart=null;
 const resize=()=>{const d=Math.min(root.devicePixelRatio||1,2);canvas.width=canvas.clientWidth*d;canvas.height=canvas.clientHeight*d;ctx.setTransform(d,0,0,d,0,0)};
 resize();root.addEventListener('resize',resize);
 const pointerDown=e=>{const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;pointerStart={x:e.clientX,y:e.clientY};if(inside){drag=false;if(x<118&&y>h-132){moveX=Math.max(-1,Math.min(1,(x-62)/42));moveZ=Math.max(-1,Math.min(1,(y-(h-72))/42));drag='interior-pad'}return}if(x<118&&y>h-132){drag=true;moveX=Math.max(-1,Math.min(1,(x-62)/42));moveZ=Math.max(-1,Math.min(1,(y-(h-72))/42));}else{drag=true;moveX=0;moveZ=0;lastX=e.clientX;lastY=e.clientY;drag='camera'}if(canvas.setPointerCapture)canvas.setPointerCapture(e.pointerId)};
 const pointerMove=e=>{if(drag==='camera'){yaw+=(e.clientX-lastX)*.008;pitch=Math.max(.12,Math.min(.72,pitch+(e.clientY-lastY)*.003));lastX=e.clientX;lastY=e.clientY}else if(drag==='interior-pad'){const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;moveX=Math.max(-1,Math.min(1,(x-62)/42));moveZ=Math.max(-1,Math.min(1,(y-(h-72))/42));}else if(drag){const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;moveX=Math.max(-1,Math.min(1,(x-62)/42));moveZ=Math.max(-1,Math.min(1,(y-(h-72))/42));}};
 const pointerUp=e=>{const wasCamera=drag==='camera',wasInteriorPad=drag==='interior-pad',start=pointerStart;drag=false;moveX=0;moveZ=0;if(!start||!e)return;const moved=Math.hypot(e.clientX-start.x,e.clientY-start.y);pointerStart=null;if(moved>9)return;if(inside){if(wasInteriorPad)return;const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;const touchAction=getInteriorTouchAction(x,y,w,h);if(touchAction==='door'){inside.doorTarget=inside.doorTarget?0:1;onCaption(inside.doorTarget?'La porte s’ouvre.':'La porte se ferme.');}else if(touchAction==='examine'){const rooms=inside.building.interior.rooms||['séjour'],name=rooms[inside.roomIndex]||rooms[0],result=interactWithNearbyFurniture(inside.x,inside.z,name,inside.furnitureStates,.5);if(result.ok){inside.furnitureStates=result.states;inside.selectedFurnitureId=result.nearby.id;}onCaption(result.message);}else if(touchAction==='select-door'){const rooms=inside.building.interior.rooms||['séjour'],options=getConnectedRoomOptions(rooms,inside.roomIndex,inside.building.interior.connections);if(options.length){const selection=selectNextInteriorDoor(options,inside.selectedDoorIndex);inside.selectedDoorIndex=selection.selectedIndex;inside.doorOpen=selection.doorOpen;inside.doorTarget=selection.doorTarget;onCaption(selection.message)}else onCaption('Aucune autre pièce reliée.');}else if(x>w*.5-62&&x<w*.5+62&&y>h-100&&y<h-42){const rooms=inside.building.interior.rooms||['séjour'],name=rooms[inside.roomIndex]||rooms[0],result=interactWithNearbyFurniture(inside.x,inside.z,name,inside.furnitureStates,.5);if(result.ok){inside.furnitureStates=result.states;inside.selectedFurnitureId=result.nearby.id;}onCaption(result.message);}else if(x>w*.9&&y>h*.58&&inside.building.interior.stairs){const stair=getInteriorStairInteraction(inside.x,inside.z,inside.level,inside.building.interior.levels,true,.34);if(!stair.near)onCaption('Approche-toi des escaliers avant de monter.');else if(stair.canGoUp){const change=changeInteriorLevel(inside.level,inside.building.interior.levels,1,true);if(change.changed){Object.assign(inside,getInteriorLevelEntryState(change.level));onCaption('Tu montes au niveau '+(inside.level+1)+'.')}}else onCaption('Tu es déjà au dernier étage.')}else if(x>w*.78&&y<h*.42&&inside.building.interior.stairs){const stair=getInteriorStairInteraction(inside.x,inside.z,inside.level,inside.building.interior.levels,true,.34);if(!stair.near)onCaption('Approche-toi des escaliers avant de descendre.');else if(stair.canGoDown){const change=changeInteriorLevel(inside.level,inside.building.interior.levels,-1,true);if(change.changed){Object.assign(inside,getInteriorLevelEntryState(change.level));onCaption('Tu descends au niveau '+(inside.level+1)+'.')}}else onCaption('Tu es déjà au rez-de-chaussée.')}else if(y>h*.78&&isNearInteriorDoor(inside.x,inside.z,'front',.3)){inside=null;onCaption('Tu es ressorti du bâtiment.')}else if(x<w*.34){inside.doorTarget=inside.doorTarget?0:1;onCaption(inside.doorTarget?'La porte s’ouvre.':'La porte se ferme.')}else if(inside.doorOpen>.7&&x>w*.68){const options=getConnectedRoomOptions(inside.building.interior.rooms,inside.roomIndex,inside.building.interior.connections);if(options.length){const selection=selectNextInteriorDoor(options,inside.selectedDoorIndex);inside.selectedDoorIndex=selection.selectedIndex;inside.doorOpen=selection.doorOpen;inside.doorTarget=selection.doorTarget;onCaption(selection.message)}else onCaption('Aucune autre pièce reliée.')}else if(inside.doorOpen>.7){const options=getConnectedRoomOptions(inside.building.interior.rooms,inside.roomIndex,inside.building.interior.connections);const active=options[Math.min(inside.selectedDoorIndex||0,Math.max(0,options.length-1))];if(active&&!isNearInteriorDoor(inside.x,inside.z,active.side,.34)){onCaption('Approche-toi de la porte '+active.side+' avant de la franchir.')}else if(options.length){const selected=Math.min(inside.selectedDoorIndex||0,options.length-1),choice=options[selected];inside.roomIndex=getNextConnectedRoomIndex(inside.building.interior.rooms,inside.roomIndex,selected,inside.building.interior.connections);inside.selectedDoorIndex=0;inside.x=0;inside.z=.55;inside.doorOpen=0;inside.doorTarget=0;onCaption('Tu passes par la porte vers : '+choice.target+'.')}else onCaption('Cette pièce ne possède pas de porte reliée.')}return}const nearby=world.elements.filter(o=>(o.type==='house'||o.type==='building')&&Math.hypot(o.x-cameraX,o.z-cameraZ)<1.65).sort((a,b)=>Math.hypot(a.x-cameraX,a.z-cameraZ)-Math.hypot(b.x-cameraX,b.z-cameraZ))[0];if(nearby){inside={building:nearby,x:0,z:.55,level:0,roomIndex:0,selectedDoorIndex:0,doorOpen:0,doorTarget:0,furnitureStates:{},selectedFurnitureId:null};onCaption('Tu es entré dans '+(nearby.type==='house'?'la maison':'un immeuble')+'. Déplace-toi avec WASD ou le pavé tactile.')}};
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
  const speed=.018;let stairFade=0;if(inside.levelTransition){const step=advanceInteriorLevelTransition(inside.levelTransition,.055);stairFade=step.opacity;if(step.switchLevel){const transition=step.transition;Object.assign(inside,getInteriorLevelEntryState(inside.levelTransition.targetLevel));inside.levelTransition=transition;}else inside.levelTransition=step.transition;if(step.complete)inside.levelTransition=null;}inside.doorOpen+=(inside.doorTarget-inside.doorOpen)*.12;
  const roomNames=inside.building.interior.rooms||['séjour'],roomName=roomNames[inside.roomIndex]||roomNames[0];
  const doorOptions=getConnectedRoomOptions(roomNames,inside.roomIndex,inside.building.interior.connections);
  const selectedDoor=doorOptions[Math.min(inside.selectedDoorIndex||0,Math.max(0,doorOptions.length-1))];
  const roomModel=getInteriorRoomModel(roomName,doorOptions);
  const dx=inside.levelTransition?0:(keys.has('d')||keys.has('arrowright')?speed:0)-(keys.has('a')||keys.has('arrowleft')?speed:0)+moveX*speed;
  const dz=inside.levelTransition?0:(keys.has('s')||keys.has('arrowdown')?speed:0)-(keys.has('w')||keys.has('arrowup')?speed:0)+moveZ*speed;
  const previousX=inside.x,previousZ=inside.z;const moved=resolveInteriorMovement(inside.x,inside.z,dx,dz,roomName,inside.doorOpen,selectedDoor?selectedDoor.side:'back');inside.x=moved.x;inside.z=moved.z;const stairTraversal=getInteriorStairTraversal(inside.x,inside.z,inside.x-previousX,inside.z-previousZ,inside.level,inside.building.interior.levels,inside.building.interior.stairs,.18);if(stairTraversal.triggered&&!inside.levelTransition){inside.levelTransition=createInteriorLevelTransition(stairTraversal.level-1,stairTraversal.direction);onCaption(stairTraversal.direction==='up'?'Tu montes automatiquement par l’escalier.':'Tu descends automatiquement par l’escalier.');}
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
  // Escalier intérieur : marches, palier et garde-corps dessinés en perspective 2D.
  const stairModel=getInteriorStairModel(inside.level,inside.building.interior.levels,inside.building.interior.stairs),stairAnimation=getInteriorStairAnimation(inside.levelTransition,stairModel.steps.length);
  if(stairModel.visible){
   const sx=cx+half*.12,baseY=floorY-16,run=half*.055,rise=(floorY-back)*.055,ascending=stairAnimation.active?stairAnimation.direction==='up':stairModel.direction==='up';
   stairModel.steps.forEach(step=>{
    const px=sx+(ascending?step.progress:1-step.progress)*half*.48,py=baseY-step.rise*rise,stepState=stairAnimation.active&&step.index-1<stairAnimation.completedSteps?'completed':stairAnimation.active&&step.index-1===stairAnimation.currentStep?'current':'idle';
    ctx.fillStyle=stepState==='current'?'#F4D27A':stepState==='completed'?'#B98A5C':'#76543A';ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+run,py);ctx.lineTo(px+run,py+rise*.72);ctx.lineTo(px,py+rise*.72);ctx.closePath();ctx.fill();if(stepState==='current'){ctx.strokeStyle='#FFF1B8';ctx.lineWidth=2;ctx.stroke();}
    ctx.fillStyle='#B98A5C';ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+run,py);ctx.lineTo(px+run-3,py-5);ctx.lineTo(px-3,py-5);ctx.closePath();ctx.fill();
   });
   const landing=getInteriorStairLanding(inside.level,inside.building.interior.levels,inside.building.interior.stairs,stairAnimation.active?stairAnimation.direction:stairModel.direction),landingX=ascending?sx+half*.48:sx,landingY=baseY-rise*1.12;ctx.fillStyle=landing.accessible?'rgba(244,210,122,.22)':'rgba(160,160,160,.12)';ctx.beginPath();ctx.moveTo(landingX-5,landingY);ctx.lineTo(landingX+half*.12,landingY-7);ctx.lineTo(landingX+half*.12+run,landingY+rise*.5-7);ctx.lineTo(landingX+run,landingY+rise*.5);ctx.closePath();ctx.fill();ctx.strokeStyle=landing.accessible?'#F4D27A':'#8A929B';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle=landing.accessible?'#F4D27A':'#AAB0B8';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText(landing.marker,landingX+half*.06+run/2,landingY+rise*.28);
   ctx.strokeStyle='#D8C29B';ctx.lineWidth=3;ctx.beginPath();
   ctx.moveTo(ascending?sx:sx+half*.48,baseY-rise*.2);ctx.lineTo(ascending?sx+half*.48:sx,baseY-rise*1.12);ctx.stroke();
   ctx.strokeStyle='#5B4939';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ascending?sx+half*.48:sx,baseY-rise*1.12);ctx.lineTo(ascending?sx+half*.56:sx-half*.08,baseY-rise*1.12);ctx.lineTo(ascending?sx+half*.56:sx-half*.08,baseY-rise*.65);ctx.stroke();
   ctx.fillStyle='#F4D27A';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText(stairModel.canGoUp&&stairModel.canGoDown?'ESCALIER • MONTER / DESCENDRE':stairModel.canGoUp?'ESCALIER • MONTER':'ESCALIER • DESCENDRE',sx+half*.34,baseY-rise*1.3);
  }
  const stairAccess=getInteriorStairInteraction(inside.x,inside.z,inside.level,inside.building.interior.levels,inside.building.interior.stairs,.34);
  if(stairAccess.visible){ctx.fillStyle='rgba(10,16,24,.78)';ctx.fillRect(cx-112,h*.69,224,22);ctx.fillStyle=stairAccess.near?'#F4D27A':'#FFFFFF';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText(stairAccess.message,cx,h*.69+15);}
  // Éclairage ambiant simulé par un voile léger, sans calcul physique lourd.
  ctx.fillStyle='rgba(255,224,166,'+(Math.max(0,.16-roomModel.lighting.brightness*.1))+')';ctx.fillRect(left,back,right-left,floorY-back);
  ctx.fillStyle='#FFFFFF';ctx.font='700 17px system-ui';ctx.textAlign='center';ctx.fillText(roomName.toLocaleUpperCase('fr'),cx,34);
  ctx.font='12px system-ui';ctx.fillStyle='rgba(255,255,255,.92)';const levelIndicator=getInteriorLevelIndicator(inside.level,inside.building.interior.levels,inside.building.interior.stairs);ctx.fillText('Pièce '+(inside.roomIndex+1)+'/'+roomNames.length+' • '+levelIndicator.label,cx,54);
  const floorNavigation=getInteriorFloorNavigation(inside.level,inside.building.interior.levels,inside.building.interior.stairs),stairPrompt=getInteriorStairPrompt(inside.x,inside.z,inside.level,inside.building.interior.levels,inside.building.interior.stairs),navW=Math.min(190,Math.max(138,w*.38)),navX=w-navW-10;ctx.fillStyle='rgba(10,16,24,.86)';ctx.fillRect(navX,8,navW,72);ctx.textAlign='center';ctx.fillStyle='#F4D27A';ctx.font='bold 11px system-ui';ctx.fillText(floorNavigation.floorName,navX+navW/2,25);ctx.fillStyle='#FFFFFF';ctx.font='10px system-ui';ctx.fillText(floorNavigation.nextAction,navX+navW/2,41);ctx.fillStyle='rgba(255,255,255,.72)';ctx.font='9px system-ui';ctx.fillText('NIVEAU '+floorNavigation.level+' / '+floorNavigation.total,navX+navW/2,54);ctx.fillStyle=stairPrompt.ready?'#8FE3A0':'#F4D27A';ctx.font='bold 9px system-ui';ctx.fillText(stairPrompt.label,navX+navW/2,69);
  const interactionStatus=getInteriorInteractionStatus(inside.doorOpen,inside.doorTarget,selectedDoor,selectedDoor&&isNearInteriorDoor(inside.x,inside.z,selectedDoor.side,.34),nearbyFurniture);const statusWidth=Math.min(w-16,320);ctx.fillStyle='rgba(10,16,24,.82)';ctx.fillRect(8,8,statusWidth,54);ctx.fillStyle='#F4D27A';ctx.textAlign='left';ctx.font='bold 11px system-ui';ctx.fillText('PORTE : '+interactionStatus.doorState,18,27);ctx.fillStyle='#FFF';ctx.font='11px system-ui';ctx.fillText(interactionStatus.passage,18,44);ctx.fillText(interactionStatus.furniture,18,57);
  ctx.textAlign='center';ctx.font='12px system-ui';ctx.fillStyle='rgba(255,255,255,.92)';
  const doorIndicator=getInteriorDoorIndicator(doorOptions,inside.selectedDoorIndex);ctx.fillText(doorIndicator.available?doorIndicator.label+' • mur '+doorIndicator.side.toLocaleUpperCase('fr'):doorIndicator.label,cx,h-30);
  ctx.fillText(nearbyFurniture?'Meuble proche : '+nearbyFurniture.label+' • F ou bouton pour examiner':'Approche-toi d’un meuble • F ou bouton pour examiner',cx,h-12);
  const touchLabels=getInteriorTouchLabels(inside.doorOpen,inside.doorTarget,doorOptions.length,nearbyFurniture),touchLayout=getInteriorTouchLayout(w,h);const touchButtons=[{x:touchLayout.centers[0],label:touchLabels.door,enabled:true},{x:touchLayout.centers[1],label:touchLabels.examine,enabled:touchLabels.examineEnabled},{x:touchLayout.centers[2],label:touchLabels.selectDoor,enabled:touchLabels.selectDoorEnabled}];touchButtons.forEach(button=>{const bw=touchLayout.buttonWidth;ctx.fillStyle=button.enabled?'rgba(20,29,42,.92)':'rgba(20,29,42,.55)';ctx.fillRect(button.x-bw/2,touchLayout.top,bw,touchLayout.bottom-touchLayout.top);ctx.strokeStyle=button.enabled?'#F4D27A':'rgba(190,198,208,.45)';ctx.lineWidth=1.5;ctx.strokeRect(button.x-bw/2,touchLayout.top,bw,touchLayout.bottom-touchLayout.top);ctx.fillStyle=button.enabled?'#F4D27A':'rgba(210,216,224,.6)';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText(button.label,button.x,touchLayout.centerY+4);});if(stairFade>0){const transitionInfo=getInteriorTransitionIndicator(inside.levelTransition);ctx.fillStyle='rgba(0,0,0,'+Math.min(.94,stairFade*.94)+')';ctx.fillRect(0,0,w,h);ctx.fillStyle='#F4D27A';ctx.font='bold 17px system-ui';ctx.textAlign='center';ctx.fillText(transitionInfo.label||'CHANGEMENT D’ÉTAGE',cx,h*.5-20);ctx.font='10px system-ui';ctx.fillStyle='rgba(255,255,255,.88)';ctx.fillText(transitionInfo.phaseLabel||'',cx,h*.5-4);const barW=Math.min(220,w*.62),barH=7,barX=cx-barW/2,barY=h*.5+8;ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(barX,barY,barW,barH);ctx.fillStyle='#F4D27A';ctx.fillRect(barX,barY,barW*transitionInfo.progress,barH);ctx.font='11px system-ui';ctx.fillStyle='#FFFFFF';ctx.fillText(transitionInfo.percent+' %',cx,barY+24);}
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
root.IdeeVisionWorld=Object.freeze({version:1,isWorldRequest,create,terrainHeight,createBoxGeometry,createCylinderGeometry,createSphereGeometry,transformGeometryMesh,mergeGeometryMeshes,validateGeometryMesh,measureGeometryMesh,assembleGeometryModel,createBuildingGeometry,createFurnitureGeometry,createMaterial,validateMaterial,createMaterialLibrary,getMaterialPreset,generatePlanarUV,sampleMaterialTexture,applyMaterialToMesh,evaluateMaterialAppearance,createMaterialSurfacePreview,getSceneObjectWorldMesh,getMeshBounds,createRenderEnvironment,evaluateRenderLighting,drawEnvironmentBackground,projectMeshVertex,renderMeshToCanvas,createCameraState,getCameraDirection,updateCameraMode,orbitCamera,dollyCamera,zoomCamera,moveCamera,focusCameraOnObject,updateCameraFollow,serializeCameraState,restoreCameraState,createInteractiveScene,intersectRayBounds,pickSceneObject,selectSceneObject,updateSceneObjectTransform,moveSceneObject,rotateSceneObject,scaleSceneObject,detectSceneCollisions,setSceneObjectVisibility,setSceneObjectLock,getSceneInteractionSummary,getInteriorRoomModel,getInteriorWindows,getInteriorLighting,getNearbyFurniture,interactWithFurniture,interactWithNearbyFurniture,getInteriorTouchAction,getInteriorTouchLayout,getInteriorTouchLabels,getInteriorDoorIndicator,getInteriorInteractionStatus,getInteriorLevelIndicator,getInteriorFloorNavigation,getInteriorStairModel,getInteriorStairPrompt,getInteriorStairInteraction,getInteriorStairTraversal,getInteriorStairLanding,getInteriorTransitionOpacity,createInteriorLevelTransition,advanceInteriorLevelTransition,getInteriorTransitionIndicator,getInteriorStairAnimation,selectNextInteriorDoor,getInteriorRoomConnections,analyzeInteriorRoomNetwork,findInteriorRoute,findInteriorRouteAlternatives,resolveInteriorDoorAccess,analyzeInteriorAccessNetwork,analyzeInteriorCirculation,getConnectedRoomOptions,getNextConnectedRoomIndex,getInteriorDoorThreshold,isNearInteriorDoor,changeInteriorLevel,getInteriorLevelEntryState,resolveInteriorMovement,play});
})(window);
