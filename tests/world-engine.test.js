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
test('les pièces sont reliées par des portes explicites dans l’ordre du plan',()=>{
 const rooms=['entrée','séjour','cuisine','chambre'];
 const links=World.getInteriorRoomConnections(rooms);
 assert(links.length===3,'nombre de portes incorrect');
 assert(links[0].from==='entrée'&&links[0].to==='séjour','liaison entrée-séjour absente');
 assert(links[2].from==='cuisine'&&links[2].to==='chambre','liaison cuisine-chambre absente');
 assert(links.every(link=>link.openable&&link.width>0),'porte non franchissable');
});
test('le passage suit les pièces reliées et permet de revenir',()=>{
 const rooms=['entrée','séjour','cuisine','chambre'];
 assert(World.getNextConnectedRoomIndex(rooms,0)===1,'entrée ne mène pas au séjour');
 assert(World.getNextConnectedRoomIndex(rooms,1)===2,'séjour ne mène pas à la cuisine');
 assert(World.getNextConnectedRoomIndex(rooms,2)===3,'cuisine ne mène pas à la chambre');
 assert(World.getNextConnectedRoomIndex(rooms,3)===2,'retour depuis la dernière pièce impossible');
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
console.log('Résultat : '+passed+' réussis, '+failed+' échoués.');
if(failed)process.exitCode=1;
