# Groupe 1.21 — Simplification symbolique et transformations algébriques

## Livrables
- Moteur : \`app/src/main/assets/understanding/symbolic-algebra-engine-v1.js\`.
- Tests ciblés : \`tests/symbolic-algebra-engine-v1.test.js\` (65 tests).
- Intégration dans le pipeline : \`representation.symbolicAlgebra\`, \`stages.symbolicAlgebra\`, contexte JSON.
- Chargement local après le parseur mathématique dans \`index.html\`.

## 15 capacités et contrôles
1. Réduction des calculs numériques constants.
2. Suppression des additions et soustractions de zéro.
3. Suppression des facteurs égaux à un.
4. Réduction des produits par zéro.
5. Réduction des puissances zéro et un.
6. Réduction des signes négatifs doubles.
7. Regroupement des termes semblables.
8. Conservation des variables et monômes distincts.
9. Normalisation de l'ordre des variables dans les monômes.
10. Développement par distributivité des produits polynomiaux.
11. Développement de puissances entières positives limitées.
12. Développement des carrés et cubes de binômes.
13. Développement de produits donnant une différence de carrés.
14. Extraction de facteurs monomiaux communs simples.
15. Extraction de facteurs numériques entiers communs.
16. Simplification des fractions à dénominateur numérique constant non nul.
17. Journal des étapes de transformation.
18. Conservation de la source et de l'AST transformé.
19. Limitation du nombre de termes pour contrôler le coût.
20. Refus prudent des expressions non polynomiales ou des transformations non prises en charge.

## Politique et limites
- Le moteur ne résout aucune équation ni inégalité.
- Il ne prétend pas factoriser tout polynôme irréductible.
- Il ne simplifie pas encore les fractions rationnelles avec facteurs symboliques.
- Les fonctions trigonométriques et autres fonctions restent symboliques.
- Les restrictions de domaine doivent être suivies séparément ; par exemple, une simplification de facteurs ne doit pas faire oublier les valeurs interdites de l'expression initiale.
- Développement limité à 256 termes et aux puissances entières de 0 à 8.
- Aucun \`eval\`, aucune exécution de code et aucune dépendance réseau.

## Vérification
65 tests ciblés et 6 tests d'intégration pipeline. Les tests complets GitHub Actions sont en cours. Aucun APK n'est compilé pendant l'étape 1.
