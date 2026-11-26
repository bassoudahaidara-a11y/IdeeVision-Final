const fs = require('fs');
const vm = require('vm');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync('app/src/main/assets/engine/french-understanding-v1.js', 'utf8'), context);
const Engine = context.window.IdeeVisionLanguage;
let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('✓ ' + name); }
  catch (error) { failed++; console.error('✗ ' + name + ': ' + error.message); }
}
function assert(value, message) { if (!value) throw new Error(message); }

test('module chargé et versionné', () => assert(Engine && Engine.version === '0.1.0', 'module absent'));
test('normalise accents et casse', () => assert(Engine.normalize('ÉNORME Fusée') === 'enorme fusee', 'normalisation incorrecte'));
test('comprend les synonymes français', () => {
  const r = Engine.analyze('Construis un véhicule rouge');
  assert(r.objects[0] && r.objects[0].type === 'car', 'synonyme véhicule absent');
  assert(r.objects[0].attributes.color === '#FF6B6B', 'couleur absente');
});
test('détecte plusieurs objets', () => {
  const r = Engine.analyze('Une maison près de trois arbres');
  assert(r.objects.length === 2, 'deux types attendus');
  assert(r.objects[1].quantity === 3, 'quantité trois incorrecte');
});
test('détecte une intention de simulation', () => assert(Engine.analyze('Simule une balle qui tombe').intent === 'simulate', 'intention incorrecte'));
test('détecte les actions de mouvement', () => assert(Engine.analyze('Un robot qui tourne et avance').actions.includes('rotate') && Engine.analyze('Un robot qui tourne et avance').actions.includes('move'), 'actions absentes'));
test('choisit le mode 2D', () => assert(Engine.analyze('Un dessin 2D de maison').mode === '2D', 'mode incorrect'));
test('demande une précision pour un objet inconnu', () => assert(Engine.analyze('Construis un appareil quantique inédit').status === 'needs_clarification', 'clarification absente'));
test('ne dépasse pas la quantité maximale', () => assert(Engine.analyze('Construis 99 robots').objects[0].quantity === 20, 'limite non appliquée'));
test('ne modifie pas le texte original fourni', () => assert(Engine.analyze('  Un arbre  ').normalizedText === 'un arbre', 'texte normalisé incorrect'));
console.log('Résultat : ' + passed + ' réussis, ' + failed + ' échoués.');
if (failed) process.exitCode = 1;
