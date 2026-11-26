const fs=require('fs'),vm=require('vm');const window={};const context={window,JSON,Object,Array,String,Number,Math,Map,Set};vm.createContext(context);
for(const p of ['scientific-engine-v1.js','scientific-advanced-engine-v1.js','scientific-problem-engine-v1.js','scientific-knowledge-engine-v1.js','scientific-proof-engine-v1.js','scientific-multidomain-engine-v1.js','scientific-explanation-engine-v1.js'])vm.runInContext(fs.readFileSync('app/src/main/assets/engine/'+p,'utf8'),context);
const E=window.IdeeVisionScientificExplanation,M=window.IdeeVisionMultiDomain;let passed=0,failed=0;
function test(n,f){try{f();passed++;console.log('✓ '+n)}catch(e){failed++;console.error('✗ '+n+': '+e.message)}}
function assert(v,m){if(!v)throw Error(m)}
const plan={title:'Calcul de force',steps:[{id:'force',domain:'physics',operation:'mechanics',target:'newton-second-law',values:{mass:4,acceleration:2},sources:['Cours de mécanique'],assumptions:['Masse constante','Référentiel supposé galiléen']}]};
const result=M.run(plan);
test('moteur d’explication chargé et versionné',()=>assert(E&&E.version==='0.1.0','module absent'));
test('produit une explication complète d’un calcul mécanique',()=>{const r=E.explain(result);assert(r.ok&&r.sections.length>=5&&r.conclusion.includes('contrôles'),'explication incomplète')});
test('reprend la formule réellement fournie par le solveur',()=>{const r=E.explain(result);assert(r.sections.some(s=>s.items&&s.items.flat&&s.items.flat().some(x=>x.kind==='formula'&&x.text.includes('F'))),'formule manquante')});
test('conserve les sources déclarées',()=>{const r=E.explain(result);assert(r.sections.find(s=>s.kind==='sources').items.includes('Cours de mécanique'),'source perdue')});
test('conserve les hypothèses déclarées',()=>{const r=E.explain(result);assert(r.sections.find(s=>s.kind==='assumptions').items.length===2,'hypothèses perdues')});
test('distingue un résultat vérifié',()=>{const r=E.explain(result);assert(r.summary.verified&&r.summary.unverifiedCount===0,'statut de vérification faux')});
test('signale un calcul non vérifié indépendamment',()=>{const r=E.explain(M.run({steps:[{id:'c',domain:'mathematics',operation:'calculate',expression:'2+2',variables:{}}]}));assert(r.ok&&!r.summary.verified&&r.warnings.some(x=>x.includes('vérification indépendante')),'avertissement absent')});
test('explique une étape échouée sans fabriquer de résultat',()=>{const r=E.explain(M.run({steps:[{id:'bad',domain:'chemistry',operation:'balance-reaction'}]}));assert(r.ok&&r.summary.failedCount===1&&r.sections[1].items[0].some(x=>x.kind==='error'),'erreur non expliquée')});
test('liste les données manquantes',()=>{const r=E.explain(M.run({steps:[{id:'f',domain:'physics',operation:'mechanics',target:'newton-second-law',values:{mass:2}}]}));assert(r.ok&&r.summary.missingCount===1,'données manquantes non présentées')});
test('produit une explication simplifiée',()=>{const r=E.explain(result,{level:'simple'});assert(r.ok&&r.summary.level==='simple'&&r.sections.some(s=>s.title==='Explication simplifiée'),'niveau simple absent')});
test('produit une explication détaillée avec étapes de preuve',()=>{const r=E.explain(result,{level:'detailed'});assert(r.ok&&r.sections[1].items[0].some(x=>x.kind==='proof'),'détails de preuve absents')});
test('génère une version textuelle lisible',()=>{const r=E.explain(result);assert(r.plainText.includes('Conclusion')&&r.plainText.includes('Méthode suivie'),'texte absent')});
test('refuse un résultat non structuré',()=>{const r=E.explain({answer:'42'});assert(!r.ok&&r.error==='result-invalid','entrée invalide acceptée')});
test('respecte la limite de taille de trace',()=>{const trace=Array.from({length:41},(_,i)=>({id:'s'+i,ok:true,result:{value:i}}));const r=E.explain({trace});assert(!r.ok&&r.error==='trace-too-large','limite ignorée')});
test('explique un problème existant à partir du moteur multidisciplinaire',()=>{const r=E.explainProblem({kind:'mechanics-problem',target:'newton-second-law',solved:true,values:{mass:4,acceleration:2},result:{value:8}});assert(r.ok&&r.summary.domains[0]==='physics','adaptateur problème incorrect')});
test('refuse un type de problème sans explication disponible',()=>{const r=E.explainProblem({kind:'unclassified'});assert(!r.ok,'type inconnu présenté comme résolu')});
test('ne modifie pas les résultats originaux',()=>{const before=JSON.stringify(result);E.explain(result);assert(JSON.stringify(result)===before,'résultat source modifié')});
test('ne prétend pas authentifier les sources',()=>{const r=E.explain(result);assert(r.warnings.some(x=>x.includes('authentifiées')),'limite de source absente')});
console.log('Résultat : '+passed+' réussis, '+failed+' échoués.');if(failed)process.exitCode=1;
