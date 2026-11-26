'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.join(__dirname, '..', 'training', 'phase01', 'splits');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync('app/src/main/assets/engine/idea-understanding-contract-v1.js', 'utf8'), context);
const Contract = context.window.IdeeVisionUnderstandingContract;
const files = ['train.jsonl', 'validation.jsonl', 'test.jsonl'];
const signatures = new Map();
let total = 0;
for (const file of files) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) throw new Error('Ensemble absent : ' + file + '. Exécuter split-corpus.js.');
  const rows = fs.readFileSync(fullPath, 'utf8').trim().split(/\\r?\\n/).map(JSON.parse);
  if (!rows.length) throw new Error('Ensemble vide : ' + file);
  for (const row of rows) {
    const result = Contract.validate(row.expected);
    if (!result.valid) throw new Error(file + ' : ' + result.errors.join('; '));
    const signature = JSON.stringify(row.expected);
    if (signatures.has(signature) && signatures.get(signature) !== file) {
      throw new Error('Même sortie attendue répartie entre ' + signatures.get(signature) + ' et ' + file);
    }
    signatures.set(signature, file);
    total++;
  }
  console.log(file + ' : ' + rows.length + ' exemples valides');
}
console.log('Découpage : ' + total + ' exemples vérifiés.');
