# Groupe 1.19 — Compréhension symbolique des fonctions

## Livrables
- Module : \`app/src/main/assets/understanding/function-model-v1.js\`.
- Tests ciblés : \`tests/function-model-v1.test.js\` (60 tests).
- Intégration : \`representation.functionModel\`, \`stages.functionModel\` et contexte JSON du pipeline.
- Chargement local dans \`index.html\`.

## Capacités représentées
1. Définitions de fonctions telles que \`f(x)=x²+1\`, avec conservation de l'expression et de la variable.
2. Analyse symbolique de l'expression associée au moyen du parseur mathématique local.
3. Domaines de définition et ensembles images exprimés en notation ou en français.
4. Composition de fonctions, notation \`f ∘ g\` et formes imbriquées simples.
5. Notations de fonctions inverses/réciproques.
6. Intervalles explicitement écrits.
7. Sens de variation : croissante, décroissante, strictement monotone ou constante.
8. Limites symboliques, variable et cible exprimées.
9. Continuité et discontinuité avec point ou intervalle mentionné.
10. Demandes de courbes et représentations graphiques.
11. Positions de source, preuves textuelles, métriques et sortie JSON.

## Limites
Le module reconnaît et structure des expressions écrites ; il ne calcule pas les valeurs d'une fonction, ne détermine pas les domaines ni les images, ne calcule pas les limites, ne démontre pas la continuité ou les variations et ne trace pas de graphe. Les notations ambiguës ou incomplètes restent des candidats. Le rendu graphique sera traité dans les étapes de modélisation et de visualisation, pas prétendu ici.

## Vérification
GitHub Actions vérifie la syntaxe JavaScript et exécute les tests automatisés. Aucun APK n'est compilé pendant le développement de l'étape 1.
