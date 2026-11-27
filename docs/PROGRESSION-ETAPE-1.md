# Progression — Étape 1 : Intelligence propre

## Règle de compilation
Aucun APK n'est compilé pendant le développement des groupes de l'étape 1.
Les commits déclenchent uniquement la vérification de syntaxe JavaScript et les tests automatisés.
La compilation APK sera réactivée uniquement après validation complète de l'étape 1.

## Groupes

| Groupe | Sujet | État |
|---|---|---|
| 1.1 | Fondations de compréhension du français | Module local chargé dans l'application et raccordé au pipeline ; couverture linguistique à élargir |
| 1.2 | Analyse grammaticale et sémantique initiale | Module local chargé dans l'application et raccordé au pipeline ; analyse encore heuristique |
| 1.3 | Compréhension des intentions | Version locale v0.3 chargée dans l'application et raccordée au pipeline ; 40 tests ciblés ; couverture et ambiguïtés à approfondir |
| 1.4 | Reconnaissance et représentation des objets | À approfondir |
| 1.5 | Reconnaissance des actions | À approfondir |

## Dernière vérification
- Branche : `idee-vision-etape-1-intelligence`
- Commit : `8829df50302cf0d3956db428b49c86faa522db88`
- Workflow : [GitHub Actions](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45958714189)
- Résultat : 404 tests réussis, 0 échec.
- APK : non compilé, conformément à la règle du projet.

## Limites à respecter
Les rôles grammaticaux sujet/complément sont encore des hypothèses heuristiques. Les pronoms non résolus et les formulations ambiguës doivent rester signalés. Aucun résultat de cette étape ne doit être présenté comme une compréhension générale parfaite.


## Groupe 1.3 — première livraison
- Module : `app/src/main/assets/understanding/intent-understanding-v1.js`
- Tests ciblés : `tests/intent-understanding-v1.test.js` (30 tests)
- Documentation : `docs/GROUPE-1.3-INTENTIONS.md`
- Capacités : question, instruction, description, explication, comparaison, création, modification, suppression, simulation demandée, mesure, traduction, résumé, planification et vérification ; extraction initiale des contraintes et formats.
- Vérification GitHub Actions : 434 tests réussis, 0 échec (workflow 45960084339).
- Limite : règles lexicales initiales ; les intentions détectées restent candidates. Aucune loi physique n'est appliquée.


## Groupe 1.3 — renforcement v0.3
- Détection des intentions répétées, polarité négative et marqueurs d'ordre.
- Positions des phrases corrigées et conservées.
- Fonction de raccordement contrôlé aux analyses linguistiques des groupes 1.1 et 1.2, avec contrôle de concordance de la phrase source.
- Tests ciblés : 40 ; workflow : [45965139627](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45965139627), toutes les étapes réussies.
- L'intégration à l'interface de l'application reste à faire. Le groupe 1.3 n'est donc pas déclaré définitivement terminé.


## Pipeline local des groupes 1.1 à 1.3
- Fichier : `app/src/main/assets/understanding/understanding-pipeline-v1.js`.
- Tests : `tests/understanding-pipeline-v1.test.js` (20 tests).
- L'application charge les quatre modules de compréhension et exécute le pipeline au début de `start()`.
- La représentation locale rassemble objets, actions, relations, quantités, groupes nominaux, prédicats, pronoms, intentions, contraintes et formats.
- Le contexte structuré est transmis à l'étape existante de préparation de scène.
- Vérification : [workflow 45965448342](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45965448342) — 464 tests réussis, 0 échec.
- Limite importante : le pipeline est local, mais le reste du flux de génération de scène utilise encore Groq et Three.js CDN. L'application complète n'est donc pas encore hors ligne. Ces dépendances seront traitées séparément, sans les confondre avec le moteur de compréhension.
- Aucun APK compilé.
