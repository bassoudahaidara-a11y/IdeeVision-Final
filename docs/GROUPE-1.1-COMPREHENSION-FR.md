# Groupe 1.1 — Fondations de compréhension du français

## Statut de cette nouvelle base

Ce groupe inaugure un nouveau sous-système séparé des anciens moteurs heuristiques. Le module
\`french-language-foundation-v1.js\` est local, déterministe et sans dépendance externe.
Il ne constitue pas une intelligence générale ni un modèle de langage.

## Les 15 capacités couvertes

1. Normaliser les espaces, apostrophes et caractères typographiques.
2. Segmenter les descriptions en phrases.
3. Découper les phrases en unités Unicode avec positions source.
4. Classer les mots selon leur rôle lexical provisoire.
5. Reconnaître les noms d'objets présents dans le lexique.
6. Conserver les noms inconnus comme candidats, jamais comme faits certains.
7. Relever les propriétés explicitement exprimées.
8. Reconnaître les verbes connus sans inventer leur sujet ou leur complément.
9. Détecter la négation autour d'une action reconnue.
10. Extraire les quantités et unités écrites.
11. Repérer les relations spatiales exprimées.
12. Repérer les marqueurs temporels.
13. Traiter plusieurs phrases comme une description cohérente unique.
14. Signaler les informations inconnues ou les relations incomplètes.
15. Produire une représentation structurée en interdisant les déductions physiques à ce stade.

## Architecture de sortie

L'appel \`IdeeVisionFrenchUnderstanding.analyze(texte)\` retourne :
- le texte source normalisé ;
- les phrases et leurs positions ;
- les tokens et leur classification ;
- les objets reconnus ou candidats ;
- les propriétés explicites ;
- les actions reconnues ;
- les relations spatiales et temporelles ;
- les quantités ;
- les mots inconnus et les avertissements ;
- une politique indiquant que la physique n'a pas été appliquée.

## Exemple de portée

Entrée : « Une bouteille rouge contient 0,5 l d'eau. Un tube est dans la bouteille. »

Le moteur peut relever la bouteille, la propriété rouge, le verbe contenir, la quantité 0,5 l,
le tube et le marqueur spatial « dans ». Il ne doit pas conclure que l'eau coule, que la pression
augmente, ni que le système fonctionne : ces questions appartiennent à l'étape des lois naturelles.

## Limites honnêtes

- Le lexique est volontairement limité et doit grandir progressivement.
- Les accords, variantes régionales et conjugaisons ne sont pas exhaustifs.
- La résolution grammaticale complète du sujet et du complément n'est pas encore faite.
- Les noms inconnus sont signalés comme candidats.
- Une relation n'est considérée comme explicite que si les deux objets sont identifiés.
- Ce module n'apprend pas encore automatiquement de nouvelles règles.
- La qualité réelle doit être évaluée sur des phrases inédites, pas seulement sur les exemples des tests.

## Vérification

Les tests automatisés sont dans \`tests/french-language-foundation-v1.test.js\`.
Ils couvrent les 15 capacités et plusieurs garde-fous contre les interprétations inventées.
