const fs = require('fs');
const vm = require('vm');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync('app/src/main/assets/engine/idea-understanding-contract-v1.js', 'utf8'), context);
const Contract = context.window.IdeeVisionUnderstandingContract;
const lines = fs.readFileSync('training/phase01/examples-fr-v0.2.jsonl', 'utf8').trim().split(/\r?\n/);
let failed = 0;
const seenInputs = new Set();
for (let i = 0; i < lines.length; i++) {
  try {
    const row = JSON.parse(lines[i]);
    if (typeof row.input !== 'string' || !row.input.trim()) throw new Error('entrée vide');
    const normalized = row.input.trim().toLocaleLowerCase('fr');
    if (seenInputs.has(normalized)) throw new Error('entrée répétée');
    seenInputs.add(normalized);
    const result = Contract.validate(row.expected);
    if (!result.valid) throw new Error(result.errors.join('; '));
    for (const action of row.expected.actions) {
      if (typeof action.target !== 'string') throw new Error('action sans cible explicite');
    }
  } catch (error) {
    failed++;
    console.error('Ligne ' + (i + 1) + ' invalide : ' + error.message);
  }
}
console.log('Corpus : ' + (lines.length - failed) + '/' + lines.length + ' exemples valides et sans doublons.');
if (lines.length < 80 || failed) process.exitCode = 1;
