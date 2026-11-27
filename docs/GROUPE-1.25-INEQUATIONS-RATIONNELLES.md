# Groupe 1.25 — Inéquations rationnelles et valeurs interdites

## Objectif
Résoudre des inéquations contenant des fractions rationnelles en conservant le domaine de définition et les valeurs interdites.

## Capacités implémentées
- Analyse d'une inéquation avec une variable réelle.
- Représentation d'un membre rationnel sous la forme N(x)/D(x).
- Opérations rationnelles explicites : addition, soustraction, multiplication et division.
- Puissances entières de 0 à 2 dans les expressions prises en charge.
- Passage à une différence entre les deux membres.
- Calcul contrôlé des racines réelles du numérateur et du dénominateur.
- Identification séparée des zéros du numérateur et des zéros du dénominateur.
- Conservation des valeurs interdites même lorsqu'un facteur commun apparaît.
- Découpage de la droite réelle aux points critiques.
- Étude du signe sur chaque intervalle par évaluation d'un point témoin.
- Inclusion des zéros du numérateur selon le caractère strict ou large de l'inégalité.
- Exclusion systématique des zéros du dénominateur.
- Gestion des intervalles ouverts, fermés, non bornés et disjoints.
- Comparaison avec une expression rationnelle présente dans chaque membre.
- Refus explicite des expressions hors domaine pris en charge.
- Résultats sérialisables et diagnostics détaillés.
- Intégration dans le pipeline et le contexte JSON.
- Chargement du module dans l'application.

## Précautions et limites
- Une seule variable par inéquation.
- Numérateur et dénominateur de degré au plus deux après combinaison des expressions.
- Racines réelles seulement.
- Pas d'annulation de facteurs : cela préserve les trous du domaine.
- Les fonctions trigonométriques, exponentielles, logarithmiques et les expressions de degré supérieur sont refusées.
- Les symboles ambigus avec des unités restent refusés.
- Aucun `eval`, aucune IA externe et aucun service Internet ne sont utilisés.

## Tests
- 61 cas paramétrés de tableaux de signes et de domaines.
- Tests directs des pôles, zéros, intervalles, opérations rationnelles, limites et sérialisation.
- Six tests d'intégration pipeline.
- Validation CI réussie : [workflow 46007360331](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/46007360331) — 1 617 tests globaux réussis, 0 échec ; 104 tests ciblés du moteur (61 cas paramétrés et 43 tests directs) et 6 tests d'intégration pipeline.
- APK non compilé.
