# Groupe 1.14 — Compréhension et représentation de l'espace

## Objectif
Représenter les positions, directions, distances, coordonnées et relations spatiales explicitement décrites par l'utilisateur, sans inventer de point de vue, de repère, de géométrie ou de loi physique.

## 20 éléments
1. Occurrences des objets spatiaux.
2. Relations gauche/droite.
3. Relations haut/bas.
4. Relations devant/derrière.
5. Relations intérieur/extérieur.
6. Relations dessus/dessous.
7. Proximité et éloignement.
8. Relations entre deux éléments.
9. Relations autour et au centre.
10. Directions cardinales.
11. Origines et destinations candidates.
12. Coordonnées explicites x, y et z.
13. Groupes de coordonnées 2D et 3D.
14. Distances avec unités.
15. Orientations explicites.
16. Références candidates aux objets décrits.
17. Positions dans la phrase source.
18. Preuves textuelles conservées.
19. Points de vue et repères non spécifiés signalés.
20. Absence de géométrie et de physique inventées.

## Fichiers
- Module : `app/src/main/assets/understanding/spatial-model-v1.js`
- Tests ciblés : `tests/spatial-model-v1.test.js` (30 tests)
- Intégration : `representation.spatialModel`, `stages.spatialModel`, contexte JSON.
- Chargement : `index.html`.

## Limites
Analyse lexicale et heuristique. Les relations gauche/droite dépendent du point de vue. Les coordonnées peuvent ne pas préciser leur repère ou unité. Les extrémités des relations restent candidates et aucune géométrie 3D ou physique n'est calculée.
