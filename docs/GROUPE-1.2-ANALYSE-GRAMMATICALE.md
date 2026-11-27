# Groupe 1.2 — Analyse grammaticale et sémantique initiale

## Objectif
Ajouter une couche qui examine comment les mots s'organisent dans une phrase française :
groupes nominaux, verbes, propositions, sujets et compléments candidats, prépositions,
pronoms, coordination et accords simples.

## Les 15 éléments du groupe
1. Étiquetage grammatical initial des tokens.
2. Détection des déterminants.
3. Construction des groupes nominaux.
4. Distinction entre noms connus et noms candidats.
5. Rattachement des adjectifs avant et après le nom.
6. Vérification prudente de quelques accords de genre connus.
7. Reconnaissance de formes verbales et de temps courants.
8. Découpage de propositions simples.
9. Proposition d'un sujet à partir de l'ordre des mots.
10. Proposition d'un complément direct à partir de l'ordre des mots.
11. Distinction initiale entre prédicat copulatif et action transitive candidate.
12. Détection de la négation du prédicat.
13. Détection des groupes prépositionnels.
14. Reconnaissance des pronoms sans inventer leur référent.
15. Détection de coordinations et signalement des ambiguïtés.

## Prudence sémantique
Les rôles sujet et complément sont des candidats heuristiques, pas des certitudes.
L'analyse ne déduit pas la causalité, les lois physiques ou le fonctionnement d'un montage.
Les pronoms non résolus restent non résolus.

## Dépendance locale
Le module \`french-grammar-semantics-v1.js\` utilise le module local
\`french-language-foundation-v1.js\`. Aucun service distant ni API n'est appelé.

## Tests
Les tests automatisés sont dans \`tests/french-grammar-semantics-v1.test.js\`.
