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
test('chaque élément possède un identifiant et des coordonnées valides',()=>{
 const w=World.create('Crée un quartier');
 const ids=new Set();
 w.elements.forEach(e=>{assert(!ids.has(e.id),'identifiant dupliqué');ids.add(e.id);assert(Number.isFinite(e.x)&&Number.isFinite(e.z),'coordonnées invalides')});
});
console.log('Résultat : '+passed+' réussis, '+failed+' échoués.');
if(failed)process.exitCode=1;
