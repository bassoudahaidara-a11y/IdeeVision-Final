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

test('les trois commandes tactiles intérieures sont détectées séparément',()=>{
 const w=360,h=640,c=w/2,y=h-70;
 assert(World.getInteriorTouchAction(c-106,y,w,h)==='door','bouton porte non détecté');
 assert(World.getInteriorTouchAction(c,y,w,h)==='examine','bouton examiner non détecté');
 assert(World.getInteriorTouchAction(c+106,y,w,h)==='select-door','bouton choisir non détecté');
 assert(World.getInteriorTouchAction(8,y,w,h)==='none','zone extérieure prise pour un bouton');
 assert(World.getInteriorTouchAction(c,y-40,w,h)==='none','zone au-dessus des boutons prise pour un bouton');
});

console.log('Résultat : '+passed+' réussis, '+failed+' échoués.');
if(failed)process.exitCode=1;
