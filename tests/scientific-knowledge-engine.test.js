const fs=require('fs'),vm=require('vm');
const window={};const context={window,JSON,Object,Array,String,Number,Math,Map,Set,Date};vm.createContext(context);
for(const p of ['scientific-engine-v1.js','reasoning-engine-v1.js','scientific-knowledge-engine-v1.js'])vm.runInContext(fs.readFileSync('app/src/main/assets/engine/'+p,'utf8'),context);
const E=window.IdeeVisionScientificKnowledge,R=window.IdeeVisionReasoning;
const entries=[
 {id:'formula.force',title:'Deuxième loi de Newton',domain:'physique',kind:'formula',description:'Calculer la force résultante à partir de la masse et de l’accélération.',formula:'F = m * a',variables:[{symbol:'m',unit:'kg',meaning:'masse'},{symbol:'a',unit:'mps2',meaning:'accélération'}],source:'Cours de mécanique',status:'active'},
 {id:'formula.speed',title:'Vitesse moyenne',domain:'physique',kind:'formula',description:'Distance divisée par durée.',formula:'v = d / t',variables:[{symbol:'d',unit:'m',meaning:'distance'},{symbol:'t',unit:'s',meaning:'durée'}],source:'Cours de mécanique',status:'active'},
 {id:'formula.draft',title:'Formule brouillon',domain:'physique',kind:'formula',description:'Ne doit pas être utilisée.',formula:'x = y + 1',variables:[{symbol:'y',unit:'m',meaning:'distance'}],status:'draft'}
];
const api={active:()=>entries.filter(x=>x.status==='active')};
let passed=0,failed=0;
function test(name,fn){try{fn();passed++;console.log('✓ '+name)}catch(e){failed++;console.error('✗ '+name+': '+e.message)}}
function assert(v,m){if(!v)throw new Error(m)}
test('module de connaissances scientifiques chargé',()=>assert(E&&E.version==='0.1.0','module absent'));
test('recherche les connaissances actives par mots-clés',()=>{const r=E.search('force masse accélération',{knowledgeApi:api});assert(r.ok&&r.matches[0].id==='formula.force','recherche incorrecte')});
test('ne retourne pas les connaissances en brouillon',()=>{const r=E.search('brouillon',{knowledgeApi:api});assert(r.ok&&r.matches.length===0,'brouillon visible')});
test('limite le nombre de résultats',()=>{const r=E.search('physique',{knowledgeApi:api,limit:99});assert(r.matches.length<=10,'limite dépassée')});
test('analyse une formule simple sans eval',()=>{const r=E.parseFormula('F = m * a');assert(r.ok&&r.resultSymbol==='F'&&r.expression==='m * a','analyse incorrecte')});
test('refuse les formules avec plusieurs égalités',()=>assert(!E.parseFormula('x=y=z').ok,'égalité multiple acceptée'));
test('refuse une formule contenant du code',()=>assert(!E.parseFormula('x = alert(1)').ok,'code arbitraire accepté'));
test('importe les connaissances actives dans le moteur de raisonnement',()=>{const b=R.createKnowledgeBase();const r=E.importIntoReasoning(b,{knowledgeApi:api});assert(r.ok&&r.entries===2&&b.facts.some(f=>f.predicate==='formula'),'import des connaissances incorrect')});
test('évite de dupliquer les faits importés',()=>{const b=R.createKnowledgeBase();E.importIntoReasoning(b,{knowledgeApi:api});const n=b.facts.length;E.importIntoReasoning(b,{knowledgeApi:api});assert(b.facts.length===n,'faits dupliqués')});
test('évalue une formule de connaissance et vérifie les dimensions SI',()=>{const r=E.evaluateKnowledgeFormula(entries[0],{mass:4,acceleration:2},{knowledgeApi:api,resultUnit:'N'});assert(r.ok&&r.solved&&r.value===8&&r.unit==='N','évaluation ou dimension incorrecte '+JSON.stringify(r))});
test('signale les variables manquantes',()=>{const r=E.evaluateKnowledgeFormula(entries[0],{mass:4},{resultUnit:'N'});assert(r.ok&&!r.solved&&r.missing.some(x=>x.symbol==='a'),'variable manquante non détectée')});
test('refuse les unités dimensionnellement incompatibles',()=>{const r=E.evaluateKnowledgeFormula(entries[0],{mass:4,acceleration:2},{resultUnit:'J'});assert(!r.ok&&r.error==='formula-dimension-mismatch','unité incohérente acceptée')});
test('compare plusieurs méthodes sans les présenter comme preuves',()=>{const r=E.compareMethods('physique force vitesse',{knowledgeApi:api});assert(r.ok&&r.count===2&&r.methods.some(x=>x.id==='formula.force')&&r.methods.some(x=>x.id==='formula.speed')&&r.notice.includes('lexicale'),'comparaison incorrecte '+JSON.stringify(r))});
test('audite le raisonnement et remonte les contradictions',()=>{const b=R.createKnowledgeBase();R.addFact(b,{id:'f1',subject:'objet',predicate:'etat',object:'chaud'});R.addFact(b,{id:'f2',subject:'objet',predicate:'etat',object:'froid'});const r=E.audit(b,{knowledgeApi:api});assert(r.ok&&r.contradictions.length===1&&r.warnings.length===1,'contradiction non remontée')});
test('retourne les limites quand aucune connaissance ne correspond',()=>{const r=E.analyze('volcans et séismes',{}, {knowledgeApi:api});assert(r.ok&&r.needsMoreKnowledge&&r.methods.length===0,'absence de connaissance mal gérée '+JSON.stringify(r))});
test('ne modifie ni la bibliothèque ni les données reçues',()=>{const before=JSON.stringify(entries),v={mass:4,acceleration:2};E.analyze('force masse accélération',v,{knowledgeApi:api});assert(JSON.stringify(entries)===before&&v.mass===4,'données modifiées')});
test('refuse un gestionnaire de connaissances absent',()=>assert(!E.search('force',{knowledgeApi:{}}).ok,'gestionnaire absent accepté'));
console.log('Résultat : '+passed+' réussis, '+failed+' échoués.');if(failed)process.exitCode=1;
