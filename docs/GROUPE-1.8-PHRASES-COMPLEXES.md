# Groupe 1.8 — Compréhension des phrases complexes

## Objectif
Repérer plusieurs propositions dans une phrase et conserver les connecteurs qui expriment une condition, un rapport temporel, une simultanéité, une cause, un but, une concession ou une coordination. Le moteur représente le sens linguistique exprimé sans le transformer en loi physique.

## Les 20 éléments de travail
1. Vérifier que l'analyse grammaticale correspond exactement au texte.
2. Conserver les positions des phrases dans le texte complet.
3. Repérer les propositions contenant des verbes reconnus.
4. Repérer les connecteurs conditionnels « si », « à condition que » et « à moins que ».
5. Repérer les connecteurs temporels « quand » et « lorsque ».
6. Repérer les relations exprimées par « avant que » et « après que ».
7. Repérer « dès que » comme marqueur temporel.
8. Repérer les expressions de simultanéité « pendant que » et « en même temps que ».
9. Repérer « tandis que » et « alors que » comme simultanéité ou contraste possible.
10. Repérer les marqueurs de cause exprimée « parce que », « puisque » et « étant donné que ».
11. Repérer les expressions de but « afin que » et « pour que ».
12. Repérer les concessions « bien que » et « même si ».
13. Séparer les segments de propositions à partir des connecteurs et de la ponctuation.
14. Associer les formes verbales reconnues à chaque proposition.
15. Conserver la négation lorsqu'elle est détectée par la grammaire.
16. Relier les propositions par des liens linguistiques candidats.
17. Repérer la coordination, l'alternative et le contraste.
18. Conserver les positions et les preuves textuelles des connecteurs.
19. Garder les propositions ou les extrémités de liens non reconnues comme incertaines.
20. Interdire toute conclusion physique ou causale non démontrée.

## Implémentation
- Module : `app/src/main/assets/understanding/complex-clause-analyzer-v1.js`.
- Tests ciblés : `tests/complex-clause-analyzer-v1.test.js` (35 tests).
- Intégration : `representation.complexClauses`, `stages.complexClauses` et contexte JSON du pipeline.
- Le module est chargé localement dans `index.html` avant le pipeline.
- Validation globale : 630 tests réussis, 0 échec.

## Limites connues
- Le découpage syntaxique reste heuristique et dépend du vocabulaire verbal reconnu.
- Certains connecteurs ont plusieurs sens selon le contexte.
- Une relation causale exprimée par une phrase n'est pas une preuve scientifique.
- Une condition ne garantit pas son résultat.
- La simultanéité ne prouve pas une causalité.
- Les lois physiques seront traitées dans une étape scientifique distincte.
- Aucun APK n'a été compilé.
