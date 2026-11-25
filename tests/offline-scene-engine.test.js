const fs=require('fs');
const vm=require('vm');
const context={window:{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('app/src/main/assets/engine/offline-scene-engine.js','utf8'),context);
const Engine=context.window.IdeeVisionOffline;
let passed=0,failed=0;
function test(name,fn){try{fn();passed++;console.log('✓ '+name)}catch(e){failed++;console.log('✗ '+name+': '+e.message)}}
test('moteur local chargé',()=>{if(!Engine||Engine.version!==1)throw Error('version incorrecte')});
test('reconnaît une maison',()=>{const s=Engine.create('Dessine une maison avec deux fenêtres');if(!s.objects.some(o=>o.type==='house'))throw Error('maison absente')});
test('reconnaît un robot',()=>{const s=Engine.create('Un robot bleu');if(!s.objects.some(o=>o.type==='robot'))throw Error('robot absent')});
test('reconnaît un dragon',()=>{const s=Engine.create('Un dragon');if(!s.objects.some(o=>o.type==='dragon'))throw Error('dragon absent')});
test('reconnaît une animation de chute',()=>{const s=Engine.create('Une balle tombe avec la gravité');if(!s.actions.some(a=>a.kind==='fall'))throw Error('action de chute absente')});
test('choisit le mode 2D',()=>{if(Engine.create('Un dessin 2D de cube').mode!=='2D')throw Error('mode incorrect')});
test('choisit le mode 3D',()=>{if(Engine.create('Une maison en 3D').mode!=='3D')throw Error('mode incorrect')});
test('fournit un objet de secours pour une idée inconnue',()=>{if(!Engine.create('Un objet étrange').objects.length)throw Error('scène vide')});
console.log('Résultat : '+passed+' réussis, '+failed+' échoués.');
if(failed)process.exitCode=1;
