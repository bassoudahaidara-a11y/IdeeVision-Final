# Groupe 1.13 — Compréhension et représentation du temps

## Objectif
Représenter les informations temporelles explicitement écrites, les relier prudemment aux actions et conserver les éléments qui restent inconnus. Une date relative comme « demain » n'est pas convertie en date absolue sans date de référence.

## 20 éléments
1. Temps grammatical candidat.
2. Passé, présent et futur candidats.
3. Marqueurs temporels relatifs.
4. Jours de semaine.
5. Dates calendaires.
6. Heures explicites.
7. Durées explicites.
8. Début d'action.
9. Fin d'action.
10. Actions en cours.
11. Actions interrompues.
12. État terminé ou incomplet explicite.
13. Ordre chronologique exprimé.
14. Simultanéité exprimée.
15. Délais et bornes temporelles candidates.
16. Répétitions.
17. Intervalles candidats.
18. Événements sans date connue.
19. Preuves et positions textuelles.
20. Ambiguïtés et dates non résolues.

## Fichiers
- Module : `app/src/main/assets/understanding/time-model-v1.js`
- Tests ciblés : `tests/time-model-v1.test.js` (28 tests)
- Intégration : `representation.timeModel`, `stages.timeModel`, contexte JSON.

## Limites
Les dates relatives restent non résolues sans date de référence. Aucun fuseau horaire n'est supposé. Les liens entre événements sont des candidats linguistiques, pas des preuves de déroulement réel.
