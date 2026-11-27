# Groupe 1.23 — Résolution des inéquations

## Moteur local
- Module : `app/src/main/assets/understanding/inequality-solver-v1.js`.
- Tests ciblés : `tests/inequality-solver-v1.test.js`.
- Analyse les inégalités strictes et larges, y compris les opérateurs Unicode.
- Résout les polynômes d'une variable de degré au plus deux après réduction des deux membres.
- Calcule les racines critiques et construit les intervalles par étude de signe.
- Distingue intervalles ouverts, fermés, semi-ouverts, unions, point isolé, ensemble vide et ensemble des réels.
- Traite les parenthèses et fractions à dénominateur numérique via le moteur symbolique existant.
- Aucun `eval`, aucune IA externe, aucun accès réseau.

## Limites
Une seule variable, degré maximal deux, racines réelles uniquement. Les relations chaînées, dénominateurs polynomiaux, systèmes d'inéquations et variables ambiguës avec les unités sont refusés.

Validation CI réussie : [workflow 46004514117](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/46004514117) — 1400 tests réussis, 0 échec. Couverture ciblée : 92 tests du résolveur et 4 tests d’intégration supplémentaires. APK non compilé.
