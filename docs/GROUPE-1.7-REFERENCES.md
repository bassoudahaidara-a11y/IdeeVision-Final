# Groupe 1.7 — Résolution prudente des références et identités

## Objectif
Relier prudemment les pronoms et reprises à des mentions d'objets déjà rencontrées dans le texte. Une référence est proposée comme candidate seulement si les indices linguistiques le permettent. Les cas ambigus ou sans antécédent restent non résolus.

## Les 20 éléments de travail
1. Vérifier que les analyses grammaticales et objets portent sur la même source.
2. Recenser chaque mention d'objet avec son identifiant.
3. Conserver les positions des mentions dans le texte complet.
4. Retrouver le groupe nominal associé à chaque mention dans sa phrase.
5. Extraire le genre grammatical connu lorsqu'il existe.
6. Extraire un indice de nombre singulier/pluriel.
7. Repérer les pronoms sujets masculins et féminins.
8. Repérer les pronoms sujets singuliers et pluriels.
9. Repérer les pronoms compléments reconnus par la grammaire.
10. Repérer certains clitiques objets devant un verbe reconnu (la, le, les, lui, leur, en, y).
11. Ne considérer que les mentions antérieures comme antécédents possibles.
12. Écarter les incompatibilités connues de genre.
13. Écarter les incompatibilités connues de nombre.
14. Classer les candidats selon les indices grammaticaux et la proximité textuelle.
15. Ne sélectionner un candidat que si son score est distinct du suivant.
16. Conserver plusieurs candidats lorsque les indices ne départagent pas les mentions.
17. Garder les pronoms sans antécédent comme non résolus.
18. Conserver les positions et extraits de preuve.
19. Intégrer les références et les mentions au pipeline et au contexte JSON.
20. Ne transférer aucune propriété physique et ne jamais inventer une identité.

## Implémentation
- Module : `app/src/main/assets/understanding/reference-resolver-v1.js`.
- Tests ciblés : `tests/reference-resolver-v1.test.js` (26 tests).
- Intégration : `understanding-pipeline-v1.js`, étape `references`.
- Sortie : `representation.referenceResolution`, avec `mentions`, `references`, scores, statuts et règles de prudence.
- Extension lexicale : formes courantes de `prendre` ajoutées à la fondation française et à l'analyse grammaticale pour reconnaître le clitique dans « le robot la prend ».

## Limites connues
- Le système utilise des heuristiques et n'effectue pas une résolution linguistique complète.
- Le genre et le nombre ne sont pas connus pour tous les noms.
- La proximité ne prouve pas que deux expressions désignent le même objet.
- Les pronoms complexes, les possessifs, les relatives et les reprises implicites restent à développer.
- Une référence candidate ne confirme pas une identité réelle.
- Aucune propriété d'objet n'est automatiquement transférée entre mentions.
