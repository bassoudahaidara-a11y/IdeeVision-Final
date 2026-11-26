const fs=require('fs'),vm=require('vm');
const window={};const context={window,JSON,Object,Array,String,Number,Math,Map,Set,Date};vm.createContext(context);
vm.runInContext(fs.readFileSync('app/src/main/assets/engine/scientific-engine-v1.js','utf8'),context);
vm.runInContext(fs.readFileSync('app/src/main/assets/engine/scientific-problem-engine-v1.js','utf8'),context);
const P=window.IdeeVisionScientificProblem;let passed=0,failed=0;
function test(name,fn){try{fn();passed++;console.log('✓ '+name)}catch(e){failed++;console.error('✗ '+name+': '+e.message)}}
function assert(v,m){if(!v)throw new Error(m)}
test('module de compréhension scientifique chargé',()=>assert(P&&P.version==='0.1.0','module absent'));
test('extrait une masse en kilogrammes',()=>{const r=P.extractMeasurements('La masse est de 4 kg.');assert(r.values.mass===4,'masse non extraite')});
test('convertit les grammes en kilogrammes',()=>{const r=P.extractMeasurements('Une masse de 500 g.');assert(r.values.mass===.5,'conversion gramme incorrecte')});
test('convertit les kilomètres en mètres',()=>{const r=P.extractMeasurements('Distance parcourue : 2 km.');assert(r.values.distance===2000,'conversion km incorrecte')});
test('convertit les minutes en secondes',()=>{const r=P.extractMeasurements('pendant 2 min');assert(r.values.time===120,'conversion minute incorrecte')});
test('convertit les kilomètres par heure en mètres par seconde',()=>{const r=P.extractMeasurements('vitesse de 36 km/h');assert(Math.abs(r.values.speed-10)<1e-9,'conversion vitesse incorrecte')});
test('extrait une accélération avec exposant',()=>{const r=P.extractMeasurements('accélération de 3 m/s²');assert(r.values.acceleration===3,'accélération non extraite')});
test('identifie un problème de force et calcule le résultat',()=>{const r=P.solve('Un objet de masse 4 kg subit une accélération de 2 m/s². Calcule la force résultante.');assert(r.ok&&r.solved&&r.target==='newton-second-law'&&r.result.value===8&&r.result.unit==='N','calcul de force incorrect')});
test('identifie le poids et utilise g par défaut',()=>{const r=P.solve('Une masse de 2 kg. Calcule son poids.');assert(r.ok&&r.solved&&r.result.unit==='N'&&Math.abs(r.result.value-19.62)<1e-9,'calcul du poids incorrect')});
test('identifie une énergie cinétique',()=>{const r=P.solve('Un mobile a une masse de 2 kg et une vitesse de 3 m/s. Calcule son énergie cinétique.');assert(r.ok&&r.solved&&r.result.value===9&&r.result.unit==='J','énergie cinétique incorrecte')});
test('identifie une vitesse moyenne',()=>{const r=P.solve('Un véhicule parcourt une distance de 100 m en 20 s. Calcule sa vitesse moyenne.');assert(r.ok&&r.solved&&r.result.value===5&&r.result.unit==='m/s','vitesse incorrecte')});
test('signale une masse manquante',()=>{const r=P.solve('Une accélération de 2 m/s². Calcule la force.');assert(r.ok&&r.needsClarification&&r.missing.includes('mass'),'masse manquante non signalée')});
test('signale une durée manquante pour la vitesse',()=>{const r=P.solve('Un objet parcourt 100 m. Calcule sa vitesse moyenne.');assert(r.ok&&r.missing.includes('time'),'durée manquante non signalée')});
test('ne choisit pas une formule arbitraire si la grandeur est inconnue',()=>{const r=P.analyze('Un objet de 4 kg se déplace.');assert(r.ok&&r.kind==='unclassified'&&r.needsClarification,'question non classée incorrectement')});
test('reconnaît et résout une équation dans un énoncé',()=>{const r=P.solve('Résous l’équation 2*x+3=7');assert(r.ok&&r.kind==='equation'&&r.solved.solutions[0]===2,'équation non résolue')});
test('refuse un énoncé vide et trop long',()=>assert(!P.analyze('').ok&&!P.analyze('a'.repeat(1201)).ok,'limite texte non appliquée'));
test('limite le nombre de mesures extraites',()=>{const r=P.extractMeasurements(Array(40).fill('1 kg').join(' '));assert(r.measurements.length===30,'limite des mesures ignorée')});
test('conserve les valeurs SI et la trace des données sources',()=>{const r=P.analyze('Une masse de 500 g et une accélération de 2 m/s², calculer la force');assert(r.measurements.length===2&&r.values.mass===.5&&r.values.acceleration===2,'trace des mesures incomplète')});
test('fournit les étapes et la formule du calcul',()=>{const r=P.solve('Masse 3 kg, accélération 4 m/s². Détermine la force.');assert(r.solved&&r.calculation.steps.length>=2&&r.calculation.formula==='F = m × a','explication du calcul absente')});
test('ne modifie pas le texte d’origine',()=>{const s='  masse de 4 kg, accélération de 2 m/s² : calcule la force  ';P.analyze(s);assert(s.startsWith('  ')&&s.endsWith('  '),'texte original modifié')});
console.log('Résultat : '+passed+' réussis, '+failed+' échoués.');if(failed)process.exitCode=1;
