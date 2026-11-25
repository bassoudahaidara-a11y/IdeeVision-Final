const fs=require('fs');
const vm=require('vm');
const frames=[];
const windowMock={addEventListener(){},removeEventListener(){}};
const context={window:windowMock,devicePixelRatio:1,innerWidth:420,innerHeight:820,
 requestAnimationFrame(fn){frames.push(fn);return frames.length},cancelAnimationFrame(){}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('app/src/main/assets/engine/offline-scene-engine.js','utf8'),context);
const Engine=context.window.IdeeVisionOffline;
let passed=0,failed=0;
function test(name,fn){try{fn();passed++;console.log('✓ '+name)}catch(e){failed++;console.log('✗ '+name+': '+e.message)}}
test('moteur local chargé',()=>{if(!Engine||Engine.version!==1)throw Error('version incorrecte')});
test('reconnaît une maison',()=>{const s=Engine.create('Dessine une maison avec deux fenêtres');if(!s.objects.some(o=>o.type==='house'))throw Error('maison absente')});
test('respecte une quantité en français',()=>{const s=Engine.create('Dessine trois arbres');if(s.objects.filter(o=>o.type==='tree').length!==3)throw Error('trois arbres attendus')});
test('reconnaît un robot',()=>{const s=Engine.create('Un robot bleu');if(!s.objects.some(o=>o.type==='robot'))throw Error('robot absent')});
test('reconnaît un dragon',()=>{const s=Engine.create('Un dragon');if(!s.objects.some(o=>o.type==='dragon'))throw Error('dragon absent')});
test('reconnaît une animation de chute',()=>{const s=Engine.create('Une balle tombe avec la gravité');if(!s.actions.some(a=>a.kind==='fall'))throw Error('action de chute absente')});
test('choisit le mode 2D',()=>{if(Engine.create('Un dessin 2D de cube').mode!=='2D')throw Error('mode incorrect')});
test('choisit le mode 3D',()=>{if(Engine.create('Une maison en 3D').mode!=='3D')throw Error('mode incorrect')});
test('construit des maillages 3D valides',()=>{for(const type of ['cube','house','tree','car','robot','dragon','ball']){const g=Engine.geometryInfo(type,'#58A6FF');if(!g.valid||g.vertices<8||g.faces<6)throw Error('maillage invalide: '+type)}});
test('dessine et termine une scène 2D et une scène 3D',()=>{
 const drawing={setTransform(){},clearRect(){},fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},fillText(){},save(){},translate(){},rotate(){},restore(){},closePath(){},fill(){},roundRect(){},arc(){},ellipse(){},createRadialGradient(){return {addColorStop(){}}}};
 function render(idea){
  frames.length=0;let finished=false,captions=0;
  const canvas={getContext(){return drawing},set width(v){},set height(v){}};
  Engine.play(canvas,Engine.create(idea),()=>captions++,()=>finished=true);
  let t=0,count=0;while(frames.length&&count<20){frames.shift()(t);t+=1000;count++}
  if(!finished||!captions)throw Error('rendu incomplet');
 }
 render('Une maison en 3D');render('Un dessin 2D de dragon');
});
test('fournit un objet de secours pour une idée inconnue',()=>{if(!Engine.create('Un objet étrange').objects.length)throw Error('scène vide')});
console.log('Résultat : '+passed+' réussis, '+failed+' échoués.');
if(failed)process.exitCode=1;
