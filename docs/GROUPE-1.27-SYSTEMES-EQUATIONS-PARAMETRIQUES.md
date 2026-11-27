# Groupe 1.27 — Résolution des systèmes d'équations avec paramètres

## Objectif
Étudier un système linéaire de deux équations et deux inconnues selon les valeurs d'un paramètre. Déterminer les intervalles où le système possède une solution unique, puis examiner séparément les valeurs critiques où le déterminant s'annule.

## Capacités implémentées
- Reconnaissance de deux équations séparées par des lignes ou des points-virgules.
- Déclaration explicite du paramètre, par exemple `paramètre a :`.
- Identification de deux inconnues distinctes.
- Extraction des coefficients de chaque inconnue.
- Prise en charge des coefficients affines en un paramètre.
- Prise en charge des produits coefficient-paramètre avec une inconnue.
- Prise en charge des parenthèses et des signes unaires.
- Prise en charge des fractions à dénominateur numérique non nul.
- Refus des produits entre inconnues et des termes quadratiques en inconnues.
- Construction de la matrice des coefficients.
- Calcul du déterminant comme polynôme de degré au plus deux en paramètre.
- Recherche des racines réelles du déterminant.
- Découpage de la droite des paramètres en intervalles et points critiques.
- Détermination des intervalles où la solution est unique.
- Construction des formules de Cramer pour les deux inconnues.
- Analyse du rang aux valeurs critiques.
- Détection des systèmes incompatibles aux valeurs singulières.
- Détection des systèmes ayant une infinité de solutions aux valeurs singulières.
- Détection d'un déterminant identiquement nul.
- Substitution facultative d'une valeur numérique du paramètre.
- Conservation des équations sources, des coefficients et des résultats structurés.
- Intégration au pipeline de compréhension et au contexte JSON.
- Fonctionnement local sans `eval` ni IA externe.

## Exemple
Pour le système :
`a*x + y = 2`
`x + a*y = 2`

Le déterminant vaut `a² - 1`. Les valeurs critiques sont donc `a = -1` et `a = 1`.
- Si `a < -1`, `-1 < a < 1` ou `a > 1`, le système a une solution unique.
- Si `a = -1`, le système est incompatible.
- Si `a = 1`, le système possède une infinité de solutions.

## Limites connues
- Systèmes carrés 2×2 uniquement.
- Un seul paramètre déclaré.
- Coefficients au plus affines en paramètre.
- Pas de systèmes 3×3, de plusieurs paramètres ou de termes non linéaires en inconnues.
- Les symboles ambigus doivent être déclarés explicitement.
- Un déterminant identiquement nul est signalé comme singularité permanente, sans prétendre résoudre tous les sous-cas.
- Les systèmes singuliers sont classés aux valeurs critiques par leur rang et leur compatibilité.
- Aucun moteur externe, aucun accès Internet, aucun `eval`.

## Tests
- 60 tests ciblés dans `tests/parametric-equation-system-solver-v1.test.js`.
- 6 tests d'intégration dans `tests/understanding-pipeline-v1.test.js`.
- Validation CI réussie : [workflow 46009375449](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/46009375449) — 1 753 tests globaux réussis, 0 échec ; 60 tests ciblés et 6 tests d'intégration pipeline.
- APK non compilé.
