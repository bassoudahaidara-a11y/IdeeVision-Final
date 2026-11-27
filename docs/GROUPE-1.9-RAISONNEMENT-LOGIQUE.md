# Groupe 1.9 — Représentation du raisonnement logique

## Objectif
Construire une représentation symbolique locale de conditions et de propositions. Le moteur décrit les relations logiques exprimées dans le français sans attribuer de valeur vraie/fausse aux faits et sans inventer de loi scientifique.

## Les 20 éléments de travail
1. Vérifier l'identité exacte de la source grammaticale.
2. Représenter les propositions comme des atomes candidats.
3. Normaliser les formulations pour comparer prudemment des propositions.
4. Préserver la phrase originale de chaque proposition.
5. Reconnaître les structures « si …, alors … ».
6. Reconnaître « à condition que » en position initiale.
7. Reconnaître « … à condition que … » en position finale.
8. Reconnaître « seulement si » et « uniquement si ».
9. Distinguer une condition suffisante candidate d'une condition nécessaire candidate.
10. Représenter les conditions composées avec ET.
11. Représenter les alternatives avec OU.
12. Appliquer une priorité structurale simple à OU puis ET.
13. Repérer les négations linguistiques connues.
14. Conserver la polarité positive ou négative comme candidate.
15. Construire des arbres logiques imbriqués.
16. Repérer les propositions de polarités opposées.
17. Signaler les contradictions possibles sans les déclarer certaines.
18. Repérer les formulations « si et seulement si » comme biconditionnelles candidates.
19. Conserver les preuves textuelles, les phrases et les statuts d'incertitude.
20. Ne jamais inventer les valeurs de vérité ni les conséquences physiques.

## Implémentation
- Module : `app/src/main/assets/understanding/logical-reasoner-v1.js`.
- Tests ciblés : `tests/logical-reasoner-v1.test.js` (36 tests).
- Intégration : `representation.logicalReasoning`, `stages.logicalReasoning` et contexte JSON du pipeline.
- Chargement local dans `index.html`, avant le pipeline.
- Validation globale : [workflow 45977060459](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45977060459) — 672 tests réussis, 0 échec.

## Limites connues
- Il s'agit d'une représentation symbolique initiale, pas encore d'un moteur complet de démonstration formelle.
- Les formulations françaises reconnues sont limitées.
- Les propositions peuvent être ambiguës et les négations complexes sont encore imparfaites.
- Une contradiction apparente peut dépendre du temps, du contexte ou du sens des mots.
- Les liens nécessaires/suffisants restent des interprétations linguistiques candidates.
- Aucune valeur de vérité n'est calculée à partir d'informations inconnues.
- Aucune loi physique n'est déduite.
- Aucun APK n'a été compilé.
