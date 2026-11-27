# Groupe 1.15 — Compréhension des quantités et mesures

## Objectif
Extraire et représenter les valeurs numériques, unités, intervalles, comparaisons et approximations écrites par l'utilisateur. Le moteur conserve les valeurs sans effectuer de conversion ni inventer de calcul scientifique.

## 20 éléments
1. Nombres entiers.
2. Nombres décimaux avec virgule.
3. Nombres décimaux avec point.
4. Valeurs positives et négatives.
5. Notation scientifique.
6. Unités de longueur.
7. Unités de masse.
8. Unités de volume.
9. Unités de temps.
10. Température.
11. Pression.
12. Vitesse.
13. Angle.
14. Énergie et puissance.
15. Grandeurs électriques.
16. Pourcentages.
17. Intervalles et plages numériques.
18. Bornes minimales et maximales.
19. Comparaisons, égalité et approximation.
20. Preuves, positions, unités manquantes et valeurs non converties.

## Fichiers
- Module : `app/src/main/assets/understanding/quantity-model-v1.js`
- Tests ciblés : `tests/quantity-model-v1.test.js` (32 tests)
- Intégration : `representation.quantityModel`, `stages.quantityModel`, contexte JSON.
- Chargement : `index.html`.

## Limites
Le lexique des unités est initial et certaines abréviations peuvent être ambiguës. Aucune conversion, validation physique ou opération arithmétique n'est exécutée. Les valeurs sans unité restent sans unité.
