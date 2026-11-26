const fs=require('fs');
const vm=require('vm');
const windowMock={};
const context={window:windowMock,Math,Array,String,Object,Number,RegExp};
vm.createContext(context);
vm.runInContext(fs.readFileSync('app/src/main/assets/engine/world-engine-v1.js','utf8'),context);
const World=windowMock.IdeeVisionWorld;
let passed=0,failed=0;
function test(name,fn){try{fn();passed++;console.log('✓ '+name)}catch(e){failed++;console.error('✗ '+name+': '+e.message)}}
function assert(v,m){if(!v)throw new Error(m)}
test('moteur de monde chargé',()=>assert(World&&World.version===1,'moteur absent'));
test('reconnaît une demande de ville ou monde ouvert',()=>assert(World.isWorldRequest('Crée une ville en monde ouvert 3D'),'requête non reconnue'));
test('génère une ville avec routes, bâtiments, arbres et voitures',()=>{
 const w=World.create('Crée une ville en 3D');
 assert(w.kind==='procedural-world'&&w.biome==='city','type monde incorrect');
 assert(w.roads.length>=2,'routes absentes');
 for(const t of ['building','tree','car','park'])assert(w.elements.some(e=>e.type===t),'élément absent '+t);
});
test('génère une forêt sans rues urbaines',()=>{
 const w=World.create('Crée une forêt dense');
 assert(w.biome==='forest','biome forêt absent');
 assert(w.elements.some(e=>e.type==='tree'),'arbres absents');
 assert(w.roads.length===0,'routes urbaines inattendues');
});
test('génère une campagne avec maisons et arbres',()=>{
 const w=World.create('Crée une campagne');
 assert(w.biome==='countryside','biome incorrect');
 assert(w.elements.some(e=>e.type==='house')&&w.elements.some(e=>e.type==='tree'),'éléments campagne absents');
});
test('reconnaît les montagnes et construit un relief plus élevé que la ville',()=>{
 const mountain=World.create('Crée un paysage de montagnes');
 const city=World.create('Crée une ville');
 assert(mountain.biome==='mountain','biome montagne absent');
 assert(mountain.terrain.amplitude>city.terrain.amplitude,'relief montagne trop faible');
 const heights=[World.terrainHeight(mountain,-3,-1),World.terrainHeight(mountain,3,2),World.terrainHeight(mountain,0,0)];
 assert(Math.max(...heights)-Math.min(...heights)>.35,'terrain trop plat');
});
test('terrain forêt et campagne avec amplitude intermédiaire',()=>{
 const forest=World.create('Crée une forêt');const country=World.create('Crée une campagne');
 assert(forest.terrain.amplitude>0&&country.terrain.amplitude>0,'terrain sans relief');
 assert(forest.terrain.resolution>=8,'résolution du terrain trop faible');
});
test('les immeubles urbains possèdent plusieurs étages',()=>{
 const w=World.create('Crée une ville moderne');
 const buildings=w.elements.filter(e=>e.type==='building');
 assert(buildings.length>0,'aucun immeuble généré');
 assert(buildings.every(e=>Number.isInteger(e.floors)&&e.floors>=2&&e.floors<=5),'nombre d’étages incorrect');
});
test('les maisons de campagne ont une échelle positive',()=>{
 const w=World.create('Crée une campagne avec des maisons');
 const houses=w.elements.filter(e=>e.type==='house');
 assert(houses.length>0,'aucune maison générée');
 assert(houses.every(e=>e.scale>0),'échelle maison invalide');
});
test('les maisons disposent d’une porte et d’un intérieur défini',()=>{
 const w=World.create('Crée une campagne');
 const house=w.elements.find(e=>e.type==='house');
 assert(house&&house.door&&house.interior,'données de porte ou intérieur absentes');
 assert(house.interior.rooms.includes('séjour')&&house.interior.rooms.includes('chambre'),'pièces de maison absentes');
 assert(house.interior.stairs===false,'une maison simple ne doit pas avoir d’escalier');
});
test('les immeubles disposent d’étages, d’une porte et d’un escalier intérieur',()=>{
 const w=World.create('Crée une ville');
 const building=w.elements.find(e=>e.type==='building');
 assert(building&&building.floors>=2,'immeuble à étages absent');
 assert(building.door&&building.interior,'porte ou intérieur absent');
 assert(building.interior.stairs===true&&building.interior.levels===building.floors,'escalier ou niveaux absents');
});
test('les maisons et immeubles déclarent plusieurs espaces intérieurs nommés',()=>{
 const house=World.create('Crée une campagne').elements.find(e=>e.type==='house');
 const building=World.create('Crée une ville').elements.find(e=>e.type==='building');
 assert(house.interior.rooms.length>=4,'pièces de maison insuffisantes');
 assert(building.interior.rooms.length>=3,'pièces d’immeuble insuffisantes');
 assert(new Set(house.interior.rooms).size===house.interior.rooms.length,'noms de pièces dupliqués');
});
test('les intérieurs possèdent un plan de pièces et des emplacements de mobilier',()=>{
 const house=World.create('Crée une campagne').elements.find(e=>e.type==='house');
 const building=World.create('Crée une ville').elements.find(e=>e.type==='building');
 for(const item of [house,building]){assert(item.interior.layout.length>=3,'plan intérieur incomplet');item.interior.layout.forEach(room=>{assert(typeof room.name==='string'&&Number.isFinite(room.x)&&Number.isFinite(room.z),'position de pièce invalide')})}
});
test('le plan intérieur crée des connexions en branches et des portes sur plusieurs murs',()=>{
 const rooms=['entrée','séjour','cuisine','chambre'];
 const links=World.getInteriorRoomConnections(rooms);
 assert(links.length===3,'nombre de portes incorrect');
 assert(links.some(link=>link.from==='entrée'&&link.to==='séjour'),'liaison entrée-séjour absente');
 assert(links.some(link=>link.from==='séjour'&&link.to==='cuisine'),'liaison séjour-cuisine absente');
 assert(links.some(link=>link.from==='séjour'&&link.to==='chambre'),'liaison séjour-chambre absente');
 assert(new Set(links.map(link=>link.side)).size>=3,'les portes ne sont pas réparties sur plusieurs murs');
 assert(links.every(link=>link.openable&&link.width>0&&link.doorId),'porte non franchissable ou sans identifiant');
});
test('le joueur peut choisir une porte parmi plusieurs pièces reliées',()=>{
 const rooms=['entrée','séjour','cuisine','chambre'];
 const fromEntry=World.getConnectedRoomOptions(rooms,0);
 const fromLiving=World.getConnectedRoomOptions(rooms,1);
 assert(fromEntry.length===1&&fromEntry[0].target==='séjour','la porte de l’entrée est incorrecte');
 assert(fromLiving.length===3,'le séjour doit proposer entrée, cuisine et chambre');
 assert(fromLiving[1].target==='cuisine'&&fromLiving[2].target==='chambre','choix des portes du séjour incorrect');
 assert(World.getNextConnectedRoomIndex(rooms,1,1)===2,'le premier choix du séjour ne mène pas à la cuisine');
 assert(World.getNextConnectedRoomIndex(rooms,1,2)===3,'le deuxième choix du séjour ne mène pas à la chambre');
 assert(World.getNextConnectedRoomIndex(rooms,3,0)===1,'retour de la chambre vers le séjour impossible');
});
test('les connexions personnalisées valident les pièces et leurs portes',()=>{
 const rooms=['entrée','salon','bureau'];
 const links=World.getInteriorRoomConnections(rooms,[{from:'entrée',to:'salon',doorId:'porte-principale',side:'front',width:.5},{from:'salon',to:'bureau',side:'left',openable:false},{from:'inconnue',to:'salon'}]);
 assert(links.length===2,'les connexions invalides ne sont pas filtrées');
 assert(links[0].side==='front'&&links[0].width===.5,'position ou largeur de porte personnalisée perdue');
 assert(World.getConnectedRoomOptions(rooms,1,[{from:'entrée',to:'salon'},{from:'salon',to:'bureau',openable:false}]).length===1,'porte désactivée proposée au joueur');
});
test('analyse le réseau intérieur et calcule les chemins depuis l’entrée',()=>{
 const result=World.analyzeInteriorRoomNetwork(['Entrée','Séjour','Cuisine','Chambre'],[
  {from:'Entrée',to:'Séjour',doorId:'d1'},
  {from:'Séjour',to:'Cuisine',doorId:'d2'},
  {from:'Séjour',to:'Chambre',doorId:'d3'}
 ],'Entrée');
 assert(result.isConnected&&result.reachableRooms.length===4,'réseau connecté mal détecté');
 assert(result.paths.Cuisine.join('>')==='Entrée>Séjour>Cuisine','chemin vers la cuisine incorrect');
 assert(result.rooms.find(room=>room.name==='Séjour').degree===3,'degré de connexion du séjour incorrect');
});
test('détecte les pièces isolées et les portes non franchissables',()=>{
 const result=World.analyzeInteriorRoomNetwork(['Entrée','Séjour','Grenier'],[
  {from:'Entrée',to:'Séjour',doorId:'d1'},
  {from:'Séjour',to:'Grenier',doorId:'d2',openable:false}
 ],'Entrée');
 assert(!result.isConnected&&result.unreachableRooms.includes('Grenier'),'pièce inaccessible non détectée');
 assert(result.isolatedRooms.includes('Grenier'),'pièce isolée non détectée');
});
test('identifie les extrémités d’un réseau en branches',()=>{
 const result=World.analyzeInteriorRoomNetwork(['Hall','Salon','Cuisine','Bureau'],[
  {from:'Hall',to:'Salon',doorId:'d1'},
  {from:'Salon',to:'Cuisine',doorId:'d2'},
  {from:'Salon',to:'Bureau',doorId:'d3'}
 ],'Hall');
 assert(result.deadEnds.includes('Cuisine')&&result.deadEnds.includes('Bureau'),'extrémités des branches incorrectes');
 assert(!result.deadEnds.includes('Salon'),'carrefour classé comme extrémité');
});
test('ignore les noms vides et les pièces dupliquées',()=>{
 const result=World.analyzeInteriorRoomNetwork(['Hall','','Hall','Salon'],[{from:'Hall',to:'Salon',doorId:'d1'}],'Hall');
 assert(result.roomCount===2&&result.isConnected,'normalisation des pièces incorrecte');
});
test('utilise la première pièce si le point de départ est inconnu',()=>{
 const result=World.analyzeInteriorRoomNetwork(['Hall','Salon'],[{from:'Hall',to:'Salon',doorId:'d1'}],'Inconnue');
 assert(result.startRoom==='Hall'&&result.paths.Salon.length===2,'point de départ de secours incorrect');
});
test('retourne un résultat stable pour un bâtiment sans pièce',()=>{
 const result=World.analyzeInteriorRoomNetwork([],[],'');
 assert(result.roomCount===0&&result.connectionCount===0&&!result.isConnected&&result.startRoom===null,'réseau vide incorrect');
});
test('calcule les composantes, les distances et les cycles du réseau intérieur',()=>{
 const result=World.analyzeInteriorRoomNetwork(['Hall','Salon','Cuisine','Bureau','Garage'],[
  {from:'Hall',to:'Salon',doorId:'d1'},
  {from:'Salon',to:'Cuisine',doorId:'d2'},
  {from:'Cuisine',to:'Hall',doorId:'d3'},
  {from:'Salon',to:'Bureau',doorId:'d4'}
 ],'Hall');
 assert(result.componentCount===2&&result.components.some(group=>group.includes('Garage')),'composantes incorrectes');
 assert(result.cycleRank===1,'cycle du réseau incorrect');
 assert(result.distances.Bureau===2&&result.distances.Garage===undefined,'distances incorrectes');
 assert(result.openConnectionCount===4,'nombre de portes accessibles incorrect');
});
test('trouve le chemin accessible le plus court entre deux pièces',()=>{
 const route=World.findInteriorRoute(['Hall','Salon','Cuisine','Bureau'],[
  {from:'Hall',to:'Salon',doorId:'d1'},
  {from:'Salon',to:'Cuisine',doorId:'d2'},
  {from:'Hall',to:'Bureau',doorId:'d3'},
  {from:'Bureau',to:'Cuisine',doorId:'d4'}
 ],'Hall','Cuisine');
 assert(route.reachable&&route.steps===2,'longueur du chemin incorrecte');
 assert(route.rooms[0]==='Hall'&&route.rooms[route.rooms.length-1]==='Cuisine','extrémités du chemin incorrectes');
 assert(route.doorIds.length===2,'identifiants des portes absents');
});
test('refuse un itinéraire vers une pièce isolée ou inconnue',()=>{
 const connections=[{from:'Hall',to:'Salon',doorId:'d1'}];
 const blocked=World.findInteriorRoute(['Hall','Salon','Grenier'],connections,'Hall','Grenier');
 const unknown=World.findInteriorRoute(['Hall','Salon'],connections,'Hall','Cave');
 assert(!blocked.reachable&&blocked.steps===0,'pièce isolée considérée accessible');
 assert(!unknown.reachable&&unknown.message.includes('inconnue'),'destination inconnue non signalée');
});
test('retourne un itinéraire vide lorsque le joueur est déjà dans la destination',()=>{
 const route=World.findInteriorRoute(['Hall','Salon'],[{from:'Hall',to:'Salon',doorId:'d1'}],'Salon','Salon');
 assert(route.reachable&&route.steps===0&&route.rooms.length===1,'itinéraire sur place incorrect');
});
test('gère les portes verrouillées avec une clé et les niveaux d’accès',()=>{
 const door={openable:true,locked:true,requiredKey:'cle-bureau',requiredAccessLevel:2};
 const denied=World.resolveInteriorDoorAccess(door,{keys:[],accessLevel:3});
 const keyOnly=World.resolveInteriorDoorAccess(door,{keys:['cle-bureau'],accessLevel:1});
 const allowed=World.resolveInteriorDoorAccess(door,{keys:['cle-bureau'],accessLevel:2});
 assert(!denied.allowed&&denied.reason==='locked','porte verrouillée accessible sans clé');
 assert(!keyOnly.allowed&&keyOnly.reason==='access-level','niveau d’accès insuffisant ignoré');
 assert(allowed.allowed&&allowed.canOpen,'accès valide refusé');
});
test('analyse les accès réellement disponibles et les portes bloquées',()=>{
 const result=World.analyzeInteriorAccessNetwork(['Hall','Couloir','Bureau','Archives'],[
  {from:'Hall',to:'Couloir',doorId:'hall-couloir'},
  {from:'Couloir',to:'Bureau',doorId:'bureau',locked:true,requiredKey:'badge-bureau'},
  {from:'Bureau',to:'Archives',doorId:'archives',requiredAccessLevel:3}
 ],'Hall',{keys:[],accessLevel:1});
 assert(result.reachableRooms.join(',')==='Hall,Couloir','réseau accessible incorrect');
 assert(result.unreachableRooms.includes('Bureau')&&result.unreachableRooms.includes('Archives'),'pièces protégées non détectées');
 assert(result.lockedDoorCount===1&&result.accessLevelBlockedCount===1,'motifs de refus incorrects');
});
test('respecte les portes à sens unique dans la navigation',()=>{
 const result=World.analyzeInteriorAccessNetwork(['Hall','Zone','Sortie'],[
  {from:'Hall',to:'Zone',doorId:'entrée-zone',oneWay:true},
  {from:'Sortie',to:'Zone',doorId:'sortie-zone',oneWay:true}
 ],'Hall',{});
 assert(result.reachableRooms.includes('Zone')&&!result.reachableRooms.includes('Sortie'),'sens unique non respecté');
});
test('refuse toujours une porte déclarée non ouvrable',()=>{
 const result=World.resolveInteriorDoorAccess({openable:false},{keys:['master'],accessLevel:99});
 assert(!result.allowed&&result.reason==='unavailable','porte indisponible autorisée');
});
test('propose plusieurs itinéraires courts alternatifs entre deux pièces',()=>{
 const result=World.findInteriorRouteAlternatives(['Hall','Salon','Cuisine','Bureau'],[
  {from:'Hall',to:'Salon',doorId:'hs'},
  {from:'Salon',to:'Cuisine',doorId:'sc'},
  {from:'Hall',to:'Bureau',doorId:'hb'},
  {from:'Bureau',to:'Cuisine',doorId:'bc'}
 ],'Hall','Cuisine',4);
 assert(result.reachable&&result.routes.length===2,'itinéraires alternatifs absents');
 assert(result.shortestSteps===2&&result.routes.every(route=>route.steps===2),'longueur des itinéraires incorrecte');
});
test('les itinéraires alternatifs respectent les clés et les niveaux d’accès',()=>{
 const rooms=['Hall','Couloir','Bureau'];
 const doors=[
  {from:'Hall',to:'Couloir',doorId:'locked',locked:true,requiredKey:'master'},
  {from:'Couloir',to:'Bureau',doorId:'level',requiredAccessLevel:2}
 ];
 const denied=World.findInteriorRouteAlternatives(rooms,doors,'Hall','Bureau',3,{keys:[],accessLevel:0});
 assert(!denied.reachable&&denied.routes.length===0,'un itinéraire protégé est accessible sans autorisation');
 const withKey=World.findInteriorRouteAlternatives(rooms,doors,'Hall','Bureau',3,{keys:['master'],accessLevel:1});
 assert(!withKey.reachable,'le niveau d’accès insuffisant est ignoré');
 const authorized=World.findInteriorRouteAlternatives(rooms,doors,'Hall','Bureau',3,{keys:['master'],accessLevel:2});
 assert(authorized.reachable&&authorized.routes[0].doorIds.join(',')==='locked,level','l’itinéraire autorisé est refusé');
});
test('les itinéraires alternatifs respectent les portes à sens unique',()=>{
 const rooms=['Entrée','Hall','Bureau'];
 const doors=[{from:'Entrée',to:'Hall',doorId:'one-way',oneWay:true},{from:'Hall',to:'Bureau',doorId:'hall-office'}];
 const forward=World.findInteriorRouteAlternatives(rooms,doors,'Entrée','Bureau');
 const backward=World.findInteriorRouteAlternatives(rooms,doors,'Hall','Entrée');
 assert(forward.reachable,'le sens autorisé est refusé');
 assert(!backward.reachable,'le sens inverse d’une porte à sens unique est autorisé');
});
test('limite le nombre de routes alternatives et exclut les portes fermées',()=>{
 const result=World.findInteriorRouteAlternatives(['A','B','C','D'],[
  {from:'A',to:'B',doorId:'ab'},
  {from:'B',to:'D',doorId:'bd'},
  {from:'A',to:'C',doorId:'ac'},
  {from:'C',to:'D',doorId:'cd',openable:false}
 ],'A','D',20);
 assert(result.routes.length===1&&result.routes[0].doorIds.join(',')==='ab,bd','limite ou filtrage des portes incorrect');
});
test('signale une absence de route alternative vers une destination inaccessible',()=>{
 const result=World.findInteriorRouteAlternatives(['A','B','C'],[{from:'A',to:'B',doorId:'ab'}],'A','C');
 assert(!result.reachable&&result.routes.length===0&&result.shortestSteps===null,'destination inaccessible déclarée atteignable');
});
test('détecte les pièces et portes critiques du réseau de circulation',()=>{
 const result=World.analyzeInteriorCirculation(['Hall','Couloir','Cuisine','Chambre','Bureau'],[
  {from:'Hall',to:'Couloir',doorId:'d1'},
  {from:'Couloir',to:'Cuisine',doorId:'d2'},
  {from:'Couloir',to:'Chambre',doorId:'d3'},
  {from:'Couloir',to:'Bureau',doorId:'d4'}
 ]);
 assert(result.criticalRooms.includes('Couloir'),'couloir central non identifié comme pièce critique');
 assert(result.criticalDoors.some(door=>door.doorId==='d1'),'porte-pont non identifiée');
 assert(result.hasSinglePointOfFailure,'risque de circulation non signalé');
});
test('ne signale pas de pièce critique dans un circuit fermé',()=>{
 const result=World.analyzeInteriorCirculation(['A','B','C'],[
  {from:'A',to:'B',doorId:'ab'},
  {from:'B',to:'C',doorId:'bc'},
  {from:'C',to:'A',doorId:'ca'}
 ]);
 assert(result.criticalRooms.length===0&&result.criticalDoors.length===0,'circuit fermé déclaré critique');
});
test('ignore les portes fermées dans l’analyse des points critiques',()=>{
 const result=World.analyzeInteriorCirculation(['A','B','C'],[
  {from:'A',to:'B',doorId:'ab'},
  {from:'B',to:'C',doorId:'bc',openable:false}
 ]);
 assert(result.openDoorCount===1&&result.criticalDoors.length===1,'porte fermée intégrée à la circulation');
});
test('chaque pièce expose une géométrie intérieure avec murs et ouverture de porte',()=>{
 const room=World.getInteriorRoomModel('séjour');
 assert(room.walls.length>=5,'segments de murs insuffisants');
 assert(room.doorway&&room.doorway.width>0,'ouverture de porte absente');
 assert(room.doorway.side==='back'&&room.doorway.wallOpening===true,'porte non intégrée au mur du fond');
 assert(room.doorway.headerHeight>0,'linteau au-dessus de la porte absent');
 const backWalls=room.walls.filter(w=>w.side==='back-left'||w.side==='back-right'||w.side==='back-lintel');
 assert(backWalls.length===3,'le mur du fond doit être séparé en deux côtés et un linteau');
 assert(backWalls.some(w=>w.to<0)&&backWalls.some(w=>w.from>0),'les segments latéraux ne préservent pas le passage central');
 assert(room.bounds.left===-.88&&room.bounds.right===.88,'limites de pièce incorrectes');
});
test('les seuils de porte sont définis sur les quatre côtés',()=>{
 const left=World.getInteriorDoorThreshold('left'),right=World.getInteriorDoorThreshold('right');
 const front=World.getInteriorDoorThreshold('front'),back=World.getInteriorDoorThreshold('back');
 assert(left.x<0&&right.x>0&&front.z>0&&back.z<0,'seuils de porte mal orientés');
 assert(World.isNearInteriorDoor(left.x,left.z,'left'),'détection de proximité côté gauche incorrecte');
 assert(!World.isNearInteriorDoor(0,0,'left'),'détection de proximité trop large');
});
test('l’indicateur des étages décrit correctement le niveau et les escaliers',()=>{
 const ground=World.getInteriorLevelIndicator(0,3,true);
 assert(ground.floorName==='REZ-DE-CHAUSSÉE'&&ground.up&&!ground.down,'indicateur du rez-de-chaussée incorrect');
 assert(ground.action==='MONTER','action de montée absente');
 const middle=World.getInteriorLevelIndicator(1,3,true);
 assert(middle.floorName==='ÉTAGE 2'&&middle.up&&middle.down,'indicateur de l’étage intermédiaire incorrect');
 const top=World.getInteriorLevelIndicator(2,3,true);
 assert(!top.up&&top.down&&top.action==='DESCENDRE','limite du dernier étage incorrecte');
 const noStairs=World.getInteriorLevelIndicator(0,1,false);
 assert(!noStairs.stairs&&!noStairs.up&&!noStairs.down&&noStairs.action==='AUCUN ESCALIER','bâtiment sans escalier incorrect');
 const invalid=World.getInteriorLevelIndicator(-4,0,true);
 assert(invalid.level===1&&invalid.total===1,'niveau invalide non normalisé');
});
test('la transition d’étage progresse, change de niveau au milieu et se termine proprement',()=>{
 const initial=World.createInteriorLevelTransition(2,'up');
 assert(initial.active&&initial.targetLevel===2&&initial.progress===0,'transition initiale incorrecte');
 const first=World.advanceInteriorLevelTransition(initial,.25);
 assert(first.transition.progress===.25&&!first.switchLevel&&first.opacity>.3,'fondu initial incorrect');
 const middle=World.advanceInteriorLevelTransition(first.transition,.25);
 assert(middle.switchLevel&&middle.transition.switched&&middle.opacity>.8,'changement de niveau non déclenché au milieu');
 const after=World.advanceInteriorLevelTransition(middle.transition,.1);
 assert(!after.switchLevel&&after.transition.progress>.5,'changement de niveau déclenché deux fois');
 const almost=World.advanceInteriorLevelTransition(after.transition,.25);
 assert(!almost.complete&&almost.transition.progress===.85,'transition terminée trop tôt');
 const final=World.advanceInteriorLevelTransition(almost.transition,.15);
 assert(final.complete&&final.transition===null&&final.opacity===0,'transition non terminée proprement');
 const empty=World.advanceInteriorLevelTransition(null,.1);
 assert(empty.complete&&empty.opacity===0,'état sans transition incorrect');
 const down=World.createInteriorLevelTransition(0,'down');
 assert(down.direction==='down'&&down.targetLevel===0,'transition descendante incorrecte');
});
test('le message contextuel des escaliers dépend de la proximité et des limites',()=>{
 const far=World.getInteriorStairPrompt(0,0,0,3,true);
 assert(far.visible&&!far.near&&!far.ready&&far.action==='approach','message d’approche incorrect');
 const ground=World.getInteriorStairPrompt(.58,-.55,0,3,true);
 assert(ground.near&&ground.ready&&ground.action==='up','accès de montée non détecté');
 const middle=World.getInteriorStairPrompt(.58,-.55,1,3,true);
 assert(middle.ready&&middle.action==='both','choix des deux directions incorrect');
 const top=World.getInteriorStairPrompt(.58,-.55,2,3,true);
 assert(top.ready&&top.action==='down','accès de descente non détecté');
 const none=World.getInteriorStairPrompt(.58,-.55,0,2,false);
 assert(!none.visible&&none.action==='none','absence d’escalier non détectée');
});
test('la navigation des étages indique les accès disponibles et les limites',()=>{
 const ground=World.getInteriorFloorNavigation(0,3,true);
 assert(ground.level===1&&ground.total===3,'niveau du rez-de-chaussée incorrect');
 assert(ground.canGoUp&&!ground.canGoDown&&ground.nextAction==='MONTER','accès du rez-de-chaussée incorrect');
 const middle=World.getInteriorFloorNavigation(1,3,true);
 assert(middle.canGoUp&&middle.canGoDown&&middle.nextAction==='MONTER / DESCENDRE','accès de l’étage intermédiaire incorrect');
 const top=World.getInteriorFloorNavigation(2,3,true);
 assert(!top.canGoUp&&top.canGoDown&&top.nextAction==='DESCENDRE','limite du dernier étage incorrecte');
 const noStairs=World.getInteriorFloorNavigation(0,2,false);
 assert(!noStairs.hasStairs&&noStairs.nextAction==='AUCUN ACCÈS','bâtiment sans escalier mal indiqué');
 const invalid=World.getInteriorFloorNavigation(99,3,true);
 assert(invalid.level===3&&!invalid.canGoUp&&invalid.canGoDown,'niveau hors limites non normalisé');
});
test('le palier indique le niveau cible et respecte les limites',()=>{
 const up=World.getInteriorStairLanding(0,3,true,'up');
 assert(up.visible&&up.accessible&&up.targetLevel===2&&up.label==='PALIER ÉTAGE 3'&&up.marker==='▲','palier supérieur incorrect');
 const down=World.getInteriorStairLanding(1,3,true,'down');
 assert(down.accessible&&down.targetLevel===1&&down.label==='PALIER ÉTAGE 1'&&down.marker==='▼','palier inférieur incorrect');
 const top=World.getInteriorStairLanding(2,3,true,'up');
 assert(!top.accessible&&top.targetLevel===3&&top.label==='PALIER INACCESSIBLE','limite supérieure incorrecte');
 const ground=World.getInteriorStairLanding(0,3,true,'down');
 assert(!ground.accessible&&ground.targetLevel===1,'limite inférieure incorrecte');
 const noStairs=World.getInteriorStairLanding(0,1,false,'up');
 assert(!noStairs.visible&&!noStairs.accessible&&noStairs.label==='AUCUN PALIER','absence de palier incorrecte');
});
test('l’animation des marches suit la progression de montée et descente',()=>{
 const idle=World.getInteriorStairAnimation(null,10);
 assert(!idle.active&&idle.currentStep===-1&&idle.totalSteps===10,'état inactif incorrect');
 const up=World.getInteriorStairAnimation({active:true,direction:'up',progress:.35},10);
 assert(up.active&&up.direction==='up'&&up.currentStep===3&&up.completedSteps===3&&up.percent===35,'progression montante incorrecte');
 const down=World.getInteriorStairAnimation({active:true,direction:'down',progress:.6},10);
 assert(down.direction==='down'&&down.currentStep===6&&down.completedSteps===6,'progression descendante incorrecte');
 const end=World.getInteriorStairAnimation({active:true,direction:'up',progress:1.4},10);
 assert(end.percent===100&&end.currentStep===-1&&end.completedSteps===10,'fin d’animation incorrecte');
 const clamped=World.getInteriorStairAnimation({active:true,direction:'up',progress:-2},5);
 assert(clamped.percent===0&&clamped.currentStep===0&&clamped.completedSteps===0,'borne basse incorrecte');
});
test('l’opacité de transition utilise une accélération douce et reste bornée',()=>{
 const start=World.getInteriorTransitionOpacity(0);
 const quarter=World.getInteriorTransitionOpacity(.25);
 const middle=World.getInteriorTransitionOpacity(.5);
 const threeQuarter=World.getInteriorTransitionOpacity(.75);
 const end=World.getInteriorTransitionOpacity(1);
 assert(start===0&&middle===1&&end===0,'points de transition incorrects');
 assert(Math.abs(quarter-.5)<1e-9&&Math.abs(threeQuarter-quarter)<1e-9,'courbe douce non symétrique');
 assert(World.getInteriorTransitionOpacity(-2)===0&&World.getInteriorTransitionOpacity(3)===0,'bornes de progression incorrectes');
});
test('l’indicateur de transition affiche la bonne direction et la progression',()=>{
 const up=World.getInteriorTransitionIndicator({active:true,direction:'up',progress:.35});
 assert(up.active&&up.direction==='up'&&up.label==='MONTÉE EN COURS','indicateur de montée incorrect');
 assert(up.progress===.35&&up.percent===35,'pourcentage de montée incorrect');
 const down=World.getInteriorTransitionIndicator({active:true,direction:'down',progress:.8});
 assert(down.label==='DESCENTE EN COURS'&&down.percent===80,'indicateur de descente incorrect');
 const clamped=World.getInteriorTransitionIndicator({active:true,direction:'up',progress:1.4});
 assert(clamped.progress===1&&clamped.percent===100,'progression non bornée');
 const departure=World.getInteriorTransitionIndicator({active:true,direction:'up',progress:.2});
 assert(departure.phase==='departure'&&departure.phaseLabel==='DÉPART'&&Math.abs(departure.phaseProgress-.5)<1e-9,'phase de départ incorrecte');
 const switching=World.getInteriorTransitionIndicator({active:true,direction:'down',progress:.5});
 assert(switching.phase==='switch'&&switching.phaseLabel==='CHANGEMENT D’ÉTAGE'&&Math.abs(switching.phaseProgress-.5)<1e-9,'phase de changement incorrecte');
 const arrival=World.getInteriorTransitionIndicator({active:true,direction:'up',progress:.8});
 assert(arrival.phase==='arrival'&&arrival.phaseLabel==='ARRIVÉE'&&Math.abs(arrival.phaseProgress-.5)<1e-9,'phase d’arrivée incorrecte');
 const empty=World.getInteriorTransitionIndicator(null);
 assert(!empty.active&&empty.percent===0&&empty.phase==='idle','indicateur inactif incorrect');
});
test('la traversée des escaliers se déclenche en s’en approchant dans le bon sens',()=>{
 const far=World.getInteriorStairTraversal(0,.55,0,-.02,0,3,true);
 assert(!far.triggered&&far.reason==='too-far','transition déclenchée à distance');
 const near=World.getInteriorStairTraversal(.58,-.5,0,-.02,0,3,true);
 assert(near.triggered&&near.level===2&&near.direction==='up','montée automatique non déclenchée');
 const away=World.getInteriorStairTraversal(.58,-.55,0,.02,0,3,true);
 assert(!away.triggered&&away.reason==='not-approaching','transition déclenchée en s’éloignant');
 const top=World.getInteriorStairTraversal(.58,-.5,0,-.02,2,3,true);
 assert(!top.triggered&&top.reason==='limit','montée au-delà du dernier étage');
 const middleDown=World.getInteriorStairTraversal(.58,-.6,0,.02,1,3,true);
 assert(middleDown.triggered&&middleDown.level===1&&middleDown.direction==='down','descente automatique incorrecte');
 const noStairs=World.getInteriorStairTraversal(.58,-.55,0,-.02,0,1,false);
 assert(!noStairs.triggered&&noStairs.reason==='no-stairs','transition sans escalier');
});
test('l’accès aux escaliers exige une proximité réelle et respecte le sens de circulation',()=>{
 const far=World.getInteriorStairInteraction(0,.55,0,3,true);
 assert(far.visible&&!far.near&&!far.canGoUp,'accès autorisé depuis le point de départ éloigné');
 assert(far.message==='APPROCHE-TOI DES ESCALIERS','instruction de proximité absente');
 const near=World.getInteriorStairInteraction(.58,-.55,0,3,true);
 assert(near.near&&near.canGoUp&&!near.canGoDown,'accès au rez-de-chaussée incorrect');
 const middle=World.getInteriorStairInteraction(.58,-.55,1,3,true);
 assert(middle.canGoUp&&middle.canGoDown,'circulation étage intermédiaire incorrecte');
 const top=World.getInteriorStairInteraction(.58,-.55,2,3,true);
 assert(!top.canGoUp&&top.canGoDown,'montée au-dessus du dernier étage autorisée');
 const absent=World.getInteriorStairInteraction(.58,-.55,0,1,false);
 assert(!absent.visible&&!absent.near,'escalier absent accessible');
});
test('le modèle d’escalier fournit des marches et un sens de circulation cohérents',()=>{
 const ground=World.getInteriorStairModel(0,3,true);
 assert(ground.visible&&ground.steps.length===10&&ground.direction==='up','escalier montant absent au rez-de-chaussée');
 assert(ground.canGoUp&&!ground.canGoDown&&ground.landing&&ground.railings,'accès du rez-de-chaussée incorrect');
 const middle=World.getInteriorStairModel(1,3,true);
 assert(middle.canGoUp&&middle.canGoDown,'étage intermédiaire sans circulation dans les deux sens');
 const top=World.getInteriorStairModel(2,3,true);
 assert(top.direction==='down'&&!top.canGoUp&&top.canGoDown,'escalier du dernier étage incorrect');
 const absent=World.getInteriorStairModel(0,1,false);
 assert(!absent.visible&&absent.steps.length===0,'escalier affiché dans un bâtiment sans escalier');
});
test('les escaliers respectent les limites des étages',()=>{
 assert(World.changeInteriorLevel(0,3,-1,true).level===0,'descente sous le rez-de-chaussée');
 assert(World.changeInteriorLevel(0,3,-1,true).changed===false,'changement impossible signalé comme réussi');
 assert(World.changeInteriorLevel(0,3,1,true).level===1,'montée au premier étage impossible');
 assert(World.changeInteriorLevel(2,3,1,true).level===2,'montée au-dessus du dernier étage');
 assert(World.changeInteriorLevel(0,3,1,false).changed===false,'étage accessible sans escalier');
});
test('les collisions protègent les portes fermées et libèrent le passage ouvert',()=>{
 const closed=World.resolveInteriorMovement(0,-.6,0,-.2,'séjour',0,'back');
 const opened=World.resolveInteriorMovement(0,-.6,0,-.2,'séjour',1,'back');
 assert(closed.z===-.6,'le joueur traverse une porte fermée');
 assert(opened.z<-.6,'la porte ouverte ne permet pas le passage');
 const sideClosed=World.resolveInteriorMovement(-.6,0,-.2,0,'séjour',0,'left');
 const sideOpen=World.resolveInteriorMovement(-.6,0,-.2,0,'séjour',1,'left');
 assert(sideClosed.x===-.6,'le joueur traverse une porte latérale fermée');
 assert(sideOpen.x<-.6,'la porte latérale ouverte ne permet pas le passage');
});
test('le modèle d’une pièce reçoit les portes de ses connexions',()=>{
 const rooms=['entrée','séjour','cuisine','chambre'];
 const options=World.getConnectedRoomOptions(rooms,1);
 const model=World.getInteriorRoomModel('séjour',options);
 assert(model.doorways.length===3,'les trois portes du séjour ne sont pas représentées');
 assert(model.doorways.some(d=>d.side==='left'&&d.target==='chambre'),'porte latérale gauche absente');
 assert(model.doorways.some(d=>d.side==='right'&&d.target==='cuisine'),'porte latérale droite absente');
});
test('les meubles sont des volumes bornés et adaptés à chaque pièce',()=>{
 const living=World.getInteriorRoomModel('séjour');
 const kitchen=World.getInteriorRoomModel('cuisine');
 const bedroom=World.getInteriorRoomModel('chambre');
 for(const room of [living,kitchen,bedroom]){
  assert(room.furniture.length>=2,'mobilier insuffisant');
  room.furniture.forEach(item=>{
   assert(item.left<item.right&&item.top<item.bottom,'volume de meuble invalide');
   assert(item.height>0&&typeof item.color==='string','dimensions ou couleur invalides');
  });
 }
 assert(living.furniture[0].id!==kitchen.furniture[0].id,'mobilier identique entre pièces');
});
test('le déplacement intérieur reste dans les limites de la pièce',()=>{
 const a=World.resolveInteriorMovement(0,.87,0,.5,'entrée',1);
 const b=World.resolveInteriorMovement(0,-.87,0,-.5,'entrée',1);
 assert(a.z<=.88&&b.z>=-.88,'le joueur sort des limites');
});
test('un meuble bloque le déplacement au lieu de laisser le joueur le traverser',()=>{
 const start={x:0,z:.2};
 const next=World.resolveInteriorMovement(start.x,start.z,0,-.45,'séjour',1);
 assert(next.z>=start.z-.5,'résultat de déplacement invalide');
 assert(next.z>-.18,'le joueur traverse le canapé');
});
test('une porte fermée bloque le passage dans son seuil',()=>{
 const closed=World.resolveInteriorMovement(0,-.6,0,-.3,'entrée',0);
 const open=World.resolveInteriorMovement(0,-.6,0,-.3,'entrée',1);
 assert(closed.z>=-.68,'la porte fermée laisse passer');
 assert(open.z<closed.z,'la porte ouverte ne libère pas le passage');
});
test('les collisions permettent de glisser le long d’un meuble',()=>{
 const result=World.resolveInteriorMovement(-.75,.2,.4,.3,'chambre',1);
 assert(Number.isFinite(result.x)&&Number.isFinite(result.z),'position invalide');
 assert(result.z>.2,'le joueur ne peut pas longer le meuble');
});
test('chaque élément possède un identifiant et des coordonnées valides',()=>{
 const w=World.create('Crée un quartier');
 const ids=new Set();
 w.elements.forEach(e=>{assert(!ids.has(e.id),'identifiant dupliqué');ids.add(e.id);assert(Number.isFinite(e.x)&&Number.isFinite(e.z),'coordonnées invalides')});
});

test('les pièces possèdent des fenêtres et des détails architecturaux',()=>{
 const room=World.getInteriorRoomModel('séjour');
 assert(room.windows.length>=2,'fenêtres insuffisantes');
 assert(room.windows.every(w=>['left','right'].includes(w.side)&&w.width>0&&w.height>0),'géométrie de fenêtre invalide');
 assert(room.architecture.skirtingHeight>0&&room.architecture.trimWidth>0,'moulures architecturales absentes');
 assert(['tiles','wood','planks'].includes(room.architecture.floorPattern),'motif de sol invalide');
});
test('l’éclairage intérieur fournit une ambiance et une lumière de fenêtre bornées',()=>{
 for(const name of ['séjour','cuisine','chambre']){
  const light=World.getInteriorLighting(name);
  assert(light.ambient>0&&light.ambient<=1,'ambiance hors limites');
  assert(light.windowLight>0&&light.windowLight<=.3,'lumière de fenêtre invalide');
  assert(light.brightness>0&&light.brightness<=1,'luminosité hors limites');
  assert(light.direction==='left-to-right','direction de lumière absente');
 }
});
test('le moteur détecte les meubles proches sans traverser leurs limites',()=>{
 const room=World.getInteriorRoomModel('séjour'),sofa=room.furniture.find(f=>f.id==='canape');
 const near=World.getNearbyFurniture((sofa.left+sofa.right)/2,(sofa.top+sofa.bottom)/2,'séjour',.3);
 assert(near&&near.id==='canape','canapé proche non détecté');
 const far=World.getNearbyFurniture(.8,.8,'séjour',.2);
 assert(far===null,'meuble éloigné détecté à tort');
});
test('les interactions avec les meubles alternent un état simple et rejettent les identifiants inconnus',()=>{
 const first=World.interactWithFurniture('chambre','armoire',{});
 assert(first.ok&&first.state==='open'&&first.states.armoire==='open','ouverture du meuble impossible');
 const second=World.interactWithFurniture('chambre','armoire',first.states);
 assert(second.ok&&second.state==='closed','fermeture du meuble impossible');
 const invalid=World.interactWithFurniture('chambre','meuble-inconnu',{});
 assert(!invalid.ok,'meuble inconnu accepté');
});

test('l’interaction de proximité fonctionne sans clavier pour les commandes tactiles',()=>{
 const room=World.getInteriorRoomModel('séjour'),sofa=room.furniture.find(f=>f.id==='canape');
 const x=(sofa.left+sofa.right)/2,z=(sofa.top+sofa.bottom)/2;
 const result=World.interactWithNearbyFurniture(x,z,'séjour',{},.3);
 assert(result.ok&&result.nearby.id==='canape','interaction tactile de proximité impossible');
 assert(result.states.canape==='open','état du meuble non actualisé');
 const far=World.interactWithNearbyFurniture(.8,.8,'séjour',{},.2);
 assert(!far.ok&&far.states&&far.nearby===null,'interaction déclenchée trop loin');
});

test('les commandes tactiles s’adaptent aux petites et grandes largeurs',()=>{
 for(const w of [240,280,320,360,420,600]){
  const h=640,layout=World.getInteriorTouchLayout(w,h);
  assert(layout.buttonWidth>=64&&layout.centers[0]-layout.buttonWidth/2>=-0.1,'bouton gauche hors écran à '+w);
  assert(layout.centers[2]+layout.buttonWidth/2<=w+.1,'bouton droit hors écran à '+w);
  assert(World.getInteriorTouchAction(layout.centers[0],layout.centerY,w,h)==='door','bouton porte non détecté à '+w);
  assert(World.getInteriorTouchAction(layout.centers[1],layout.centerY,w,h)==='examine','bouton examiner non détecté à '+w);
  assert(World.getInteriorTouchAction(layout.centers[2],layout.centerY,w,h)==='select-door','bouton choisir non détecté à '+w);
  assert(World.getInteriorTouchAction(w/2,layout.centerY-40,w,h)==='none','zone supérieure confondue à '+w);
 }
});

test('un changement d’étage réinitialise proprement la navigation intérieure',()=>{
 const up=World.getInteriorLevelEntryState(1);
 assert(up.level===1,'niveau supérieur incorrect');
 assert(up.roomIndex===0&&up.selectedDoorIndex===0,'ancienne pièce ou ancienne porte conservée');
 assert(up.x===0&&up.z===.55,'position d’entrée incorrecte');
 assert(up.doorOpen===0&&up.doorTarget===0,'état de porte conservé après changement d’étage');
 const down=World.getInteriorLevelEntryState(0);
 assert(down.level===0&&down.roomIndex===0&&down.selectedDoorIndex===0,'retour au rez-de-chaussée incorrect');
 assert(down.doorOpen===0&&down.doorTarget===0,'porte ouverte au retour au rez-de-chaussée');
 const invalid=World.getInteriorLevelEntryState(-2);
 assert(invalid.level===0,'niveau négatif accepté');
});

test('changer de porte referme l’ouverture précédente et conserve la sélection circulaire',()=>{
 const doors=[{target:'séjour',side:'back'},{target:'cuisine',side:'right'},{target:'chambre',side:'left'}];
 const next=World.selectNextInteriorDoor(doors,0);
 assert(next.selectedIndex===1&&next.choice.target==='cuisine','la porte suivante n’est pas sélectionnée');
 assert(next.doorOpen===0&&next.doorTarget===0,'le changement de porte doit refermer la porte');
 assert(next.message==='Porte choisie : cuisine (right).','message de sélection incorrect');
 const last=World.selectNextInteriorDoor(doors,2);
 assert(last.selectedIndex===0&&last.choice.target==='séjour','la sélection ne revient pas à la première porte');
 const empty=World.selectNextInteriorDoor([],0);
 assert(empty.selectedIndex===0&&empty.choice===null,'une porte inexistante a été sélectionnée');
 assert(empty.doorOpen===0&&empty.doorTarget===0,'une porte reste ouverte sans destination');
 assert(empty.message==='Aucune autre pièce reliée.','message sans porte incorrect');
});

test('le statut intérieur explique l’état de la porte et les possibilités d’action',()=>{
 const door={target:'cuisine',side:'right'};
 const closed=World.getInteriorInteractionStatus(0,0,door,false,null);
 assert(closed.doorState==='FERMÉE','porte fermée mal signalée');
 assert(closed.passage==='OUVRE LA PORTE'&&!closed.canPass,'passage possible avec porte fermée');
 assert(!closed.canExamine&&closed.furniture==='AUCUN MEUBLE PROCHE','meuble absent mal signalé');
 const openFar=World.getInteriorInteractionStatus(.9,1,door,false,{id:'canape'});
 assert(openFar.doorState==='OUVERTE','porte ouverte mal signalée');
 assert(openFar.passage==='APPROCHE-TOI DE LA PORTE'&&!openFar.canPass,'passage annoncé trop tôt');
 assert(openFar.canExamine&&openFar.furniture==='MEUBLE À EXAMINER','meuble proche non signalé');
 const ready=World.getInteriorInteractionStatus(.9,1,door,true,{id:'canape'});
 assert(ready.canPass&&ready.passage==='PASSAGE ACCESSIBLE','passage accessible non reconnu');
 const noDoor=World.getInteriorInteractionStatus(0,0,null,false,null);
 assert(noDoor.passage==='AUCUNE ISSUE'&&!noDoor.canPass,'absence de sortie mal signalée');
 const opening=World.getInteriorInteractionStatus(.3,1,door,false,null);
 assert(opening.doorState==='OUVERTURE','animation d’ouverture mal signalée');
});

test('l’indicateur de porte affiche la sélection et gère les indices circulaires',()=>{
 const doors=[{target:'séjour',side:'back'},{target:'cuisine',side:'right'},{target:'chambre',side:'left'}];
 const first=World.getInteriorDoorIndicator(doors,0);
 assert(first.available&&first.index===1&&first.count===3,'première porte mal indiquée');
 assert(first.label==='PORTE 1/3 : SÉJOUR'&&first.side==='back','libellé première porte incorrect');
 const second=World.getInteriorDoorIndicator(doors,1);
 assert(second.index===2&&second.target==='cuisine','deuxième porte non sélectionnée');
 const wrapped=World.getInteriorDoorIndicator(doors,3);
 assert(wrapped.index===1&&wrapped.target==='séjour','retour circulaire après la dernière porte incorrect');
 const negative=World.getInteriorDoorIndicator(doors,-1);
 assert(negative.index===3&&negative.target==='chambre','indice négatif non normalisé');
 const empty=World.getInteriorDoorIndicator([],0);
 assert(!empty.available&&empty.label==='AUCUNE PORTE'&&empty.count===0,'absence de porte mal indiquée');
});

test('les libellés tactiles suivent l’état de la porte et les possibilités',()=>{
 const closed=World.getInteriorTouchLabels(0,0,2,null);
 assert(closed.door==='OUVRIR','libellé porte fermée incorrect');
 assert(closed.examine==='MEUBLE'&&!closed.examineEnabled,'meuble indisponible non signalé');
 assert(closed.selectDoor==='PORTE SUIV.'&&closed.selectDoorEnabled,'portes reliées non signalées');
 const opened=World.getInteriorTouchLabels(.9,1,0,{id:'canape'});
 assert(opened.door==='FERMER','libellé porte ouverte incorrect');
 assert(opened.examine==='EXAMINER'&&opened.examineEnabled,'meuble proche non activé');
 assert(opened.selectDoor==='SANS PORTE'&&!opened.selectDoorEnabled,'absence de porte non signalée');
});


test('les primitives géométriques produisent des maillages valides',()=>{
 const box=World.createBoxGeometry(2,3,4),cylinder=World.createCylinderGeometry(1,2,12),sphere=World.createSphereGeometry(1,16,8);
 for(const mesh of [box,cylinder,sphere]){
  const result=World.validateGeometryMesh(mesh);
  assert(result.valid&&result.vertexCount>=8&&result.faceCount>=6,'primitive invalide : '+mesh.primitive);
  assert(mesh.vertices.every(v=>v.length===3&&v.every(Number.isFinite)),'coordonnée de sommet invalide');
 }
 assert(box.vertices.length===8&&box.faces.length===6,'boîte géométrique incorrecte');
 assert(cylinder.faces.length===36,'cylindre mal segmenté');
});
test('la validation détecte les faces dégénérées et les indices hors limites',()=>{
 const invalid={type:'mesh',vertices:[[0,0,0],[1,0,0],[2,0,0]],faces:[[0,1,2],[0,1,8],[0,0,2]]};
 const result=World.validateGeometryMesh(invalid);
 assert(!result.valid,'maillage invalide accepté');
 assert(result.errors.some(e=>e.indexOf('degenerate-face')===0),'face dégénérée non détectée');
 assert(result.errors.some(e=>e.indexOf('out-of-range-face')===0),'indice hors limites non détecté');
 assert(result.errors.some(e=>e.indexOf('duplicate-index-face')===0),'indice dupliqué non détecté');
});
test('les transformations appliquent échelle, rotations et translation sans modifier la source',()=>{
 const source=World.createBoxGeometry(2,2,2),copy=JSON.stringify(source);
 const moved=World.transformGeometryMesh(source,{position:{x:5,y:2,z:-1},scale:{x:2,y:1,z:1}});
 const metrics=World.measureGeometryMesh(moved);
 assert(metrics.bounds.min[0]===3&&metrics.bounds.max[0]===7,'échelle ou translation X incorrecte');
 assert(metrics.bounds.min[1]===1&&metrics.bounds.max[1]===3,'translation Y incorrecte');
 assert(metrics.bounds.min[2]===-2&&metrics.bounds.max[2]===0,'translation Z incorrecte');
 assert(JSON.stringify(source)===copy,'la transformation a modifié le maillage source');
 const rotated=World.transformGeometryMesh(source,{rotation:{y:Math.PI/2}});
 const rotatedBounds=World.measureGeometryMesh(rotated).bounds;
 assert(Math.abs(rotatedBounds.size[0]-2)<1e-9&&Math.abs(rotatedBounds.size[2]-2)<1e-9,'rotation géométrique incorrecte');
});
test('la fusion des maillages recalcule les indices et conserve les matériaux',()=>{
 const a=World.createBoxGeometry(1,1,1,'#111111'),b=World.transformGeometryMesh(World.createBoxGeometry(2,2,2,'#222222'),{position:{x:3}});
 const merged=World.mergeGeometryMeshes([a,b]),validation=World.validateGeometryMesh(merged);
 assert(validation.valid&&merged.vertices.length===16&&merged.faces.length===12,'fusion des géométries incorrecte');
 assert(merged.faces.slice(6).every(face=>face.every(i=>i>=8)),'indices du second composant non décalés');
 assert(merged.faceMaterials[0]==='#111111'&&merged.faceMaterials[6]==='#222222','matériaux perdus pendant la fusion');
});
test('les mesures calculent les dimensions, la surface, le volume et la fermeture',()=>{
 const box=World.measureGeometryMesh(World.createBoxGeometry(2,3,4));
 assert(box.valid&&box.isClosed,'boîte fermée non reconnue');
 assert(box.bounds.size[0]===2&&box.bounds.size[1]===3&&box.bounds.size[2]===4,'dimensions incorrectes');
 assert(Math.abs(box.surfaceArea-52)<1e-9,'surface de boîte incorrecte');
 assert(Math.abs(box.volume-24)<1e-9,'volume de boîte incorrect');
 const open=World.measureGeometryMesh({type:'mesh',vertices:[[0,0,0],[1,0,0],[0,1,0]],faces:[[0,1,2]]});
 assert(!open.isClosed&&open.volume===null&&Math.abs(open.surfaceArea-.5)<1e-9,'surface ouverte mal mesurée');
});
test('un assemblage applique les transformations et valide chaque composant',()=>{
 const model=World.assembleGeometryModel('Assemblage test',[
  {id:'base',mesh:World.createBoxGeometry(2,.5,2),transform:{position:{y:.25}}},
  {id:'poteau',mesh:World.createBoxGeometry(.3,2,.3),transform:{position:{x:.5,y:1.5}}}
 ]);
 assert(model.validation.valid&&model.validation.componentCount===2,'assemblage valide rejeté');
 assert(model.components[0].id==='base'&&model.components[1].id==='poteau','identifiants de composants perdus');
 assert(model.mesh.vertices.length===16&&model.mesh.faces.length===12,'maillage assemblé incomplet');
 assert(model.metrics.bounds.max[1]===2.5,'position des composants incorrecte');
});
test('le générateur de bâtiment crée une structure multi-étages modulaire',()=>{
 const building=World.createBuildingGeometry({name:'Immeuble scientifique',width:12,depth:9,floors:4,floorHeight:3.2});
 assert(building.kind==='geometry-model'&&building.validation.valid,'bâtiment géométrique invalide');
 assert(building.components.some(c=>c.id==='door-panel'),'porte géométrique absente');
 assert(building.components.some(c=>c.id==='roof-slab'),'toiture absente');
 assert(building.components.filter(c=>c.id.indexOf('floor-slab-')===0).length===4,'dalles des étages absentes');
 assert(building.components.filter(c=>c.id.indexOf('front-wall-')===0).length>=5,'murs de façade insuffisants');
 assert(building.mesh.vertices.length>100&&building.metrics.bounds.size[1]>12,'bâtiment trop incomplet');
});
test('le générateur de bâtiment borne les paramètres extrêmes',()=>{
 const small=World.createBuildingGeometry({width:-10,depth:0,floors:0,floorHeight:1});
 const large=World.createBuildingGeometry({width:500,depth:500,floors:99,floorHeight:99});
 assert(small.validation.valid&&large.validation.valid,'dimensions bornées invalides');
 assert(small.metrics.bounds.size[0]>=3&&small.components.filter(c=>c.id.indexOf('floor-slab-')===0).length===2,'bornes minimales incorrectes');
 assert(large.components.filter(c=>c.id.indexOf('floor-slab-')===0).length===20,'borne maximale des étages incorrecte');
});
test('les meubles 3D sont assemblés en composants réutilisables',()=>{
 for(const type of ['table','chair','bed','cabinet','sofa']){
  const model=World.createFurnitureGeometry(type);
  assert(model.validation.valid&&model.components.length>=3,'meuble invalide : '+type);
  assert(model.metrics.bounds.size.every(v=>v>0),'dimensions du meuble incorrectes : '+type);
 }
 const unknown=World.createFurnitureGeometry('inconnu');
 assert(!unknown.validation.valid&&unknown.validation.errors.includes('unsupported-furniture-type'),'type de meuble inconnu accepté');
});
test('les composants géométriques restent isolés entre deux créations',()=>{
 const first=World.createFurnitureGeometry('table'),second=World.createFurnitureGeometry('table');
 first.mesh.vertices[0][0]=999;
 assert(second.mesh.vertices[0][0]!==999,'les modèles partagent leurs sommets');
});

test('les matériaux valident couleurs, propriétés physiques et transparence',()=>{
 const opaque=World.createMaterial({id:'paint',baseColor:'#aa7733',roughness:.4,metallic:.2});
 const glass=World.createMaterial({opacity:.25,transparent:true,alphaMode:'blend'});
 assert(World.validateMaterial(opaque).valid&&opaque.baseColor==='#AA7733','matériau opaque invalide');
 assert(World.validateMaterial(glass).valid&&glass.transparent&&glass.opacity===.25,'transparence du verre incorrecte');
 assert(!World.validateMaterial(Object.assign({},opaque,{roughness:2})).valid,'rugosité hors limites acceptée');
});
test('la bibliothèque fournit des matériaux réutilisables pour plusieurs surfaces',()=>{
 const library=World.createMaterialLibrary();
 assert(library.length>=6,'bibliothèque de matériaux trop petite');
 for(const id of ['wall-plaster','oak-wood','polished-metal','clear-glass','ceramic-tile','fabric-blue']){
  const material=World.getMaterialPreset(library,id);
  assert(material&&World.validateMaterial(material).valid,'préréglage absent ou invalide : '+id);
 }
 assert(World.getMaterialPreset(library,'inconnu')===null,'préréglage inconnu retourné');
});
test('les textures procédurales produisent des variations reproductibles',()=>{
 const checker={type:'checker',scale:4,colorA:'#000000',colorB:'#FFFFFF',strength:1};
 const a=World.sampleMaterialTexture(checker,[.1,.1]),b=World.sampleMaterialTexture(checker,[.4,.1]);
 assert(a!==b,'damier sans variation');
 assert(a===World.sampleMaterialTexture(checker,[.1,.1]),'texture non déterministe');
 const gradient={type:'gradient',scale:1,colorA:'#000000',colorB:'#FFFFFF',strength:1,axis:'u'};
 assert(World.sampleMaterialTexture(gradient,[0,0])==='#000000','début du dégradé incorrect');
 assert(World.sampleMaterialTexture(gradient,[1,0])==='#FFFFFF','fin du dégradé incorrect');
 for(const type of ['stripes','grid','wood']){
  const color=World.sampleMaterialTexture({type,scale:5,colorA:'#111111',colorB:'#EEEEEE',strength:1,axis:'v'},[.3,.7]);
  assert(/^#[0-9A-F]{6}$/.test(color),'texture non calculée : '+type);
 }
});
test('les coordonnées UV planaires sont normalisées sur les axes demandés',()=>{
 const mesh=World.createBoxGeometry(2,4,6);
 for(const axis of ['xy','xz','yz']){
  const uvs=World.generatePlanarUV(mesh,axis);
  assert(uvs.length===mesh.vertices.length,'nombre de coordonnées UV incorrect');
  assert(uvs.every(uv=>uv.length===2&&uv.every(v=>v>=0&&v<=1)),'coordonnées UV hors limites');
 }
});
test('un matériau peut être appliqué à un maillage sans altérer sa géométrie source',()=>{
 const mesh=World.createBoxGeometry(2,2,2),before=JSON.stringify(mesh);
 const material=World.createMaterial({id:'blue-metal',baseColor:'#336699',metallic:.8});
 const coated=World.applyMaterialToMesh(mesh,material);
 assert(coated.materials['blue-metal'].baseColor==='#336699','matériau non attaché au maillage');
 assert(coated.faceMaterials.length===mesh.faces.length&&coated.faceMaterials.every(id=>id==='blue-metal'),'affectation des faces incorrecte');
 assert(coated.uvs.length===mesh.vertices.length,'coordonnées UV absentes');
 assert(JSON.stringify(mesh)===before,'maillage source modifié');
});
test('les matériaux peuvent être affectés à un sous-ensemble de faces',()=>{
 const mesh=World.createBoxGeometry(1,1,1),coated=World.applyMaterialToMesh(mesh,{id:'front',baseColor:'#FF0000'},{faceIndices:[0,1]});
 assert(coated.faceMaterials[0]==='front'&&coated.faceMaterials[1]==='front','faces ciblées non peintes');
 assert(coated.faceMaterials.slice(2).every(id=>id==='#AAB6C4'),'matériau des autres faces altéré');
});
test('l’évaluation de surface combine texture, lumière, rugosité et métal',()=>{
 const material=World.createMaterial({baseColor:'#808080',roughness:.2,metallic:.9,textures:{baseColor:{type:'checker',scale:2,colorA:'#000000',colorB:'#FFFFFF',strength:.5}}});
 const a=World.evaluateMaterialAppearance(material,[.1,.1],{ambient:.2,diffuse:.4});
 const b=World.evaluateMaterialAppearance(material,[.1,.1],{ambient:.8,diffuse:.4});
 assert(a.color!==b.color,'éclairage sans effet sur la surface');
 assert(a.specular>b.specular*.9&&a.metallic===.9,'réponse métallique absente');
 const unlit=World.evaluateMaterialAppearance({shadingModel:'unlit',baseColor:'#336699'},[0,0],{ambient:0,diffuse:0});
 assert(unlit.color==='#336699'&&unlit.specular===0,'matériau non éclairé incorrect');
});
test('le mode alpha masque les surfaces sous le seuil de transparence',()=>{
 const material=World.createMaterial({opacity:.2,alphaMode:'mask',alphaCutoff:.5});
 const hidden=World.evaluateMaterialAppearance(material,[0,0]);
 const visible=World.evaluateMaterialAppearance(Object.assign({},material,{opacity:.8}),[0,0]);
 assert(hidden.opacity===0&&visible.opacity===1,'seuil alpha non respecté');
});
test('l’aperçu de matériau expose plusieurs échantillons et propriétés',()=>{
 const material=World.createMaterial({id:'preview-oak',name:'Chêne',textures:{baseColor:{type:'wood',scale:8,colorA:'#553311',colorB:'#CC9955'}}});
 const preview=World.createMaterialSurfacePreview(material,[[0,0],[.5,.5],[1,1]]);
 assert(preview.materialId==='preview-oak'&&preview.name==='Chêne','identité du matériau absente');
 assert(preview.samples.length===3&&preview.samples.every(s=>s.appearance.color),'échantillons visuels absents');
 assert(preview.validation.valid&&preview.properties.roughness===material.roughness,'propriétés non validées');
});

console.log('Résultat : '+passed+' réussis, '+failed+' échoués.');
if(failed)process.exitCode=1;
