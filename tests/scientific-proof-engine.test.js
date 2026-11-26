const fs=require('fs'),vm=require('vm');const window={};const context={window,JSON,Object,Array,String,Number,Math,Map,Set,Date};vm.createContext(context);
for(const p of ['scientific-engine-v1.js','scientific-advanced-engine-v1.js','scientific-proof-engine-v1.js'])vm.runInContext(fs.readFileSync('app/src/main/assets/engine/'+p,'utf8'),context);
const P=window.IdeeVisionScientificProof;let passed=0,failed=0;
function test(name,fn){try{fn();passed++;console.log('✓ '+name)}catch(e){failed++;console.error('✗ '+name+': '+e.message)}}
function assert(v,m){if(!v)throw Error(m)}
test('moteur de preuves chargé et versionné',()=>assert(P&&P.version==='0.1.0','module absent'));
test('vérifie un calcul numérique exact',()=>{const r=P.verifyCalculation('m*a',{m:4,a:2},8);assert(r.ok&&r.verified&&r.calculatedValue===8,'calcul non vérifié')});
test('rejette une valeur annoncée incorrecte',()=>{const r=P.verifyCalculation('m*a',{m:4,a:2},9);assert(r.ok&&!r.verified&&r.status==='rejected','valeur fausse acceptée')});
test('refuse une variable absente',()=>assert(!P.verifyCalculation('m*a',{m:4},8).ok,'variable manquante acceptée'));
test('vérifie les dimensions d’une formule physique',()=>{const r=P.verifyCalculation('m*a',{m:4,a:2},8,{expectedUnit:'N',variableDimensions:{m:[0,1,0,0,0],a:[1,0,-2,0,0]}});assert(r.ok&&r.verified&&r.dimensions.valid,'contrôle dimensionnel incorrect')});
test('refuse une formule de dimensions incompatibles',()=>{const r=P.verifyCalculation('m+a',{m:4,a:2},6,{expectedUnit:'N',variableDimensions:{m:[1,0,0,0,0],a:[1,0,-2,0,0]}});assert(!r.ok&&r.error==='dimension-mismatch-addition','dimensions incompatibles acceptées')});
test('résout et vérifie toutes les racines d’une équation quadratique',()=>{const r=P.proveEquation('x^2-5*x+6=0','x');assert(r.ok&&r.verified&&r.solutions.length===2&&r.checks.every(x=>x.valid),'racines non vérifiées')});
test('refuse un ensemble incomplet ou incorrect de racines candidates',()=>{const a=P.proveEquation('x^2-5*x+6=0','x',[2]),b=P.proveEquation('x^2-5*x+6=0','x',[2,4]);assert(a.ok&&!a.verified&&!a.completeSolutionSet&&b.ok&&!b.verified&&!b.checks.every(x=>x.valid),'racines candidates incorrectes acceptées')});
test('reconnaît une équation sans solution',()=>{const r=P.proveEquation('x^2+1=0','x');assert(r.ok&&r.verified&&r.status==='no-solution'&&r.solutions.length===0,'absence de racines incorrecte')});
test('reconnaît une identité',()=>{const r=P.proveEquation('x+2=x+2','x');assert(r.ok&&r.verified&&r.status==='identity','identité non reconnue')});
test('refuse les équations hors capacité',()=>assert(!P.proveEquation('x^3=1','x').ok,'degré 3 accepté'));
test('vérifie une chaîne de calcul avec référence antérieure',()=>{const r=P.verifyDerivation([{id:'a',type:'calculation',expression:'m*a',variables:{m:4,a:2},expectedValue:8},{id:'b',type:'calculation',expression:'force/time',variables:{force:{from:'a'},time:2},expectedValue:4}]);assert(r.ok&&r.verified&&r.results.b===4&&r.completedSteps===2,'chaîne incorrecte '+JSON.stringify(r))});
test('interrompt la chaîne dès une étape incorrecte',()=>{const r=P.verifyDerivation([{id:'a',type:'calculation',expression:'2+2',variables:{},expectedValue:5},{id:'b',type:'calculation',expression:'a+1',variables:{a:{from:'a'}},expectedValue:6}]);assert(r.ok&&!r.verified&&r.completedSteps===1&&!r.results.b,'chaîne non interrompue')});
test('refuse une référence vers une étape inconnue',()=>{const r=P.verifyDerivation([{id:'a',type:'calculation',expression:'x+1',variables:{x:{from:'later'}},expectedValue:2}]);assert(!r.ok&&r.error==='step-reference-missing','référence inconnue acceptée')});
test('refuse les identifiants dupliqués',()=>{const r=P.verifyDerivation([{id:'a',type:'calculation',expression:'1+1',variables:{},expectedValue:2},{id:'a',type:'calculation',expression:'2+2',variables:{},expectedValue:4}]);assert(!r.ok&&r.error==='proof-step-id-invalid','identifiant dupliqué accepté')});
test('refuse les types d’étapes inconnus',()=>{const r=P.verifyDerivation([{id:'a',type:'magic'}]);assert(!r.ok&&r.error==='proof-step-type-unsupported','type arbitraire accepté')});
test('limite le nombre d’étapes',()=>assert(!P.verifyDerivation(Array.from({length:31},(_,i)=>({id:'s'+i,type:'calculation',expression:'1+1',variables:{},expectedValue:2}))).ok,'limite dépassée'));
test('compare les résultats théoriques et mesurés avec tolérance',()=>{const a=P.compareResults(9.81,9.8100000001,{tolerance:1e-8,unit:'m/s²'}),b=P.compareResults(9.81,10,{tolerance:1e-6});assert(a.consistent&&!b.consistent&&b.absoluteDifference>0,'comparaison incorrecte')});
test('audite le calcul d’un problème de force',()=>{const r=P.auditProblem({kind:'mechanics-problem',target:'newton-second-law',solved:true,values:{mass:4,acceleration:2},result:{value:8}});assert(r.ok&&r.verified&&r.unit==='N','audit force incorrect '+JSON.stringify(r))});
test('détecte un résultat mécanique falsifié',()=>{const r=P.auditProblem({kind:'mechanics-problem',target:'weight',solved:true,values:{mass:2,gravity:9.81},result:{value:10}});assert(r.ok&&!r.verified,'résultat erroné accepté')});
test('refuse les problèmes non pris en charge',()=>assert(!P.auditProblem({kind:'unclassified'}).ok,'problème non pris en charge accepté'));
test('ne modifie pas les données de preuve',()=>{const steps=[{id:'a',type:'calculation',expression:'x*2',variables:{x:3},expectedValue:6}],before=JSON.stringify(steps);P.verifyDerivation(steps);assert(JSON.stringify(steps)===before,'entrée modifiée')});
console.log('Résultat : '+passed+' réussis, '+failed+' échoués.');if(failed)process.exitCode=1;
