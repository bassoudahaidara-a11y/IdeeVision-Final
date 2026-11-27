# Groupe 1.18 — Vecteurs, matrices et opérations matricielles

## Livrables
- Module : \`app/src/main/assets/understanding/vector-matrix-model-v1.js\`.
- Tests ciblés : \`tests/vector-matrix-model-v1.test.js\` (52 tests).
- Intégration : \`representation.vectorMatrixModel\`, \`stages.vectorMatrixModel\` et contexte JSON du pipeline.
- Chargement local dans \`index.html\`.

## Capacités représentées
1. Reconnaître des vecteurs écrits avec des composantes entre parenthèses ou crochets.
2. Conserver les noms, composantes, dimensions et positions dans la source.
3. Préserver les composantes numériques, symboliques et expressions non évaluées.
4. Reconnaître des matrices écrites par lignes et colonnes.
5. Conserver le nombre de lignes, le nombre de colonnes et les entrées.
6. Signaler les matrices candidates dont les lignes n'ont pas la même longueur.
7. Repérer plusieurs vecteurs et matrices dans un texte à plusieurs lignes.
8. Reconnaître des opérations candidates : addition, soustraction, multiplication scalaire et matricielle.
9. Repérer les produits scalaire et vectoriel.
10. Repérer la transposée, la norme, le déterminant et l'inverse comme opérations symboliques.
11. Conserver les équations vectorielles et matricielles candidates.
12. Fournir des métriques, preuves textuelles et diagnostics sérialisables.

## Limites
Ce groupe construit une représentation syntaxique prudente. Il ne calcule aucune opération, ne vérifie pas la compatibilité des dimensions, ne calcule ni déterminant ni inverse, et ne résout aucun système matriciel. Les notations entre parenthèses et crochets peuvent être ambiguës dans le langage courant ; les résultats restent donc des candidats. Les opérations lexicalement repérées ne sont pas encore reliées à une vérification mathématique complète.

## Vérification
Les contrôles de syntaxe JavaScript et l'ensemble des tests automatisés sont exécutés par GitHub Actions. Aucun APK n'est compilé pendant l'étape 1.
