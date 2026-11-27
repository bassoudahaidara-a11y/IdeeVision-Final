# Groupe 1.6 — Relations entre objets et actions

## Objectif
Construire une représentation en graphe des relations explicitement exprimées entre objets et actions. Le graphe conserve les indices linguistiques, les liens candidats et les ambiguïtés, sans inventer de relation implicite ni appliquer la physique.

## Les 20 éléments de travail
1. Vérifier la concordance du texte source entre les analyses.
2. Créer des nœuds distincts pour les occurrences d'objets.
3. Créer des nœuds distincts pour les occurrences d'actions.
4. Relier les objets par des relations spatiales explicitement détectées.
5. Conserver le marqueur spatial original.
6. Garder les extrémités non identifiées comme non résolues.
7. Conserver l'orientation textuelle sans la présenter comme une certitude géométrique.
8. Relier un acteur à une action uniquement comme candidat grammatical.
9. Relier une action à son objet direct uniquement comme candidat grammatical.
10. Représenter les compléments prépositionnels comme liens candidats.
11. Conserver les marqueurs de temps et de séquence.
12. Relier deux actions lorsque le texte contient un connecteur temporel reconnu.
13. Conserver les identifiants de nœuds dans les arêtes.
14. Conserver les positions des preuves dans la description.
15. Préserver plusieurs objets et actions dans une même phrase.
16. Ne pas fusionner automatiquement les objets de phrases différentes.
17. Signaler les extrémités manquantes et liens incomplets.
18. Produire une structure JSON de graphe stable.
19. Intégrer le graphe au pipeline de compréhension et au contexte structuré.
20. Interdire toute causalité, propriété ou loi physique inventée.

## Implémentation
- Module : `app/src/main/assets/understanding/relation-graph-v1.js`.
- Tests ciblés : `tests/relation-graph-v1.test.js` (25 tests).
- Intégration : `understanding-pipeline-v1.js`.
- Sortie : `representation.relationGraph`, contenant `nodes`, `edges`, `issues` et les règles de prudence.
- L'application charge le module avant le pipeline.

## Limites connues
- Les relations spatiales héritent des heuristiques linguistiques existantes.
- Les rôles acteur/objet direct restent candidats.
- Les objets répétés ou repris par un pronom ne sont pas encore résolus entre phrases.
- L'ordre textuel ne prouve pas la causalité.
- Le graphe ne calcule aucune force, trajectoire, pression ou autre phénomène physique.
