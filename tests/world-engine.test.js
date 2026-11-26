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
test('chaque élément possède un identifiant et des coordonnées valides',()=>{
 const w=World.create('Crée un quartier');
 const ids=new Set();
 w.elements.forEach(e=>{assert(!ids.has(e.id),'identifiant dupliqué');ids.add(e.id);assert(Number.isFinite(e.x)&&Number.isFinite(e.z),'coordonnées invalides')});
});
console.log('Résultat : '+passed+' réussis, '+failed+' échoués.');
if(failed)process.exitCode=1;
