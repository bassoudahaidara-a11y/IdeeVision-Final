const fs = require('fs');
const vm = require('vm');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync('app/src/main/assets/engine/idea-understanding-contract-v1.js', 'utf8'), context);
const Contract = context.window.IdeeVisionUnderstandingContract;
let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('✓ ' + name); }
  catch (error) { failed++; console.error('✗ ' + name + ': ' + error.message); }
}
function assert(value, message) { if (!value) throw new Error(message); }
function validBase() {
  return {
    schemaVersion: 1, language: 'fr', intent: 'create', mode: '3D',
    objects: [{ id: 'objet_1', concept: 'robot', label: 'robot', quantity: 1, properties: { color: 'bleu', material: 'metal' } }],
    relations: [], actions: [{ type: 'rotate', target: 'objet_1' }],
    confidence: 0.8, needsClarification: false
  };
}
test('contrat chargé et versionné', () => assert(Contract && Contract.version === '1.0.0', 'contrat absent'));
test('accepte une interprétation valide', () => assert(Contract.validate(validBase()).valid, 'interprétation valide refusée'));
test('refuse un identifiant dupliqué', () => { const x=validBase(); x.objects.push({...x.objects[0]}); assert(!Contract.validate(x).valid, 'doublon accepté'); });
test('refuse une quantité hors limites', () => { const x=validBase(); x.objects[0].quantity=21; assert(!Contract.validate(x).valid, 'quantité excessive acceptée'); });
test('refuse une propriété inconnue', () => { const x=validBase(); x.objects[0].properties.script='alert(1)'; assert(!Contract.validate(x).valid, 'propriété inconnue acceptée'); });
test('refuse une relation vers un objet absent', () => { const x=validBase(); x.relations=[{from:'objet_1',to:'absent',type:'near'}]; assert(!Contract.validate(x).valid, 'référence absente acceptée'); });
test('refuse une action inconnue', () => { const x=validBase(); x.actions=[{type:'execute_code'}]; assert(!Contract.validate(x).valid, 'action inconnue acceptée'); });
test('exige une question si une clarification est nécessaire', () => { const x=validBase(); x.needsClarification=true; assert(!Contract.validate(x).valid, 'question manquante acceptée'); });
test('accepte une clarification correctement formulée', () => { const x=validBase(); x.needsClarification=true; x.clarificationQuestion='Quelle taille souhaites-tu ?'; assert(Contract.validate(x).valid, 'clarification valide refusée'); });
test('convertit un résultat lexical en contrat contrôlable', () => {
  const x=Contract.fromLexical({intent:'create',mode:'3D',status:'parsed',objects:[{type:'robot',sourceMention:'robot',quantity:1,attributes:{color:'#fff',size:'small'}}],actions:['rotate']});
  assert(Contract.validate(x).valid, 'conversion invalide');
});
test('ne permet pas au modèle de fournir du code exécutable', () => { const x=validBase(); x.generatedCode='console.log(1)'; assert(!Contract.validate(x).valid, 'code arbitraire accepté'); });
console.log('Résultat : ' + passed + ' réussis, ' + failed + ' échoués.');
if (failed) process.exitCode = 1;
