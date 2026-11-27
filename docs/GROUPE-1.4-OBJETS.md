# Groupe 1.4 — Reconnaissance et représentation descriptive des objets

## Objectif
Construire une représentation locale des objets décrits en français, en conservant les propriétés explicitement formulées. Ce groupe prépare une description structurée ; il ne construit pas encore une géométrie 3D et ne déduit aucune loi physique.

## Les 18 éléments de travail
1. Vérifier que l'analyse linguistique fournie correspond exactement au texte analysé.
2. Créer un identifiant distinct pour chaque occurrence d'objet.
3. Conserver le nom de surface et le lemme lorsqu'il est connu.
4. Distinguer les noms reconnus des noms candidats inconnus.
5. Proposer une catégorie descriptive prudente (véhicule, bâtiment, mobilier, contenant, mécanisme, appareil, être vivant ou objet candidat).
6. Conserver les positions de l'objet dans la phrase.
7. Conserver les preuves textuelles associées aux propriétés.
8. Reconnaître les couleurs explicitement exprimées.
9. Reconnaître les formes explicitement exprimées.
10. Reconnaître un matériau seulement lorsqu'un marqueur linguistique clair l'introduit.
11. Conserver les dimensions exprimées avec des unités de longueur.
12. Séparer les autres quantités (masse, volume, etc.) des dimensions.
13. Conserver les états explicitement formulés (ouvert, fermé, plein, vide, mobile, fixe, etc.).
14. Rattacher les relations spatiales déjà détectées à leurs occurrences d'objets, sans les inventer.
15. Garder distinctes les occurrences répétées d'un même nom.
16. Ne pas supposer qu'un pronom dans une phrase ultérieure désigne un objet particulier.
17. Produire une structure JSON stable et sérialisable.
18. Exposer les limites et ne jamais inventer une propriété ou appliquer une loi physique.

## Implémentation
- Module : `app/src/main/assets/understanding/object-model-v1.js`.
- Tests : `tests/object-model-v1.test.js` (25 tests).
- Intégration : `understanding-pipeline-v1.js`, chargé dans l'application avant le pipeline.
- Le pipeline expose les objets descriptifs dans `representation.objectModels` et les transmet dans le contexte structuré JSON.

## Limites connues
- L'association des dimensions à un objet reste heuristique.
- L'identité d'un objet entre plusieurs phrases n'est pas résolue.
- Le lexique des catégories, matériaux, formes et états est incomplet.
- Les propriétés proches peuvent parfois être associées au mauvais objet dans des phrases complexes ; elles doivent rester vérifiables par leurs indices de texte.
- Ce module ne construit pas encore de maillage 3D, ne calcule pas les volumes et ne simule pas la matière.
- Le groupe 1.4 n'est pas déclaré terminé avant validation des tests et examen des cas limites.
