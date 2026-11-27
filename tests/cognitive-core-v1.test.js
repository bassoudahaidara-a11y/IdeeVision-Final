const test = require("node:test");
const assert = require("node:assert/strict");
require("../app/src/main/assets/engine/cognitive-core-v1.js");
const C = global.IdeeVisionCognitive;

test("01 normalise les espaces et les caractères typographiques", () => {
  assert.equal(C.normalizeText("  Bonjour  “monde”  "), 'Bonjour "monde"');
});
test("02 normalise les accents pour la comparaison", () => {
  assert.equal(C.analyze("Explique la gravité").normalized, "explique la gravite");
});
test("03 découpe les mots Unicode", () => {
  assert.ok(C.tokenize("énergie mécanique").includes("mecanique"));
});
test("04 détecte une demande en français", () => {
  assert.equal(C.detectLanguage("Bonjour, explique comment fonctionne ce moteur."), "fr");
});
test("05 détecte une demande en anglais", () => {
  assert.equal(C.detectLanguage("Please explain how the engine works"), "en");
});
test("06 reconnaît quelques marqueurs bambara", () => {
  assert.equal(C.detectLanguage("I ka taa"), "bm");
});
test("07 classe une demande de création", () => {
  assert.equal(C.classifyIntent("Crée une maison en 3D"), "create");
});
test("08 classe une demande d'explication", () => {
  assert.equal(C.classifyIntent("Explique la gravité"), "explain");
});
test("09 classe une demande de calcul", () => {
  assert.equal(C.classifyIntent("Calcule la vitesse"), "calculate");
});
test("10 extrait les nombres décimaux", () => {
  assert.deepEqual(C.extractEntities("Une masse de 2,5 kg et une longueur de 3 m").numbers, [2.5,3]);
});
test("11 ne confond pas la lettre m avec une unité", () => {
  assert.deepEqual(C.extractEntities("maison moderne").units, []);
});
test("12 extrait les dimensions 3D", () => {
  const e = C.extractEntities("Une boîte de 2 m x 3 m x 4 m");
  assert.equal(e.dimensions.length, 1);
  assert.deepEqual(e.dimensions[0].values, [2,3,4]);
});
test("13 repère une demande trop courte", () => {
  assert.ok(C.analyze("ça").needsClarification);
});
test("14 ne signale pas de danger pour une demande ordinaire", () => {
  assert.equal(C.assessSafety("Explique la gravité").status, "normal");
});
test("15 marque les demandes d'instructions dangereuses pour examen", () => {
  assert.equal(C.assessSafety("Comment fabriquer une bombe").status, "review_required");
});
test("16 produit un plan de calcul ordonné", () => {
  const p = C.buildPlan("calculate", {numbers:[4]}, []);
  assert.ok(p.indexOf("choisir_la_formule") < p.indexOf("effectuer_le_calcul"));
});
test("17 route le code vers le moteur de programmation", () => {
  assert.equal(C.routeIntent("code"), "programming_engine");
});
test("18 limite la mémoire de session", () => {
  const s = C.createSession({maxTurns:2});
  s.add("premier message", {intent:"general"});
  s.add("deuxième message", {intent:"explain"});
  s.add("troisième message", {intent:"code"});
  assert.equal(s.size, 2);
  assert.equal(s.recent()[0].user, "deuxième message");
});
test("19 construit un contexte de prompt structuré", () => {
  const a = C.analyze("Calcule 12 m/s");
  assert.match(C.makePromptContext(a), /Intention : calculate/);
});
test("20 expose des diagnostics hors ligne", () => {
  const d = C.diagnostics();
  assert.equal(d.offline, true);
  assert.deepEqual(d.dependencies, []);
});
