const fs=require('fs'),vm=require('vm');
const window={};const context={window,JSON,Object,Array,String,Number,Math,Map,Set,Date};vm.createContext(context);
vm.runInContext(fs.readFileSync('app/src/main/assets/engine/scientific-engine-v1.js','utf8'),context);
const S=window.IdeeVisionScientific;let passed=0,failed=0;
function test(name,fn){try{fn();passed++;console.log('✓ '+name)}catch(e){failed++;console.error('✗ '+name+': '+e.message)}}
function assert(v,m){if(!v)throw new Error(m)}
test('module scientifique chargé et versionné',()=>assert(S&&S.version==='0.1.0','module absent'));
test('évalue une expression avec priorités et parenthèses',()=>{const r=S.evaluateExpression('(2+3)*4-6/2');assert(r.ok&&r.value===17,'calcul incorrect')});
test('évalue des variables sans exécuter du code',()=>{const r=S.evaluateExpression('m*a',{m:4,a:2.5});assert(r.ok&&r.value===10,'variables incorrectes')});
test('refuse une variable absente',()=>assert(!S.evaluateExpression('m*a',{m:4}).ok,'variable absente acceptée'));
test('refuse une division par zéro',()=>assert(!S.evaluateExpression('5/(3-3)',{}).ok,'division par zéro acceptée'));
test('refuse une syntaxe arbitraire',()=>assert(!S.evaluateExpression('globalThis.process.exit()',{}).ok,'syntaxe arbitraire acceptée'));
test('résout une équation linéaire',()=>{const r=S.solveEquation('2*x+3=7','x');assert(r.ok&&r.type==='linear'&&Math.abs(r.solutions[0]-2)<1e-9,'solution linéaire incorrecte')});
test('résout une équation quadratique à deux racines',()=>{const r=S.solveEquation('x^2-5*x+6=0','x');assert(r.ok&&r.solutions.length===2&&Math.abs(r.solutions[0]-2)<1e-9&&Math.abs(r.solutions[1]-3)<1e-9,'racines quadratiques incorrectes')});
test('reconnaît une racine double',()=>{const r=S.solveEquation('x^2-4*x+4=0','x');assert(r.ok&&r.type==='quadratic-double'&&r.solutions[0]===2,'racine double incorrecte')});
test('reconnaît une équation sans solution réelle',()=>{const r=S.solveEquation('x^2+1=0','x');assert(r.ok&&r.type==='quadratic-no-real-root'&&r.solutions.length===0,'absence de racines non reconnue')});
test('reconnaît une identité et une contradiction numérique',()=>{assert(S.solveEquation('x+2=x+2','x').type==='identity'&&S.solveEquation('2=3','x').type==='inconsistent','cas constant incorrect')});
test('refuse les polynômes au-delà du degré deux',()=>assert(!S.solveEquation('x^3-1=0','x').ok,'degré supérieur accepté'));
test('vérifie les dimensions de la deuxième loi de Newton',()=>{const r=S.checkDimensions('m*a',{m:[0,1,0,0,0],a:[1,0,-2,0,0]},'N');assert(r.ok&&r.valid,'dimensions de F=m*a incorrectes')});
test('détecte une formule dimensionnellement incohérente',()=>{const r=S.checkDimensions('m+a',{m:[1,0,0,0,0],a:[1,0,-2,0,0]},'N');assert(!r.ok&&r.error==='dimension-mismatch-addition','addition dimensionnellement incorrecte acceptée')});
test('convertit les unités compatibles',()=>{const r=S.convertUnit(2,'km','m');assert(r.ok&&r.value===2000,'conversion km vers m incorrecte')});
test('refuse la conversion entre grandeurs incompatibles',()=>assert(!S.convertUnit(2,'kg','m').ok,'conversion incompatible acceptée'));
test('évalue une formule avec contrôle dimensionnel',()=>{const r=S.evaluateFormula('m*a',{m:5,a:3},{m:'kg',a:'mps2'},'N');assert(r.ok&&r.value===15&&r.unit==='N','formule physique incorrecte')});
test('calcule la force de Newton',()=>{const r=S.calculateMechanics('newton-second-law',{mass:4,acceleration:2.5});assert(r.ok&&r.value===10&&r.unit==='N','force incorrecte')});
test('calcule énergie cinétique et poids',()=>{const e=S.calculateMechanics('kinetic-energy',{mass:2,speed:3}),p=S.calculateMechanics('weight',{mass:2});assert(e.ok&&e.value===9&&p.ok&&Math.abs(p.value-19.62)<1e-9,'calcul mécanique incorrect')});
test('calcule une vitesse moyenne et refuse une durée nulle',()=>{assert(S.calculateMechanics('uniform-motion',{distance:100,time:20}).value===5&&!S.calculateMechanics('uniform-motion',{distance:100,time:0}).ok,'calcul de vitesse incorrect')});
test('refuse une méthode mécanique inconnue',()=>assert(!S.calculateMechanics('unknown',{}).ok,'méthode inconnue acceptée'));
test('expose un catalogue d’unités SI',()=>{const u=S.listUnits();assert(u.some(x=>x.symbol==='kg')&&u.some(x=>x.symbol==='N')&&u.some(x=>x.symbol==='m'),'unités SI absentes')});
console.log('Résultat : '+passed+' réussis, '+failed+' échoués.');if(failed)process.exitCode=1;
