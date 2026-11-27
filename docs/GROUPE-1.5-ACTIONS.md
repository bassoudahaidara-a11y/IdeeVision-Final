# Groupe 1.5 — Reconnaissance et représentation des actions

## Objectif
Représenter les actions décrites dans une phrase : verbe, catégorie candidate, polarité, acteur et objet éventuels, compléments, conditions, ordre textuel et indices temporels. Les rôles restent prudents et aucune conséquence physique n'est calculée.

## Les 20 éléments de travail
1. Vérifier que les analyses linguistique et grammaticale portent sur le même texte.
2. Créer un identifiant par occurrence verbale reconnue.
3. Conserver le verbe de surface, son lemme et sa position.
4. Classer prudemment les actions en mouvement, manipulation, transformation, connexion, écoulement, création ou communication.
5. Garder une catégorie candidate lorsque le verbe n'est pas classé.
6. Préserver la polarité positive ou négative.
7. Ne jamais transformer une action négative en ordre d'exécution.
8. Conserver le temps grammatical lorsqu'il est reconnu.
9. Relier l'acteur seulement comme candidat grammatical.
10. Relier l'objet direct seulement comme candidat grammatical.
11. Garder les rôles inconnus non résolus.
12. Repérer les compléments prépositionnels comme candidats.
13. Conserver les marqueurs de condition et de temps présents dans la phrase.
14. Repérer les modificateurs de négation.
15. Conserver des états résultants lexicaux comme candidats, sans les affirmer comme effets réels.
16. Indiquer une transitivité verbale candidate sans inventer de complément.
17. Construire un ordre d'occurrences selon le texte.
18. Conserver les connecteurs explicites entre actions (puis, ensuite, avant, après, etc.).
19. Préserver les positions et preuves textuelles dans les phrases multiples.
20. Signaler les limites, l'absence d'action et les rôles incomplets ; ne calculer ni causalité ni physique.

## Implémentation
- Module : `app/src/main/assets/understanding/action-model-v1.js`.
- Tests ciblés : `tests/action-model-v1.test.js` (30 tests).
- Intégration : `understanding-pipeline-v1.js`, chargé par l'application avant le pipeline.
- Le pipeline expose `representation.actionModels` et `representation.actionSequence`, ainsi que leurs données dans le contexte JSON.

## Limites connues
- Le lexique des verbes reste limité par les fondations linguistiques.
- Les rôles sujet et objet sont des candidats heuristiques.
- Les marqueurs conditionnels peuvent concerner une proposition plutôt qu'une action précise.
- L'ordre du texte n'est pas toujours l'ordre réel d'exécution.
- Aucun calcul de force, mouvement, énergie, fluide ou causalité n'est effectué.
- Le groupe ne sera déclaré validé qu'après réussite des tests automatisés.
