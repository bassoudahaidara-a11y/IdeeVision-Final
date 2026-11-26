'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.join(__dirname, '..', 'training', 'phase01', 'splits');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync('app/src/main/assets/engine/idea-understanding-contract-v1.js', 'utf8'), context);
const Contract = context.window.IdeeVisionUnderstandingContract;
function signature(row) {
  const expected = row.expected;
  const ids = new Map(expected.objects.map((object, index) => [object.id, 'o' + index]));
  const objects = expected.objects.map(object => ({
    concept: object.concept, quantity: object.quantity, properties: object.properties
  })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const relations = expected.relations.map(relation => ({
    from: ids.get(relation.from), to: ids.get(relation.to), type: relation.type
  })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  const actions = expected.actions.map(action => ({
    type: action.type, target: ids.get(action.target), parameters: action.parameters || {}
  }));
  return JSON.stringify({
    intent: expected.intent, mode: expected.mode, objects, relations, actions,
    needsClarification: expected.needsClarification
  });
}
const files = ['train.jsonl', 'validation.jsonl', 'test.jsonl'];
const signatures = new Map();
let total = 0;
for (const file of files) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) throw new Error('Ensemble absent : ' + file + '. Exécuter split-corpus.js.');
  const rows = fs.readFileSync(fullPath, 'utf8').trim().split(/\r?\n/).map(JSON.parse);
  if (!rows.length) throw new Error('Ensemble vide : ' + file);
  for (const row of rows) {
    const result = Contract.validate(row.expected);
    if (!result.valid) throw new Error(file + ' : ' + result.errors.join('; '));
    const key = signature(row);
    if (signatures.has(key) && signatures.get(key) !== file) {
      throw new Error('Même famille sémantique répartie entre ' + signatures.get(key) + ' et ' + file);
    }
    signatures.set(key, file);
    total++;
  }
  console.log(file + ' : ' + rows.length + ' exemples valides');
}
console.log('Découpage : ' + total + ' exemples vérifiés, sans fuite de famille.');
