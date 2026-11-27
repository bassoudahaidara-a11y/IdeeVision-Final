# Groupe 1.20 — Calcul numérique et évaluation mathématique

## Livrables
- Moteur : \`app/src/main/assets/understanding/numeric-math-engine-v1.js\`.
- Tests ciblés : \`tests/numeric-math-engine-v1.test.js\` (60 tests).
- Intégration : \`representation.numericMath\`, \`stages.numericMath\` et contexte JSON du pipeline.
- Chargement local après le parseur mathématique dans \`index.html\`.

## Capacités implémentées
1. Addition, soustraction, multiplication et division.
2. Priorité des opérations et parenthèses imbriquées.
3. Nombres décimaux à point ou virgule.
4. Nombres négatifs, puissances et exposants négatifs.
5. Multiplication implicite simple.
6. Fractions représentées par la division.
7. Racines carrées avec symbole ou fonction.
8. Constantes pi, e et nombre d'or.
9. Fonctions trigonométriques usuelles (en radians).
10. Fonctions logarithmiques, exponentielles et valeur absolue.
11. Substitution de variables uniquement quand une valeur numérique est fournie explicitement.
12. Réglage et bornage de la précision numérique.
13. Contrôle de division par zéro, racines négatives, domaines logarithmiques et résultats non finis.
14. Conservation de l'AST, de la source et des variables fournies.
15. Diagnostics explicites pour les symboles inconnus et opérations non prises en charge.

## Politique de calcul
- Aucun \`eval\`, \`Function\` ou exécution de code arbitraire : l'évaluation parcourt l'arbre syntaxique reconnu.
- Les expressions seules sont calculées automatiquement dans le pipeline ; une phrase ordinaire n'est pas interprétée comme une formule.
- Les variables inconnues restent non évaluées.
- Les équations et inégalités ne sont pas résolues.
- Aucune conversion d'unité, opération vectorielle/matricielle ou simplification symbolique générale n'est effectuée.
- Les fonctions trigonométriques utilisent les radians.

## Vérification
60 tests ciblés et 6 tests d'intégration pipeline. GitHub Actions vérifie la syntaxe JavaScript et exécute l'ensemble des tests. Aucun APK n'est compilé pendant l'étape 1.
