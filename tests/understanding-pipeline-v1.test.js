"use strict";
const test=require("node:test");const assert=require("node:assert/strict");
const F=require("../app/src/main/assets/understanding/french-language-foundation-v1.js");
const G=require("../app/src/main/assets/understanding/french-grammar-semantics-v1.js");
const I=require("../app/src/main/assets/understanding/intent-understanding-v1.js");
const O=require("../app/src/main/assets/understanding/object-model-v1.js");
const A=require("../app/src/main/assets/understanding/action-model-v1.js");
const R=require("../app/src/main/assets/understanding/relation-graph-v1.js");
const Q=require("../app/src/main/assets/understanding/reference-resolver-v1.js");
const C=require("../app/src/main/assets/understanding/complex-clause-analyzer-v1.js");
const L=require("../app/src/main/assets/understanding/logical-reasoner-v1.js");
const M=require("../app/src/main/assets/understanding/reasoning-chain-engine-v1.js");
const K=require("../app/src/main/assets/understanding/knowledge-registry-v1.js");
const E=require("../app/src/main/assets/understanding/evidence-trace-v1.js");
const T=require("../app/src/main/assets/understanding/time-model-v1.js");
const S=require("../app/src/main/assets/understanding/spatial-model-v1.js");
const U=require("../app/src/main/assets/understanding/quantity-model-v1.js");
const MathModel=require("../app/src/main/assets/understanding/math-expression-model-v1.js");
const Algebraic=require("../app/src/main/assets/understanding/algebraic-structures-v1.js");
const VectorMatrix=require("../app/src/main/assets/understanding/vector-matrix-model-v1.js");
const FunctionModel=require("../app/src/main/assets/understanding/function-model-v1.js");
const NumericMath=require("../app/src/main/assets/understanding/numeric-math-engine-v1.js");
const SymbolicAlgebra=require("../app/src/main/assets/understanding/symbolic-algebra-engine-v1.js");
const EquationSolver=require("../app/src/main/assets/understanding/equation-solver-v1.js");
const InequalitySolver=require("../app/src/main/assets/understanding/inequality-solver-v1.js");
const InequalitySystemSolver=require("../app/src/main/assets/understanding/inequality-system-solver-v1.js");
const RationalInequalitySolver=require("../app/src/main/assets/understanding/rational-inequality-solver-v1.js");
const ParametricInequalitySolver=require("../app/src/main/assets/understanding/parametric-inequality-solver-v1.js");
const ParametricEquationSystemSolver=require("../app/src/main/assets/understanding/parametric-equation-system-solver-v1.js");
const NonlinearSystemSolver=require("../app/src/main/assets/understanding/nonlinear-system-solver-v1.js");
const PolynomialResultant=require("../app/src/main/assets/understanding/polynomial-resultant-engine-v1.js");
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

test("41 pipeline expose les propositions complexes",()=>assert.ok(P.analyze("Si le moteur tourne, la roue avance.").representation.complexClauses.clauses.length>=2));
test("42 pipeline expose les liens entre propositions",()=>assert.ok(P.analyze("Le moteur tourne pendant que la roue avance.").representation.complexClauses.links.length>0));
test("43 étape complexe comptabilisée",()=>assert.ok(P.analyze("Si le moteur tourne, la roue avance.").stages.complexClauses.clauseCount>=2));
test("44 contexte JSON contient l'analyse complexe",()=>assert.ok(JSON.parse(P.analyze("Si le moteur tourne, la roue avance.").promptContext).complexClauses.clauses.length>=2));
test("45 analyse complexe ne déduit aucune physique",()=>assert.equal(P.analyze("Parce que le moteur tourne, la roue avance.").representation.complexClauses.policy.physicalConsequencesInferred,false));

test("46 pipeline expose le raisonnement logique",()=>assert.ok(P.analyze("Si le moteur tourne, la roue avance.").representation.logicalReasoning.rules.length));
test("47 pipeline expose les conditions combinées",()=>assert.equal(P.analyze("Si la batterie est chargée et le moteur tourne, le robot avance.").representation.logicalReasoning.rules[0].condition.operator,"AND"));
test("48 pipeline expose les contradictions possibles",()=>assert.ok(P.analyze("Le moteur tourne. Le moteur ne tourne pas.").representation.logicalReasoning.contradictions.length));
test("49 étape logique comptabilisée",()=>assert.ok(P.analyze("Si le moteur tourne, la roue avance.").stages.logicalReasoning.ruleCount>0));
test("50 contexte JSON contient le raisonnement logique",()=>assert.ok(JSON.parse(P.analyze("Si le moteur tourne, la roue avance.").promptContext).logicalReasoning.rules.length));
test("51 moteur logique ne déduit aucune physique",()=>assert.equal(P.analyze("Si le moteur tourne, la roue avance.").representation.logicalReasoning.policy.physicalLawsInferred,false));

test("52 pipeline expose les chaînes de raisonnement",()=>assert.ok(P.analyze("Si la batterie est chargée, le moteur reçoit énergie. Si le moteur reçoit énergie, le moteur tourne.").representation.reasoningChains.chains.length));
test("53 pipeline expose les dépendances",()=>assert.ok(P.analyze("Si la batterie est chargée, le moteur reçoit énergie. Si le moteur reçoit énergie, le moteur tourne.").stages.reasoningChains.linkCount>0));
test("54 pipeline expose la longueur maximale",()=>assert.ok(P.analyze("Si la batterie est chargée, le moteur reçoit énergie. Si le moteur reçoit énergie, le moteur tourne.").stages.reasoningChains.longestChain>=2));
test("55 contexte JSON contient les chaînes",()=>assert.ok(JSON.parse(P.analyze("Si la batterie est chargée, le moteur reçoit énergie. Si le moteur reçoit énergie, le moteur tourne.").promptContext).reasoningChains.chains.length));
test("56 pipeline ne transforme pas les conclusions en certitudes",()=>assert.equal(P.analyze("Si A, B. Si B, C.").representation.reasoningChains.policy.derivedClaimsRemainCandidates,true));

test("57 pipeline intègre le registre de connaissances",()=>assert.equal(P.analyze("Le moteur tourne.").representation.knowledgeRegistry.ready,true));
test("58 étape du registre comptabilisée",()=>assert.ok(P.analyze("Supposons que le moteur tourne.").stages.knowledgeRegistry.assumptionCount>0));
test("59 contexte JSON contient le registre",()=>assert.ok(JSON.parse(P.analyze("La masse reste inconnue.").promptContext).knowledgeRegistry.unknowns.length));
test("60 le pipeline ne certifie pas les affirmations",()=>assert.equal(P.analyze("Le moteur tourne.").representation.knowledgeRegistry.policy.textualClaimsAreNotVerifiedFacts,true));
test("61 pipeline intègre la traçabilité des preuves",()=>assert.equal(P.analyze("Le moteur tourne.").representation.evidenceTrace.ready,true));
test("62 étape de traçabilité comptabilisée",()=>assert.ok(P.analyze("Le moteur tourne.").stages.evidenceTrace.recordCount>0));
test("63 contexte JSON contient les traces",()=>assert.ok(JSON.parse(P.analyze("Le moteur tourne.").promptContext).evidenceTrace.records.length>0));
test("64 les traces ne prétendent pas vérifier les faits",()=>assert.equal(P.analyze("Le moteur tourne.").representation.evidenceTrace.policy.textualEvidenceIsNotExternalProof,true));

test("65 pipeline intègre le modèle temporel",()=>assert.equal(P.analyze("La balle tombe demain.").representation.timeModel.ready,true));
test("66 étape temporelle comptabilisée",()=>assert.ok(P.analyze("Le test aura lieu demain à 14h.").stages.timeModel.markerCount>0));
test("67 contexte JSON contient les événements temporels",()=>assert.ok(JSON.parse(P.analyze("La balle tombe demain.").promptContext).timeModel.events.length>0));
test("68 aucune chronologie réelle n'est affirmée",()=>assert.equal(P.analyze("La balle tombe demain.").representation.timeModel.policy.textualOrderIsNotProofOfRealExecution,true));


test("69 pipeline intègre le modèle spatial",()=>assert.equal(P.analyze("La balle est dans le tube.").representation.spatialModel.ready,true));
test("70 étape spatiale comptabilisée",()=>assert.ok(P.analyze("La balle est à gauche du tube.").stages.spatialModel.relationCount>0));
test("71 contexte JSON contient les relations spatiales",()=>assert.ok(JSON.parse(P.analyze("La balle est dans le tube.").promptContext).spatialModel.relations.length>0));
test("72 les coordonnées ne reçoivent pas de repère inventé",()=>assert.equal(P.analyze("Position x=2, y=3, z=4.").representation.spatialModel.policy.coordinateFrameMustBeExplicit,true));

test("73 pipeline intègre le modèle des quantités",()=>assert.equal(P.analyze("Le tube mesure 20 cm.").representation.quantityModel.ready,true));
test("74 étape des quantités comptabilisée",()=>assert.ok(P.analyze("La masse est entre 5 et 10 kg.").stages.quantityModel.rangeCount>0));
test("75 contexte JSON contient les mesures",()=>assert.ok(JSON.parse(P.analyze("Le tube mesure 20 cm.").promptContext).quantityModel.quantities.length>0));
test("76 aucune conversion automatique",()=>assert.equal(P.analyze("La longueur est 100 cm.").representation.quantityModel.policy.unitConversionsPerformed,false));


test("85 pipeline intègre le modèle mathématique symbolique",()=>assert.equal(P.analyze("F = m × a").representation.mathExpressions.kind,"equation"));
test("86 modèle mathématique exposé comme étape",()=>assert.ok(P.analyze("x + 2 = 5").stages.mathExpressions.expressionCount>0));
test("87 le contexte JSON contient les AST mathématiques",()=>assert.equal(JSON.parse(P.analyze("v = d/t").promptContext).mathExpressions.kind,"equation"));
test("88 aucune équation n'est résolue automatiquement",()=>assert.equal(P.analyze("x + 2 = 5").representation.mathExpressions.policy.solved,false));

test("89 pipeline expose les structures algébriques",()=>assert.equal(P.analyze("x+y=5\nx-y=1").representation.algebraicStructures.classification,"system_candidate"));
test("90 étape système visible",()=>assert.equal(P.analyze("x=1\ny=2").stages.algebraicStructures.equationCount,2));
test("91 contexte JSON contient les systèmes",()=>assert.equal(JSON.parse(P.analyze("x=1\ny=2").promptContext).algebraicStructures.system.equationCount,2));
test("92 aucune résolution de système dans le pipeline",()=>assert.equal(P.analyze("x=1\ny=2").representation.algebraicStructures.policy.systemsSolved,false));

test("93 pipeline expose le modèle des vecteurs et matrices",()=>assert.equal(P.analyze("v=(1,2,3)").representation.vectorMatrixModel.vectors[0].dimension,3));
test("94 pipeline expose les dimensions matricielles",()=>assert.deepEqual(P.analyze("A=[[1,2],[3,4]]").representation.vectorMatrixModel.matrices[0].dimensions,[2,2]));
test("95 étape vecteurs-matrices comptabilisée",()=>assert.equal(P.analyze("A=[[1,2],[3,4]]").stages.vectorMatrixModel.matrixCount,1));
test("96 contexte JSON contient le modèle vecteurs-matrices",()=>assert.equal(JSON.parse(P.analyze("v=(1,2)").promptContext).vectorMatrixModel.vectors[0].name,"v"));
test("97 pipeline conserve les opérations symboliques candidates",()=>assert.ok(P.analyze("u · v").representation.vectorMatrixModel.operations.some(x=>x.type==="dot_product")));
test("98 aucune opération matricielle n'est calculée",()=>assert.equal(P.analyze("A=[[1,2],[3,4]]").representation.vectorMatrixModel.policy.computed,false));


test("99 pipeline expose les définitions de fonctions",()=>assert.equal(P.analyze("f(x)=x+1").representation.functionModel.functions[0].name,"f"));
test("100 pipeline expose les domaines",()=>assert.ok(P.analyze("D_f=R").representation.functionModel.domains.length));
test("101 pipeline expose les ensembles images",()=>assert.ok(P.analyze("Im(f)=R").stages.functionModel.imageCount>0));
test("102 pipeline expose les compositions",()=>assert.ok(P.analyze("f ∘ g").representation.functionModel.compositions.length));
test("103 pipeline expose les variations",()=>assert.ok(P.analyze("f est croissante sur [0;2]").stages.functionModel.variationCount>0));
test("104 pipeline expose les limites et continuité",()=>{const r=P.analyze("lim x→0 f(x)\nf est continue en 0");assert.ok(r.representation.functionModel.limits.length);assert.ok(r.representation.functionModel.continuity.length);});
test("105 contexte JSON contient le modèle des fonctions",()=>assert.ok(JSON.parse(P.analyze("f(x)=x^2").promptContext).functionModel.functions.length));
test("106 aucune fonction n'est évaluée par le pipeline",()=>assert.equal(P.analyze("f(x)=x+1").representation.functionModel.policy.evaluated,false));


test("107 pipeline intègre le moteur de calcul numérique",()=>assert.equal(P.analyze("2+3").representation.numericMath.result,5));
test("108 pipeline expose le résultat numérique dans les étapes",()=>assert.equal(P.analyze("(2+3)*4").stages.numericMath.result,20));
test("109 pipeline refuse de résoudre une équation",()=>assert.equal(P.analyze("x+2=5").representation.numericMath.evaluated,false));
test("110 pipeline garde les variables non définies",()=>assert.ok(P.analyze("x+2").representation.numericMath.issues.some(x=>x.code==="unknown_variable")));
test("111 pipeline ignore le calcul automatique d'une phrase",()=>assert.equal(P.analyze("La balle tombe.").representation.numericMath.evaluated,false));
test("112 contexte JSON contient le résultat de calcul",()=>assert.equal(JSON.parse(P.analyze("3^2").promptContext).numericMath.result,9));


test("113 pipeline intègre la simplification symbolique",()=>assert.equal(P.analyze("x+x").representation.symbolicAlgebra.simplifiedExpression,"2 * x"));
test("114 pipeline expose les transformations dans les étapes",()=>assert.ok(P.analyze("(x+1)^2").stages.symbolicAlgebra.steps>0));
test("115 pipeline développe les identités polynomiales",()=>assert.equal(P.analyze("(x+1)^2").representation.symbolicAlgebra.polynomial.length,3));
test("116 pipeline conserve les équations sans les résoudre",()=>assert.equal(P.analyze("x+1=2").representation.symbolicAlgebra.issues[0].code,"relation_not_transformed"));
test("117 pipeline conserve les phrases ordinaires",()=>assert.equal(P.analyze("La balle tombe.").representation.symbolicAlgebra.simplified,false));
test("118 contexte JSON contient le résultat symbolique",()=>assert.equal(JSON.parse(P.analyze("x+x").promptContext).symbolicAlgebra.simplifiedExpression,"2 * x"));

test("119 pipeline intègre la résolution",()=>assert.equal(P.analyze("2x+3=7").representation.equationSolver.solutions[0],2));
test("120 étape quadratique exposée",()=>assert.equal(P.analyze("x^2-1=0").stages.equationSolver.status,"two_real_solutions"));
test("121 contexte JSON contient le résolveur",()=>assert.equal(JSON.parse(P.analyze("x+1=2").promptContext).equationSolver.solutions[0],1));
test("122 phrase ordinaire non résolue",()=>assert.equal(P.analyze("La balle tombe.").representation.equationSolver.status,"no_equation_detected"));

test("123 pipeline intègre la résolution des inéquations",()=>assert.equal(P.analyze("x>2").representation.inequalitySolver.intervals[0].lower,2));
test("124 étape des inéquations exposée",()=>assert.equal(P.analyze("x^2-4<=0").stages.inequalitySolver.status,"solution_set"));
test("125 contexte JSON contient le résolveur d’inéquations",()=>assert.equal(JSON.parse(P.analyze("x>=3").promptContext).inequalitySolver.intervals[0].lower,3));
test("126 phrase ordinaire non interprétée comme inéquation",()=>assert.equal(P.analyze("La balle tombe.").representation.inequalitySolver.status,"no_inequality_detected"));

test("127 pipeline intègre les systèmes d'inéquations",()=>assert.equal(P.analyze("x>1 et x<5").representation.inequalitySystemSolver.intervals[0].lower,1));
test("128 étape système d'inéquations comptabilisée",()=>assert.equal(P.analyze("x>=1 et x<=5").stages.inequalitySystemSolver.intervalCount,1));
test("129 contexte JSON contient les systèmes d'inéquations",()=>assert.equal(JSON.parse(P.analyze("x>1 et x<5").promptContext).inequalitySystemSolver.intervals[0].upper,5));
test("130 pipeline expose l'intersection vide",()=>assert.equal(P.analyze("x>5 et x<1").representation.inequalitySystemSolver.status,"empty_set"));
test("131 pipeline expose la disjonction comme union",()=>assert.equal(P.analyze("x<0 ou x>2").representation.inequalitySystemSolver.intervals.length,2));
test("132 pipeline conserve les inégalités d'un système",()=>assert.equal(P.analyze("x>1 et x<5").representation.inequalitySystemSolver.inequalities.length,2));
test("133 pipeline ne combine pas des variables différentes",()=>assert.equal(P.analyze("x>1 et y<5").representation.inequalitySystemSolver.status,"multiple_variables_unsupported"));

test("134 pipeline intègre les inéquations rationnelles",()=>assert.equal(P.analyze("(x-1)/(x+2)>0").representation.rationalInequalitySolver.inequalities[0].excludedValues[0],-2));
test("135 étape rationnelle comptabilise les valeurs interdites",()=>assert.equal(P.analyze("1/(x-3)>0").stages.rationalInequalitySolver.excludedValueCount,1));
test("136 contexte JSON contient les solutions rationnelles",()=>assert.equal(JSON.parse(P.analyze("1/x>0").promptContext).rationalInequalitySolver.inequalities[0].intervals[0].lower,0));
test("137 pipeline conserve les racines interdites",()=>assert.deepEqual(P.analyze("(x-1)/(x-1)>0").representation.rationalInequalitySolver.inequalities[0].excludedValues,[1]));
test("138 pipeline distingue les inéquations ordinaires sans dénominateur",()=>assert.equal(P.analyze("x>2").representation.rationalInequalitySolver.inequalities[0].status,"solution_set"));
test("139 phrase ordinaire non interprétée comme inéquation rationnelle",()=>assert.equal(P.analyze("La balle tombe.").representation.rationalInequalitySolver.status,"no_inequality_detected"));

test("140 pipeline intègre l'étude paramétrique déclarée",()=>assert.equal(P.analyze("paramètre a : a*x+2>0").representation.parametricInequalitySolver.status,"parameter_cases"));
test("141 pipeline expose les trois cas du coefficient",()=>assert.equal(P.analyze("paramètre a : a*x+2>0").representation.parametricInequalitySolver.cases.length,3));
test("142 étape paramétrique comptabilisée",()=>assert.equal(P.analyze("paramètre a : a*x+2>0").stages.parametricInequalitySolver.caseCount,3));
test("143 contexte JSON contient les cas paramétriques",()=>assert.equal(JSON.parse(P.analyze("paramètre a : a*x+2>0").promptContext).parametricInequalitySolver.cases.length,3));
test("144 phrase ordinaire non interprétée comme inéquation paramétrique",()=>assert.equal(P.analyze("La balle tombe.").representation.parametricInequalitySolver.status,"no_parameterized_inequality_detected"));
test("145 paramètre non déclaré explicitement reste ambigu",()=>assert.equal(P.analyze("a*x+2>0").representation.parametricInequalitySolver.status,"parameter_declaration_required"));

test("146 pipeline intègre les systèmes d'équations paramétriques",()=>assert.equal(P.analyze("paramètre a : a*x+y=2\nx+a*y=2").representation.parametricEquationSystemSolver.status,"parameter_cases"));
test("147 pipeline expose les valeurs critiques du déterminant",()=>assert.deepEqual(P.analyze("paramètre a : a*x+y=2\nx+a*y=2").representation.parametricEquationSystemSolver.criticalParameterValues,[-1,1]));
test("148 étape du système paramétrique comptabilisée",()=>assert.equal(P.analyze("paramètre a : a*x+y=2\nx+a*y=2").stages.parametricEquationSystemSolver.caseCount,5));
test("149 contexte JSON contient les formules de Cramer",()=>assert.equal(JSON.parse(P.analyze("paramètre a : a*x+y=2\nx+a*y=2").promptContext).parametricEquationSystemSolver.cramer.x.denominator,"a^2 - 1"));
test("150 pipeline conserve les systèmes singuliers permanents",()=>assert.equal(P.analyze("paramètre a : a*x+y=2\n2*a*x+2*y=5").representation.parametricEquationSystemSolver.status,"singular_for_all_parameters"));
test("151 phrase ordinaire non interprétée comme système paramétrique",()=>assert.equal(P.analyze("La balle tombe.").representation.parametricEquationSystemSolver.status,"no_system_detected"));

test("152 pipeline intègre la résolution non linéaire",()=>assert.equal(P.analyze("x^2+y=5\nx+y=3").representation.nonlinearSystemSolver.status,"two_real_solutions"));
test("153 pipeline expose les solutions vérifiées",()=>assert.equal(P.analyze("x^2+y=5\nx+y=3").representation.nonlinearSystemSolver.solutions.length,2));
test("154 étape non linéaire comptabilisée",()=>assert.equal(P.analyze("x^2+y=5\nx+y=3").stages.nonlinearSystemSolver.solutionCount,2));
test("155 contexte JSON contient les solutions non linéaires",()=>assert.equal(JSON.parse(P.analyze("x^2+y=5\nx+y=3").promptContext).nonlinearSystemSolver.solutions.length,2));
test("156 pipeline conserve le cas sans solution réelle",()=>assert.equal(P.analyze("x^2+y=1\nx+y=3").representation.nonlinearSystemSolver.status,"no_real_solution"));
test("157 phrase ordinaire non interprétée comme système",()=>assert.equal(P.analyze("La balle tombe.").representation.nonlinearSystemSolver.status,"no_system_detected"));

test("158 pipeline reconnaît deux équations quadratiques proportionnelles",()=>assert.equal(P.analyze("x^2+y^2=25\n2*x^2+2*y^2+x-y=50").representation.nonlinearSystemSolver.status,"two_real_solutions"));
test("159 pipeline expose la méthode d'élimination",()=>assert.equal(P.analyze("x^2+y^2=25\n2*x^2+2*y^2+x-y=50").representation.nonlinearSystemSolver.method,"proportional_quadratic_elimination"));
test("160 pipeline expose les deux solutions vérifiées",()=>assert.equal(P.analyze("x^2+y^2=25\n2*x^2+2*y^2+x-y=50").representation.nonlinearSystemSolver.solutions.length,2));
test("161 pipeline conserve le refus des parties non proportionnelles",()=>assert.equal(P.analyze("x^2+y^2=25\n2*x^2-y^2=10").representation.nonlinearSystemSolver.status,"unsupported_system_shape"));
test("162 pipeline signale les équations quadratiques dépendantes",()=>assert.equal(P.analyze("x^2+y^2=25\n2*x^2+2*y^2=50").representation.nonlinearSystemSolver.status,"dependent_equations"));
test("163 contexte JSON expose la méthode quadratique",()=>assert.equal(JSON.parse(P.analyze("x^2+y^2=25\n2*x^2+2*y^2+x-y=50").promptContext).nonlinearSystemSolver.method,"proportional_quadratic_elimination"));

test("164 pipeline intègre le moteur de résultant",()=>assert.equal(P.analyze("x^2+y^2=25\\nx^2-y^2=9").representation.polynomialResultant.status,"resultant_computed_not_solved"));
test("165 étape de résultant expose le degré éliminé",()=>assert.ok(P.analyze("x^2+y^2=25\\nx^2-y^2=9").stages.polynomialResultant.resultantDegree>0));
test("166 contexte JSON contient le résultant",()=>assert.ok(JSON.parse(P.analyze("x^2+y^2=25\\nx^2-y^2=9").promptContext).polynomialResultant.resultant.coefficientsAscending.length>1));
test("167 pipeline refuse les degrés supérieurs au domaine du résultant",()=>assert.equal(P.analyze("x^3+y^2=5\\nx^2-y^2=3").representation.polynomialResultant.status,"unsupported_expression"));
test("168 phrase ordinaire sans résultant",()=>assert.equal(P.analyze("La balle tombe.").representation.polynomialResultant.status,"two_equations_required"));
test("169 le pipeline ne prétend pas avoir résolu le système par résultant",()=>assert.equal(P.analyze("x^2+y^2=25\\nx^2-y^2=9").representation.polynomialResultant.policy.solutionsComputed,false));
