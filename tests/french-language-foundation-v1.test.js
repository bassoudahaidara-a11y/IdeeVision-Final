const test = require("node:test");
const assert = require("node:assert/strict");
const F = require("../app/src/main/assets/understanding/french-language-foundation-v1.js");

test("01 normalise les espaces et les apostrophes typographiques", () => {
  assert.equal(F.normalize("  L’avion   est là.  "), "L'avion est là.");
});

test("02 conserve les accents dans le texte source", () => {
  assert.equal(F.normalize("électricité"), "électricité");
  assert.equal(F.fold("Électricité"), "electricite");
});

test("03 découpe une description en phrases", () => {
  assert.equal(F.splitSentences("Une bouteille. Un tube ! Une pompe ?").length, 3);
});

test("04 tokenise les mots accentués et les apostrophes", () => {
  const words = F.tokenize("L'avion possède une hélice.");
  assert.ok(words.some(t => t.text === "L'avion"));
  assert.ok(words.some(t => t.text === "hélice"));
});

test("05 conserve les positions des mots dans le texte", () => {
  const t = F.tokenize("Une bouteille");
  assert.equal("Une bouteille".slice(t[1].start, t[1].end), "bouteille");
});

test("06 distingue les nombres décimaux français", () => {
  const q = F.extractQuantities(F.tokenize("Une masse de 2,5 kg"));
  assert.equal(q[0].value, 2.5);
  assert.equal(q[0].unit, "kg");
});

test("07 reconnaît un objet du lexique", () => {
  const a = F.analyze("Une bouteille est sur la table.");
  assert.ok(a.structure.objects.some(o => o.lemma === "bouteille" && o.status === "recognized"));
});

test("08 marque un nom absent du lexique comme candidat", () => {
  const a = F.analyze("Une zorbale est dans la pièce.");
  assert.ok(a.structure.objects.some(o => o.text === "zorbale" && o.status === "candidate"));
});

test("09 reconnaît une propriété explicitement décrite", () => {
  const a = F.analyze("Une grande bouteille rouge.");
  const bottle = a.structure.objects.find(o => o.lemma === "bouteille");
  assert.ok(bottle.properties.some(p => p.value === "grande"));
  assert.ok(bottle.properties.some(p => p.category === "color" && p.value === "rouge"));
});

test("10 reconnaît les verbes d'action sans inventer leurs rôles", () => {
  const a = F.analyze("La pompe pousse l'eau.");
  assert.ok(a.structure.actions.some(x => x.lemma === "pousser"));
  assert.equal(a.structure.actions[0].subjectText, null);
  assert.equal(a.structure.actions[0].objectText, null);
});

test("11 détecte la négation d'une action", () => {
  const a = F.analyze("La pompe ne pousse pas l'eau.");
  assert.equal(a.structure.actions[0].polarity, "negative");
});

test("12 reconnaît une relation spatiale exprimée", () => {
  const a = F.analyze("La bouteille est dans la boîte.");
  assert.ok(a.structure.relations.some(r => r.type === "inside" && r.status === "explicit_relation"));
});

test("13 signale une relation spatiale incomplète", () => {
  const a = F.analyze("L'objet est sous.");
  assert.ok(a.issues.some(i => i.code === "incomplete_relation"));
});

test("14 repère des marqueurs temporels", () => {
  const a = F.analyze("La balle tombe puis roule.");
  assert.ok(a.structure.relations.some(r => r.type === "temporal_then"));
});

test("15 traite plusieurs phrases comme une description unique", () => {
  const a = F.analyze("Une bouteille contient de l'eau. Un tube relie la bouteille à une pompe.");
  assert.equal(a.sentences.length, 2);
  assert.ok(a.structure.objects.some(o => o.lemma === "bouteille"));
  assert.ok(a.structure.objects.some(o => o.lemma === "pompe"));
});

test("16 conserve les quantités sans calculer de résultat physique", () => {
  const a = F.analyze("Un tube mesure 2 m et la bouteille contient 0,5 l.");
  assert.equal(a.structure.quantities.length, 2);
  assert.equal(a.interpretationPolicy.physicsApplied, false);
});

test("17 ne transforme pas les mots inconnus en faits certains", () => {
  const a = F.analyze("Une zorbale bleue touche un flumet.");
  assert.ok(a.structure.objects.filter(o => o.status === "candidate").length >= 2);
});

test("18 ne prétend pas résoudre les rôles grammaticaux", () => {
  const a = F.analyze("Le garçon pousse le chariot.");
  assert.equal(a.structure.actions[0].status, "verb_recognized_roles_unresolved");
});

test("19 expose les limites du moteur", () => {
  const d = F.diagnostics();
  assert.equal(d.offline, true);
  assert.deepEqual(d.externalDependencies, []);
  assert.ok(d.limitations.length >= 4);
});

test("20 une description vide est signalée", () => {
  const a = F.analyze("   ");
  assert.ok(a.issues.some(i => i.code === "empty_description"));
});

test("21 le moteur ne déduit pas les lois physiques", () => {
  const a = F.analyze("Une balle est au-dessus du sol.");
  assert.equal(a.interpretationPolicy.physicsApplied, false);
  assert.equal(a.interpretationPolicy.unstatedPropertiesInvented, false);
});
