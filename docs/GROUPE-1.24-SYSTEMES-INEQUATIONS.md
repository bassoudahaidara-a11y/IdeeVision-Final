# Groupe 1.24 — Systèmes d'inéquations et combinaison de contraintes

## Objectif
Combiner plusieurs inéquations déjà analysables sans confondre conjonction, disjonction ou variables différentes.

## Capacités
- Contraintes séparées par retours à la ligne ou points-virgules.
- Connecteurs français : « et », « et aussi », « simultanément » et « ou ».
- Réutilisation du solveur individuel linéaire/quadratique.
- Intersection des ensembles solutions pour une conjonction.
- Union des ensembles solutions pour une disjonction homogène.
- Bornes ouvertes et fermées, points isolés, intervalles disjoints.
- Détection de l'ensemble vide et de l'ensemble des réels.
- Conservation des inéquations sources, de leur ordre et des variables.
- Intégration au pipeline et au contexte JSON.

## Règles de prudence
- Un système doit porter sur une seule variable commune.
- Les variables différentes ne sont pas fusionnées artificiellement.
- Les connecteurs « et » et « ou » mélangés sans parenthèses explicites sont refusés.
- Une contrainte individuelle non prise en charge rend le système non résolu.
- Les parenthèses logiques de regroupement, les dénominateurs polynomiaux, les racines complexes et les degrés supérieurs à deux ne sont pas couverts.
- Aucun moteur d'IA externe ni `eval` n'est utilisé.

## Vérification
Les tests couvrent les intersections et unions, les extrémités strictes/non strictes, les cas vides, les points isolés, les contraintes quadratiques, les variables différentes et l'intégration du pipeline. Validation CI réussie : [workflow 46006235547](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/46006235547) — 1 508 tests globaux réussis, 0 échec ; 102 tests ciblés du moteur et 7 tests d'intégration du pipeline.
