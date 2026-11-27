# Groupe 1.16 — Compréhension des expressions mathématiques

## Livrable
- Module : \`app/src/main/assets/understanding/math-expression-model-v1.js\`
- Tests ciblés : \`tests/math-expression-model-v1.test.js\` (45 tests)
- Intégration : \`representation.mathExpressions\`, \`stages.mathExpressions\` et contexte JSON du pipeline.

## Capacités implémentées
1. Conservation de l'expression source et de ses positions.
2. Tokenisation des nombres entiers, décimaux et notations scientifiques.
3. Reconnaissance des variables latines et grecques.
4. Reconnaissance des constantes usuelles \`π\`, \`e\`, \`φ\`.
5. Repérage prudent de symboles pouvant représenter des unités.
6. Opérateurs d'addition, soustraction, multiplication et division.
7. Opérateurs Unicode \`×\`, \`·\`, \`÷\`.
8. Priorités opératoires.
9. Puissances avec associativité à droite.
10. Parenthèses, crochets et accolades.
11. Opérateurs unaires positif et négatif.
12. Multiplication implicite, par exemple \`2x\` et \`3(x+1)\`.
13. Représentation des divisions comme fractions symboliques.
14. Racines carrées Unicode et fonctionnelles.
15. Appels de fonctions et arguments multiples.
16. Reconnaissance lexicale de fonctions usuelles.
17. Distinction expression, équation et inégalité.
18. Comparateurs ASCII et Unicode.
19. Arbre syntaxique abstrait (AST).
20. Inventaire des variables, constantes, fonctions et candidats d'unités.
21. Positions de début et de fin des nœuds.
22. Signalement des caractères non pris en charge.
23. Signalement des parenthèses ou appels non fermés.
24. Conservation des symboles inconnus.
25. Sortie JSON sérialisable.
26. Module déterministe, local et sans réseau.
27. Tests de priorité, groupes et associativité.
28. Tests de notation scientifique et décimale.
29. Tests de formules de mécanique simples.
30. Intégration dans le pipeline sans déduction physique.

## Limites
Ce module construit une représentation symbolique candidate : il ne calcule pas, ne simplifie pas et ne résout pas les équations. Les notations LaTeX complexes, les systèmes de plusieurs équations, les dérivées/intégrales et la grammaire complète des unités ne sont pas encore pris en charge. Un symbole comme \`m\` peut être une variable ou une unité selon le contexte ; le moteur le signale comme ambigu. Les fonctions reconnues ne sont pas exécutées.

## Vérification
La validation globale est effectuée par GitHub Actions : vérification syntaxique JavaScript et suite complète de tests Node. Aucun APK n'est compilé pendant l'étape 1.
