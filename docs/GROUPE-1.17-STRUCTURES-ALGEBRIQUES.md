# Groupe 1.17 — Structures algébriques et systèmes d'équations

## Livrables
- Module : \`app/src/main/assets/understanding/algebraic-structures-v1.js\`
- Tests ciblés : \`tests/algebraic-structures-v1.test.js\` (45 tests)
- Pipeline : \`representation.algebraicStructures\`, \`stages.algebraicStructures\` et contexte JSON.

## Capacités
1. Repérer plusieurs équations dans un texte, des lignes ou des segments séparés.
2. Distinguer équations et inégalités.
3. Construire des candidats de systèmes d'équations.
4. Identifier les variables communes entre équations.
5. Préserver les expressions et indices de ligne.
6. Décrire les monômes, binômes et polynômes candidats.
7. Repérer les produits factorisés et fractions rationnelles candidates.
8. Estimer le degré de formes polynomiales simples à partir de l'AST précédent.
9. Conserver les inconnues et les ambiguïtés.
10. Fournir des métriques et diagnostics sérialisables.

## Limites
Aucun système n'est résolu. Le moteur ne calcule pas les coefficients, ne simplifie pas les expressions et ne vérifie aucune solution. Le degré reste une estimation syntaxique prudente. Les matrices, déterminants, espaces vectoriels, groupes, anneaux et corps ne sont pas encore modélisés. Les segments d'une phrase complexe peuvent nécessiter une meilleure segmentation linguistique.

## Vérification
La suite globale de tests et les contrôles de syntaxe JavaScript sont exécutés par GitHub Actions. Aucun APK n'est compilé pendant l'étape 1.
