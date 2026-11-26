const fs = require('fs');
const vm = require('vm');
const store = new Map();
const window = { localStorage: {
  getItem: key => store.has(key) ? store.get(key) : null,
  setItem: (key, value) => store.set(key, String(value))
}};
const context = { window, Date, Set, JSON, Object, Array, String, Math };
vm.createContext(context);
vm.runInContext(fs.readFileSync('app/src/main/assets/engine/knowledge-manager-v1.js', 'utf8'), context);
const K = window.IdeeVisionKnowledge;
let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('✓ ' + name); }
  catch (e) { failed++; console.error('✗ ' + name + ': ' + e.message); }
}
function assert(value, message) { if (!value) throw new Error(message); }
const entry = {
  id: 'physique.test.gravite', domain: 'physique', title: 'Gravitation',
  description: 'Deux masses s’attirent.', kind: 'law',
  formula: 'F = G * m1 * m2 / r^2',
  variables: [{symbol:'F',unit:'N',meaning:'Force'}],
  assumptions: ['Modèle classique'],
  tests: [{name:'Test simple',expected:'Valeur de référence'}],
  source: 'Référence pédagogique'
};
test('gestionnaire chargé et versionné', () => assert(K && K.version === '1.0.0', 'gestionnaire absent'));
test('valide une connaissance structurée', () => assert(K.validateEntry(entry).valid, 'entrée valide refusée'));
test('refuse un identifiant invalide', () => { const x={...entry,id:'../x'}; assert(!K.validateEntry(x).valid, 'identifiant dangereux accepté'); });
test('refuse une formule avec du code', () => { const x={...entry,formula:'alert(1)'}; assert(!K.validateEntry(x).valid, 'code accepté'); });
test('importe les entrées en brouillon', () => {
 const r=K.importPackage({format:'ideevision-knowledge',schemaVersion:1,title:'Test',entries:[entry]});
 assert(r.ok && r.accepted===1, 'import refusé');
 assert(K.list()[0].status==='draft', 'entrée non mise en brouillon');
});
test('refuse un doublon sans écraser l’entrée existante', () => {
 const r=K.importPackage({format:'ideevision-knowledge',schemaVersion:1,entries:[entry]});
 assert(r.ok && r.accepted===0 && r.rejected.length===1, 'doublon non détecté');
 assert(K.stats().total===1, 'doublon enregistré');
});
test('active et désactive une connaissance', () => {
 assert(K.setStatus(entry.id,'active').ok, 'activation impossible');
 assert(K.active().length===1, 'connaissance active absente');
 assert(K.setStatus(entry.id,'disabled').ok && K.active().length===0, 'désactivation impossible');
});
test('exporte les connaissances enregistrées', () => {
 const p=K.exportPackage(); assert(p.format==='ideevision-knowledge' && p.entries.length===1, 'export invalide');
});
test('supprime une connaissance', () => assert(K.remove(entry.id).ok && K.stats().total===0, 'suppression impossible'));
test('refuse un paquet de version inconnue', () => assert(!K.importPackage({format:'ideevision-knowledge',schemaVersion:9,entries:[]}).ok, 'version inconnue acceptée'));
console.log('Résultat : '+passed+' réussis, '+failed+' échoués.');
if (failed) process.exitCode=1;
