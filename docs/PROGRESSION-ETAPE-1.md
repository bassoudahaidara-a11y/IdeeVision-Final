# Progression — Étape 1 : Intelligence propre

## Règle de compilation
Aucun APK n'est compilé pendant le développement des groupes de l'étape 1.
Les commits déclenchent uniquement la vérification de syntaxe JavaScript et les tests automatisés.
La compilation APK sera réactivée uniquement après validation complète de l'étape 1.

## Groupes

| Groupe | Sujet | État |
|---|---|---|
| 1.1 | Fondations de compréhension du français | Module local créé et tests spécifiques présents ; intégration à l'application et élargissement linguistique encore à faire |
| 1.2 | Analyse grammaticale et sémantique initiale | Module créé ; 25 tests spécifiques et vérification globale réussie |
| 1.3 | Compréhension des intentions | Première version locale créée ; 30 tests ciblés ; vérification globale réussie (434 tests, 0 échec) ; intégration UI et enrichissement à poursuivre |
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
