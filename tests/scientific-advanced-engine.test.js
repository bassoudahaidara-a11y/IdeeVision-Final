const fs=require('fs'),vm=require('vm');
const window={};const context={window,JSON,Object,Array,String,Number,Math,Map,Set,Date};vm.createContext(context);
vm.runInContext(fs.readFileSync('app/src/main/assets/engine/scientific-engine-v1.js','utf8'),context);
vm.runInContext(fs.readFileSync('app/src/main/assets/engine/scientific-advanced-engine-v1.js','utf8'),context);
const A=window.IdeeVisionScientificAdvanced;let passed=0,failed=0;
function test(name,fn){try{fn();passed++;console.log('✓ '+name)}catch(e){failed++;console.error('✗ '+name+': '+e.message)}}
function assert(v,m){if(!v)throw new Error(m)}
test('moteur scientifique avancé chargé et versionné',()=>assert(A&&A.version==='0.1.0','module absent'));
test('calcule une dérivée polynomiale',()=>{const r=A.differentiate('3*x^3-2*x^2+5*x-7','x');assert(r.ok&&r.expression==='9x^2 - 4x + 5','dérivée incorrecte: '+(r.expression||r.error))});
test('calcule une intégrale polynomiale et ajoute C',()=>{const r=A.integrate('6*x^2+4*x+2','x');assert(r.ok&&r.expression==='2x^3 + 2x^2 + 2x'&&r.constantOfIntegration===' + C','intégrale incorrecte')});
test('traite les constantes et polynômes nuls',()=>{assert(A.differentiate('12','x').expression==='0'&&A.integrate('0','x').expression==='0','constante incorrecte')});
test('refuse une fonction non polynomiale pour le calcul symbolique',()=>assert(!A.differentiate('sin(x)','x').ok,'fonction non polynomiale acceptée'));
test('résout un système linéaire 2x2',()=>{const r=A.solveLinearSystem([[2,1],[1,-1]],[5,1]);assert(r.ok&&r.solvable&&Math.abs(r.solutions[0]-2)<1e-9&&Math.abs(r.solutions[1]-1)<1e-9,'solution 2x2 incorrecte')});
test('résout un système linéaire 3x3',()=>{const r=A.solveLinearSystem([[1,1,1],[2,-1,1],[1,2,-1]],[6,3,0]);assert(r.ok&&r.solvable&&r.solutions.every((v,i)=>Math.abs(v-[1,2,3][i])<1e-9),'solution 3x3 incorrecte')});
test('détecte un système singulier',()=>{const r=A.solveLinearSystem([[1,2],[2,4]],[3,6]);assert(r.ok&&!r.solvable&&r.type==='singular-or-underdetermined','système singulier non détecté')});
test('refuse les matrices non carrées et trop grandes',()=>{assert(!A.solveLinearSystem([[1,2]],[1]).ok&&!A.solveLinearSystem(Array.from({length:13},()=>Array(13).fill(1)),Array(13).fill(1)).ok,'limites matrice non respectées')});
test('vérifie des solutions d’équation',()=>{const r=A.verifyEquation('x^2-5*x+6=0','x',[2,3]);assert(r.ok&&r.allValid&&r.checks.length===2,'solutions valides rejetées')});
test('rejette une solution qui ne satisfait pas l’équation',()=>{const r=A.verifyEquation('2*x+1=5','x',[2,3]);assert(r.ok&&!r.allValid&&!r.checks[1].valid,'solution incorrecte acceptée')});
test('calcule les paramètres d’un projectile horizontal',()=>{const r=A.projectile({initialSpeed:10,angleDegrees:0,gravity:10});assert(r.ok&&Math.abs(r.flightTime)<1e-9&&Math.abs(r.range)<1e-9&&Math.abs(r.maximumHeight)<1e-9,'tir horizontal au niveau du sol incorrect')});
test('calcule une trajectoire à 45 degrés',()=>{const r=A.projectile({initialSpeed:20,angleDegrees:45,gravity:10});assert(r.ok&&Math.abs(r.range-40)<1e-8&&Math.abs(r.maximumHeight-10)<1e-8,'trajectoire balistique incorrecte')});
test('évalue une position intermédiaire et refuse un temps hors intervalle',()=>{const r=A.projectile({initialSpeed:10,angleDegrees:30,gravity:10});const p=r.at(r.flightTime/2);assert(p.ok&&p.y>0&&!r.at(r.flightTime+1).ok,'position intermédiaire ou limite temporelle incorrecte')});
test('refuse les paramètres physiques invalides',()=>assert(!A.projectile({initialSpeed:-1,angleDegrees:30}).ok&&!A.projectile({initialSpeed:10,angleDegrees:120}).ok,'paramètres invalides acceptés'));
console.log('Résultat : '+passed+' réussis, '+failed+' échoués.');if(failed)process.exitCode=1;
