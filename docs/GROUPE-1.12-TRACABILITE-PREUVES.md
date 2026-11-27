# Groupe 1.12 — Traçabilité des preuves et de leur provenance

## Objectif
Pour chaque élément du registre de connaissances, conserver son origine, son texte de preuve, sa phrase source et son statut épistémique. Le moteur ne doit pas confondre une phrase écrite avec une preuve scientifique.

## 20 éléments
1. Traçabilité par élément de connaissance.
2. Identifiant de provenance.
3. Conservation de la preuve textuelle.
4. Raccord à l'identifiant de connaissance.
5. Raccord à la phrase source.
6. Distinction du texte utilisateur.
7. Distinction des hypothèses.
8. Distinction des conditions.
9. Distinction des déductions candidates.
10. Distinction des inconnues.
11. Distinction des questions.
12. Statut de vérification explicite.
13. Preuve absente signalée.
14. Aucune preuve inventée.
15. Aucune source externe simulée.
16. Index par origine.
17. Métriques de traçabilité.
18. Détection de registre incompatible.
19. Détection de grammaire incompatible.
20. Sortie JSON stable.

## Fichiers
- Module : `app/src/main/assets/understanding/evidence-trace-v1.js`
- Tests ciblés : `tests/evidence-trace-v1.test.js` (28 tests)
- Intégration : `representation.evidenceTrace`, `stages.evidenceTrace`, contexte JSON.

## Limites
Le module ne consulte ni ne vérifie de sources externes. Une preuve textuelle n'établit pas la vérité réelle d'une affirmation. Les liens automatiques entre éléments de soutien restent à développer.
