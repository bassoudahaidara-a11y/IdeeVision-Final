# Groupe 1.26 — Résolution des inéquations avec paramètres

## Objectif
Étudier une inéquation selon les différentes valeurs d'un paramètre, distinguer les cas où le coefficient de la variable est positif, négatif ou nul, puis résoudre après substitution d'une valeur numérique.

## Capacités implémentées
- Identification explicite d'une variable et d'un paramètre.
- Analyse des inéquations affines en la variable.
- Coefficients pouvant être affines en un paramètre.
- Développement contrôlé des produits affines comme `(a+1)(x+2)`.
- Recherche des valeurs critiques du paramètre.
- Découpage des valeurs du paramètre en intervalles et points critiques.
- Étude séparée des cas paramètre négatif, nul et positif.
- Traitement du cas où le coefficient de la variable s'annule.
- Production de bornes symboliques dépendant du paramètre.
- Gestion des opérateurs stricts, larges et différent de.
- Substitution facultative d'une valeur numérique du paramètre.
- Calcul de la solution numérique après substitution.
- Gestion des ensembles vides et de tous les réels.
- Refus explicite des expressions non affines ou de plusieurs paramètres non déclarés.
- Intégration au pipeline, au contexte JSON et au chargement de l'application.

## Déclaration
Exemple pris en charge dans le pipeline :
`paramètre a : a*x + 2 > 0`

Pour les appels directs, le moteur accepte également des options indiquant explicitement la variable et le paramètre, ou une valeur numérique à substituer.

## Limites
- Une variable et un paramètre par inéquation.
- Degré au plus un en chaque symbole ; les termes en `x²` sont refusés.
- Les dénominateurs dépendant du paramètre ne sont pas pris en charge.
- Les fonctions, racines symboliques et systèmes paramétriques conjoints ne sont pas pris en charge.
- Les symboles ambigus doivent être déclarés comme paramètres.
- Les bornes paramétriques restent des expressions symboliques, pas des nombres fixes.
- Aucun `eval`, aucune IA externe, aucun service Internet.

## Tests
- 60 tests ciblés couvrant les signes, les cas nuls, les bornes, les valeurs critiques, les substitutions, les limites et la sérialisation.
- 6 tests d'intégration pipeline.
- Validation CI réussie : [workflow 46008384703](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/46008384703) — 1 687 tests globaux réussis, 0 échec ; 64 tests ciblés et 6 tests d'intégration pipeline.
- APK non compilé.
