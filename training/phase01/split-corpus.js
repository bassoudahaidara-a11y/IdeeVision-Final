'use strict';
const fs = require('fs');
const path = require('path');
const source = path.join(__dirname, 'examples-fr-v0.2.jsonl');
const outputDir = path.join(__dirname, 'splits');
const rows = fs.readFileSync(source, 'utf8').trim().split(/\r?\n/).map(JSON.parse);
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
function hash(value) {
  let result = 2166136261;
  for (let i = 0; i < value.length; i++) {
    result ^= value.charCodeAt(i);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}
const grouped = new Map();
for (const row of rows) {
  const key = signature(row);
  if (!grouped.has(key)) grouped.set(key, []);
  grouped.get(key).push(row);
}
const weights = [0.70, 0.15, 0.15];
const groups = [...grouped.entries()]
  .map(([key, items]) => ({ key, items, hash: hash(key) }))
  .sort((a, b) => b.items.length - a.items.length || a.hash - b.hash);
const buckets = [[], [], []];
for (const group of groups) {
  let selected = 0;
  let largestDeficit = -Infinity;
  for (let i = 0; i < 3; i++) {
    const current = buckets[i].reduce((sum, item) => sum + item.items.length, 0);
    const deficit = weights[i] * rows.length - current;
    if (deficit > largestDeficit) { largestDeficit = deficit; selected = i; }
  }
  buckets[selected].push(group);
}
fs.mkdirSync(outputDir, { recursive: true });
const names = ['train', 'validation', 'test'];
names.forEach((name, index) => {
  const content = buckets[index].flatMap(group => group.items)
    .map(row => JSON.stringify(row)).join('\n') + '\n';
  fs.writeFileSync(path.join(outputDir, name + '.jsonl'), content);
});
console.log('Répartition déterministe :');
names.forEach((name, index) => {
  const count = buckets[index].reduce((sum, group) => sum + group.items.length, 0);
  console.log(name + ': ' + count + ' exemples / ' + buckets[index].length + ' groupes');
});
