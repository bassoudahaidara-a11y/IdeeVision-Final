# Groupe 1.28 — Résolution contrôlée des systèmes d'équations non linéaires

## Objectif
Étendre le résolveur d'équations à un premier sous-ensemble de systèmes non linéaires, sans prétendre résoudre toutes les formes possibles. Le périmètre retenu est un système de deux équations à deux inconnues : une équation linéaire et une équation quadratique.

## Capacités implémentées
- Détection de deux équations et de deux inconnues.
- Analyse des expressions polynomiales à partir de l'AST mathématique local.
- Prise en charge des additions, soustractions, signes, parenthèses et multiplications implicites.
- Prise en charge des coefficients numériques décimaux et des fractions à dénominateur numérique non nul.
- Reconnaissance des équations de degré total au plus deux.
- Vérification qu'une équation est linéaire et l'autre quadratique.
- Choix automatique de la variable isolable dans l'équation linéaire.
- Substitution de cette variable dans l'équation quadratique.
- Réduction en une équation polynomiale d'une variable de degré au plus deux.
- Résolution du cas linéaire après substitution.
- Calcul du discriminant et des racines réelles du cas quadratique.
- Détection d'une solution unique, de deux solutions réelles, de l'absence de racine réelle et de l'incompatibilité constante.
- Détection d'une infinité de solutions lorsque l'équation quadratique s'annule sur toute la contrainte linéaire.
- Reconstruction des deux inconnues pour chaque candidate.
- Vérification numérique de chaque candidate dans les deux équations d'origine.
- Conservation des équations sources, des coefficients réduits, de la substitution et des preuves de vérification.
- Intégration dans le pipeline, les diagnostics et le contexte JSON.
- Fonctionnement hors ligne, sans `eval` et sans IA externe.

## Exemple
Système :
`x² + y = 5`
`x + y = 3`

La deuxième équation donne `y = 3 - x`. En remplaçant dans la première :
`x² - x - 2 = 0`.

Le moteur trouve et vérifie les deux solutions :
- `x = -1, y = 4`
- `x = 2, y = 1`

## Limites connues
- Deux équations et deux inconnues uniquement.
- Une équation doit être linéaire et l'autre quadratique.
- Les systèmes avec deux équations quadratiques ne sont pas encore résolus.
- Le degré total des expressions ne doit pas dépasser deux.
- Les racines complexes ne sont pas calculées.
- Les dénominateurs variables, fonctions non polynomiales et symboles d'unités ambigus sont refusés.
- Les systèmes linéaires sont laissés au résolveur linéaire existant.
- Une infinité de solutions est signalée lorsque la substitution produit l'identité, mais le lieu géométrique n'est pas paramétré au-delà de la contrainte linéaire.

## Tests
- 60 tests ciblés dans `tests/nonlinear-system-solver-v1.test.js`.
- 6 tests d'intégration dans `tests/understanding-pipeline-v1.test.js`.
- Validation CI en attente.
- APK non compilé.
