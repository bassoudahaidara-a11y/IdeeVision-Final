# Groupe 1.11 — Registre des connaissances, hypothèses et inconnues

Objectif : distinguer ce que le texte affirme, ce qu'il pose comme hypothèse, ce qu'il demande, ce qu'il déclare inconnu et ce qu'il présente comme déduction.

## 20 éléments
1. Registre des propositions exprimées.
2. Distinction affirmation/hypothèse.
3. Repérage des hypothèses explicites.
4. Repérage des questions.
5. Repérage des inconnues déclarées.
6. Conservation des conditions.
7. Raccord aux règles logiques.
8. Raccord aux chaînes de raisonnement.
9. Conclusions dérivées candidates.
10. Preuves textuelles.
11. Index des phrases sources.
12. Déduplication prudente.
13. Métriques.
14. Signalement des marqueurs d'inconnu absents.
15. Séparation texte/vérité vérifiée.
16. Séparation hypothèse/fait.
17. Inconnues laissées inconnues.
18. Aucune connaissance externe ajoutée.
19. Contrôle de cohérence des sources.
20. Sortie JSON stable.

Module : `knowledge-registry-v1.js`. Tests ciblés : 28. Intégration : `representation.knowledgeRegistry`, `stages.knowledgeRegistry` et contexte JSON.

Limites : ce registre ne vérifie pas la vérité réelle des affirmations. Sa détection est lexicale. Les hypothèses et déductions restent candidates et nécessitent une validation scientifique indépendante.
