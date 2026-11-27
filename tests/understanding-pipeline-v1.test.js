"use strict";
const test=require("node:test");const assert=require("node:assert/strict");
const F=require("../app/src/main/assets/understanding/french-language-foundation-v1.js");
const G=require("../app/src/main/assets/understanding/french-grammar-semantics-v1.js");
const I=require("../app/src/main/assets/understanding/intent-understanding-v1.js");
const O=require("../app/src/main/assets/understanding/object-model-v1.js");
const A=require("../app/src/main/assets/understanding/action-model-v1.js");
const R=require("../app/src/main/assets/understanding/relation-graph-v1.js");
const Q=require("../app/src/main/assets/understanding/reference-resolver-v1.js");
const P=require("../app/src/main/assets/understanding/understanding-pipeline-v1.js");
test("1 pipeline disponible sans réseau",()=>assert.equal(P.diagnostics().offline,true));

test("2 pipeline renvoie une structure stable",()=>assert.equal(P.analyze("La balle tombe.").ready,true));
test("3 source originale conservée",()=>{const s="La balle tombe dans le tube.";assert.equal(P.analyze(s).source,s);});
test("4 détecte un objet connu",()=>assert.ok(P.analyze("La bouteille contient de l'eau.").representation.objects.some(x=>x.text.toLowerCase()==="bouteille")));
test("5 détecte des quantités",()=>assert.ok(P.analyze("Le tube mesure 20 cm.").representation.quantities.length));
test("6 conserve une action",()=>assert.ok(P.analyze("La balle tombe.").representation.actions.length));
test("7 conserve une relation",()=>assert.ok(P.analyze("La balle est dans le tube.").representation.relations.length));
test("8 joint les prédicats grammaticaux",()=>assert.ok(P.analyze("La bouteille contient de l'eau.").representation.predicates.length));
test("9 reconnaît une intention de simulation",()=>assert.ok(P.analyze("Simule le mouvement de la balle.").representation.intents.some(x=>x.type==="simulation")));
test("10 conserve la contrainte hors ligne",()=>assert.ok(P.analyze("Construis un modèle hors ligne.").stages.intent.constraints.some(x=>x.type==="offline")));
test("11 contrôle la cohérence des trois sources",()=>assert.equal(P.analyze("La balle tombe dans le tube.").stages.intent.contextIntegration.status,"linked"));
test("12 ne lance aucune physique",()=>assert.equal(P.analyze("La balle tombe.").policy.physicsApplied,false));
test("13 n'utilise aucune IA externe",()=>assert.equal(P.analyze("Explique le moteur.").policy.externalAIUsed,false));
test("14 signale une entrée vide",()=>assert.equal(P.analyze(" ").ready,false));
test("15 n'invente pas les faits absents",()=>assert.equal(P.analyze("Un objet inconnu.").policy.unstatedFactsInvented,false));
test("16 sortie JSON sérialisable",()=>assert.doesNotThrow(()=>JSON.stringify(P.analyze("Un moteur tourne."))));
test("17 diagnostics indiquent les limites",()=>assert.ok(P.diagnostics().limitations.length>=3));
test("18 les intentions gardent les positions",()=>{const a=P.analyze("Crée un modèle.");const x=a.representation.intents[0];assert.equal(a.source.slice(x.sourceRange.start,x.sourceRange.end),x.evidence);});
test("19 le pipeline garde les pronoms non résolus",()=>{const a=P.analyze("Il le pousse.");assert.ok(Array.isArray(a.representation.pronouns));});
test("20 le contexte du prompt est du JSON valide",()=>{const a=P.analyze("La balle tombe.");assert.doesNotThrow(()=>JSON.parse(a.promptContext));});

test("21 pipeline intègre le modèle descriptif des objets",()=>assert.ok(P.analyze("Une bouteille rouge.").representation.objectModels.length));
test("22 le modèle d'objets est une étape séparée",()=>assert.ok(P.analyze("Une bouteille.").stages.objects.objectCount>0));
test("23 le contexte JSON contient les modèles d'objets",()=>{const a=P.analyze("Une table en bois.");assert.ok(JSON.parse(a.promptContext).objectModels.length>0);});
test("24 la politique garde les identités interphrases non résolues",()=>assert.equal(P.analyze("Une bouteille. Elle est rouge.").policy.objectIdentityAcrossSentencesResolved,false));

test("25 pipeline intègre le moteur descriptif des actions",()=>assert.ok(P.analyze("La balle tombe.").representation.actionModels.length));
test("26 le moteur d'actions est une étape séparée",()=>assert.ok(P.analyze("La balle tombe.").stages.actions.actionCount>0));
test("27 le contexte JSON contient les modèles d'actions",()=>assert.ok(JSON.parse(P.analyze("Le robot pousse la balle.").promptContext).actionModels.length>0));
test("28 la séquence d'actions est conservée",()=>assert.ok(P.analyze("La balle tombe puis tourne.").representation.actionSequence.length>=2));
test("29 la négation reste signalée dans le pipeline",()=>assert.equal(P.analyze("Ne pousse pas la balle.").representation.actionModels[0].polarity,"negative"));
test("30 le pipeline n'invente aucune causalité",()=>assert.equal(P.analyze("Le moteur tourne.").representation.actionModels[0]&&P.analyze("Le moteur tourne.").representation.actionModels[0].resultStateStatus,"not_specified"));

test("31 pipeline intègre le graphe des relations",()=>assert.ok(P.analyze("Le robot pousse la balle.").representation.relationGraph.nodes.length));
test("32 le graphe est une étape distincte",()=>assert.ok(P.analyze("Le robot pousse la balle.").stages.relations.edgeCount>0));
test("33 le contexte JSON contient le graphe",()=>assert.ok(JSON.parse(P.analyze("La balle est dans le tube.").promptContext).relationGraph.edges.length>0));
test("34 le graphe conserve les liens action-objet",()=>assert.ok(P.analyze("Le robot pousse la balle.").representation.relationGraph.edges.some(e=>e.type==="action_target")));
test("35 le graphe ne déduit aucune causalité",()=>assert.equal(P.analyze("Le moteur tourne.").representation.relationGraph.policy.causalityInferred,false));

test("36 pipeline intègre la résolution des références",()=>assert.ok(P.analyze("Une bouteille. Elle roule.").representation.referenceResolution.references.length));
test("37 la résolution est une étape distincte",()=>assert.ok(P.analyze("Une bouteille. Elle roule.").stages.references.referenceCount>0));
test("38 le contexte JSON contient les références",()=>assert.ok(JSON.parse(P.analyze("Une bouteille. Elle roule.").promptContext).referenceResolution.references.length>0));
test("39 le pipeline conserve le candidat de pronom",()=>assert.equal(P.analyze("Une bouteille. Elle roule.").representation.referenceResolution.references[0].status,"resolved_candidate"));
test("40 le pipeline ne transfère pas les propriétés",()=>assert.equal(P.analyze("Une bouteille rouge. Elle roule.").representation.referenceResolution.policy.physicalPropertiesTransferred,false));
