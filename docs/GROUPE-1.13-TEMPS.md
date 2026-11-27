# Groupe 1.13 — Compréhension et représentation du temps

## Objectif
Représenter les événements et les expressions temporelles explicitement présentes dans une phrase, sans inventer de dates, de durées, d'achèvements ni de chronologie réelle.

## 20 éléments livrés
1. Événements candidats reliés aux actions linguistiques.
2. Distinction passé, présent, futur lorsque le temps grammatical est disponible.
3. Détection de dates numériques.
4. Détection de dates avec mois écrit.
5. Détection d'heures.
6. Détection de durées et unités.
7. Détection des temps relatifs (hier, aujourd'hui, demain).
8. Détection des jours de la semaine.
9. Détection des noms de mois.
10. Marqueurs de début et d'ordre (d'abord, ensuite, puis).
11. Marqueurs avant/après.
12. Simultanéité candidate.
13. Récurrence explicite (tous les jours, chaque semaine).
14. Marqueurs depuis et à partir de.
15. Marqueurs jusqu'à.
16. Délais représentés par les durées explicites.
17. Achèvement non déterminé si non indiqué.
18. Événements sans date conservés.
19. Timeline fondée uniquement sur la position textuelle.
20. Ambiguïtés et références temporelles manquantes signalées.

## Fichiers
- Module : `app/src/main/assets/understanding/time-model-v1.js`
- Tests ciblés : `tests/time-model-v1.test.js` (28 tests)
- Intégration : `representation.timeModel`, `stages.timeModel`, contexte JSON.
- Chargement : `index.html`.

## Limites
Le module est lexical et heuristique. Les dates numériques font l’objet d’un contrôle calendaire simple ; les dates relatives ne sont pas calculées sans référence. « Demain » exige une date de référence. L'ordre des mots n'est pas une preuve de chronologie réelle. Les temps verbaux peuvent rester non résolus et l'association des expressions aux actions est limitée à la phrase.
