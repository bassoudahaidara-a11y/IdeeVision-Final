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
| 1.4 | Reconnaissance et représentation des objets | Version v1 intégrée au pipeline ; 25 tests ciblés ; validation globale réussie (493 tests, 0 échec) ; enrichissements possibles ultérieurement |
| 1.5 | Reconnaissance des actions | Version v1 intégrée au pipeline ; 30 tests ciblés ; validation globale réussie (529 tests, 0 échec) ; couverture linguistique à approfondir |
| 1.6 | Relations entre objets et actions | Graphe descriptif v1 intégré au pipeline ; 25 tests ciblés ; validation globale réussie (559 tests, 0 échec) ; couverture des relations à approfondir |
| 1.7 | Résolution des références et identités | Résolveur prudent v1 intégré au pipeline ; 26 tests ciblés ; validation globale réussie (590 tests, 0 échec) ; résolution à approfondir |
| 1.18 | Vecteurs, matrices et opérations matricielles | Module v1 intégré au pipeline et chargé dans l’application ; 52 tests ciblés ; validation globale réussie (1029 tests, 0 échec) ; aucune opération numérique effectuée |
| 1.19 | Compréhension symbolique des fonctions | Module v1 intégré au pipeline et chargé dans l’application ; 60 tests ciblés ; validation globale réussie (1097 tests, 0 échec) ; aucun calcul de fonction ni tracé de graphe |

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


## Groupe 1.4 — première implémentation
- Module : `app/src/main/assets/understanding/object-model-v1.js`.
- Tests ciblés : `tests/object-model-v1.test.js` (25 tests).
- Documentation : `docs/GROUPE-1.4-OBJETS.md`.
- Le pipeline expose désormais les objets descriptifs dans `representation.objectModels` et le contexte JSON transmis à la suite du flux.
- Les informations conservées comprennent catégorie candidate, occurrences, couleurs, formes, matériaux explicitement marqués, dimensions, autres quantités, états, relations et preuves textuelles.
- Limites : association heuristique des propriétés, identité interphrases non résolue, vocabulaire incomplet. Aucune géométrie 3D ni physique n'est déduite.
- Vérification : [workflow 45965959735](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45965959735) — 493 tests réussis, 0 échec.
- APK non compilé.


## Groupe 1.5 — première implémentation
- Module : `app/src/main/assets/understanding/action-model-v1.js`.
- Tests ciblés : `tests/action-model-v1.test.js` (30 tests).
- Documentation : `docs/GROUPE-1.5-ACTIONS.md`.
- Intégration au pipeline : `representation.actionModels`, `representation.actionSequence` et contexte JSON.
- Capacités : classification prudente, polarité, rôles grammaticaux candidats, compléments, conditions, ordre textuel et connecteurs temporels.
- Limites : lexique incomplet, rôles heuristiques, aucune causalité ou physique calculée.
- Vérification : [workflow 45966384650](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45966384650) — 529 tests réussis, 0 échec.
- APK non compilé.


## Groupe 1.6 — première implémentation
- Module : `app/src/main/assets/understanding/relation-graph-v1.js`.
- Tests ciblés : `tests/relation-graph-v1.test.js` (25 tests).
- Documentation : `docs/GROUPE-1.6-RELATIONS.md`.
- Intégration : `representation.relationGraph`, avec nœuds objets/actions, arêtes spatiales, liens acteur/action/objet candidats et marqueurs temporels.
- Limites : relations spatiales héritées de règles lexicales, rôles candidats, résolution interphrases incomplète ; aucune causalité ni physique.
- Vérification de l'intégration : [workflow 45970892940](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45970892940) — 559 tests réussis, 0 échec. Une dernière vérification sera effectuée après nettoyage des tests de diagnostic.
- APK non compilé.


## Groupe 1.7 — première implémentation
- Module : `app/src/main/assets/understanding/reference-resolver-v1.js`.
- Tests ciblés : `tests/reference-resolver-v1.test.js` (26 tests).
- Documentation : `docs/GROUPE-1.7-REFERENCES.md`.
- Intégration : `representation.referenceResolution`, avec mentions, pronoms, clitiques candidats, antécédents possibles et statuts résolus-candidats/ambigus/non résolus.
- Extension de vocabulaire : formes conjuguées de `prendre` reconnues par les modules français.
- Limites : résolution heuristique, genre/nombre incomplets, aucune identité ou propriété physique inventée.
- Vérification : [workflow 45971791289](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45971791289) — 590 tests réussis, 0 échec.
- APK non compilé.


## Groupe 1.8 — première implémentation
- Module : `app/src/main/assets/understanding/complex-clause-analyzer-v1.js`.
- Tests ciblés : `tests/complex-clause-analyzer-v1.test.js` (35 tests).
- Documentation : `docs/GROUPE-1.8-PHRASES-COMPLEXES.md`.
- Intégration : `representation.complexClauses`, `stages.complexClauses` et contexte JSON.
- Capacités : repérage de conditions, relations temporelles, simultanéité, causes et buts exprimés, concessions, coordination, négation connue et liens candidats entre propositions.
- Limites : découpage heuristique, dépendance aux verbes reconnus, aucune causalité ou conséquence physique déduite.
- Vérification : [workflow 45976362989](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45976362989) — 630 tests réussis, 0 échec.
- APK non compilé.


## Groupe 1.9 — première implémentation
- Module : `app/src/main/assets/understanding/logical-reasoner-v1.js`.
- Tests ciblés : `tests/logical-reasoner-v1.test.js` (35 tests).
- Documentation : `docs/GROUPE-1.9-RAISONNEMENT-LOGIQUE.md`.
- Intégration : `representation.logicalReasoning`, `stages.logicalReasoning` et contexte JSON.
- Capacités : conditions SI-ALORS, conditions nécessaires/suffisantes candidates, ET/OU, négation, arbres logiques, contradictions possibles et biconditionnels candidats.
- Limites : raisonnement symbolique initial, formulations limitées, aucune valeur de vérité ou loi physique inventée.
- Vérification : [workflow 45977060459](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45977060459) — 672 tests réussis, 0 échec.
- APK non compilé.


## Groupe 1.10 — première implémentation
- Module : `app/src/main/assets/understanding/reasoning-chain-engine-v1.js`.
- Tests ciblés : `tests/reasoning-chain-engine-v1.test.js` (30 tests).
- Documentation : `docs/GROUPE-1.10-CHAINAGE-LOGIQUE.md`.
- Intégration : `representation.reasoningChains`, `stages.reasoningChains` et contexte JSON.
- Capacités : chaînes de règles, liens textuels exacts, dépendances orientées, conclusions candidates, règles isolées et ponts possibles à confirmer.
- Limites : les paraphrases et pronoms ne sont pas encore résolus ; aucun fait ou lien causal n'est inventé.
- Vérification : [workflow 45977512671](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45977512671) — 707 tests réussis, 0 échec.
- APK non compilé.


## Groupe 1.11 — première implémentation
- Module : `knowledge-registry-v1.js`.
- Tests ciblés : 28 ; intégration du pipeline : 4 tests supplémentaires.
- Distingue affirmations textuelles, hypothèses, questions, inconnues, règles et inférences candidates.
- Ne vérifie pas la vérité des affirmations et n'ajoute aucune connaissance externe.
- Validation CI réussie : [workflow 45977991154](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45977991154) — 739 tests, 0 échec.
- APK non compilé.


## Groupe 1.12 — première implémentation
- Module : `evidence-trace-v1.js`.
- Tests ciblés : 28 ; tests d'intégration ajoutés : 4.
- Chaque élément de connaissance reçoit une trace de provenance, une preuve textuelle, une phrase source et un statut non vérifié/candidat.
- Aucune vérification externe n'est simulée ; aucune preuve de soutien n'est inventée.
- Validation CI réussie : [workflow 45978156979](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45978156979) — 771 tests, 0 échec.
- APK non compilé.


## Groupe 1.13 — compréhension et représentation du temps
- Module : `app/src/main/assets/understanding/time-model-v1.js`.
- Tests ciblés : 28 ; tests d'intégration pipeline : 4.
- Représente les temps relatifs, dates, heures, durées, répétitions, états temporels, événements et relations temporelles candidates.
- Les dates relatives restent non résolues sans date de référence ; aucun fuseau horaire ni déroulement réel n'est supposé.
- Validation CI : [workflow 45979420017](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45979415031) — 803 tests réussis, 0 échec.
- APK non compilé.


## Groupe 1.14 — première implémentation
- Module : `spatial-model-v1.js`.
- Tests ciblés : 30 ; tests d'intégration pipeline : 4.
- Représentation des relations spatiales, coordonnées, distances, orientations et directions explicitement écrites.
- Les points de vue et repères manquants restent non résolus ; aucune géométrie ni physique n'est inventée.
- Validation CI réussie : [workflow 45979846009](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45979846009) — 837 tests, 0 échec.
- APK non compilé.


## Groupe 1.15 — première implémentation
- Module : `quantity-model-v1.js`.
- Tests ciblés : 32 ; tests d'intégration pipeline : 4.
- Extraction de nombres, unités, plages, bornes, comparaisons, pourcentages et approximations.
- Aucune conversion d'unité ni validation physique ; les unités manquantes restent inconnues.
- Validation CI réussie : [workflow 45980383674](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45980383674) — 873 tests, 0 échec.
- APK non compilé.


## Groupe 1.16 — analyse symbolique des mathématiques
- Module : \`app/src/main/assets/understanding/math-expression-model-v1.js\`.
- Tests ciblés : 45 tests.
- Intégration au pipeline et au chargement de l'application : AST, variables, constantes, fonctions, opérateurs, priorités, groupes, fractions, puissances, racines, équations et inégalités.
- Le moteur conserve les preuves textuelles et les symboles inconnus ; il ne calcule ni ne résout les expressions.
- Validation globale réussie : [workflow 45997332746](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45997332746) — 922 tests réussis, 0 échec.
- APK non compilé.


## Groupe 1.17 — structures algébriques et systèmes
- Module : \`app/src/main/assets/understanding/algebraic-structures-v1.js\`.
- Tests ciblés : 45 tests.
- Intégration au pipeline : repérage des équations, inégalités, systèmes candidats, variables communes, formes polynomiales simples et degré syntaxique candidat.
- Le moteur ne résout ni les équations ni les systèmes et n'effectue aucun calcul numérique.
- Validation globale réussie : [workflow 45997727386](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45997727386) — 971 tests réussis, 0 échec.
- APK non compilé.


## Groupe 1.18 — première implémentation
- Module : \`app/src/main/assets/understanding/vector-matrix-model-v1.js\`.
- Tests ciblés : 52 tests ; intégration pipeline : 6 tests.
- Représentation des vecteurs (composantes, symboles et dimensions) et des matrices (lignes, colonnes, entrées et dimensions).
- Repérage candidat des additions, soustractions, multiplications, produits scalaire/vectoriel, transposées, normes, déterminants et inverses.
- Les entrées inconnues et preuves textuelles sont conservées ; les matrices irrégulières sont signalées.
- Aucune opération n'est calculée, aucune dimension n'est validée et aucun système n'est résolu.
- Validation globale réussie : [workflow 45998401591](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45998401591) — 1029 tests réussis, 0 échec.
- APK non compilé.


## Groupe 1.19 — première implémentation
- Module : \`app/src/main/assets/understanding/function-model-v1.js\`.
- Tests ciblés : 60 ; tests d'intégration pipeline : 8.
- Représentation des définitions de fonctions, domaines, images, compositions, inverses, intervalles, variations, limites, continuité et demandes de graphes.
- L'expression de chaque fonction est reliée au parseur mathématique symbolique existant.
- Aucune fonction n'est évaluée ; aucun domaine, ensemble image, limite ou graphe n'est calculé.
- Validation globale réussie : [workflow 45999437721](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45999437721) — 1097 tests réussis, 0 échec.
- APK non compilé.


## Groupe 1.20 — première implémentation
- Moteur : \`app/src/main/assets/understanding/numeric-math-engine-v1.js\`.
- Tests ciblés : 60 ; tests d'intégration pipeline : 6.
- Calcul contrôlé des opérations arithmétiques, priorités, parenthèses, décimaux, fractions, puissances, racines, constantes et fonctions usuelles.
- Substitution uniquement des variables numériques explicitement fournies.
- Contrôles des divisions par zéro, domaines simples, valeurs non finies et précision.
- Le moteur parcourt un AST mathématique ; il n'utilise pas \`eval\` et n'exécute pas de code arbitraire.
- Les équations, inégalités, unités, matrices et simplifications symboliques générales ne sont pas encore calculées.
- Validation globale réussie : [workflow 46000047129](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/46000047129) — 1 163 tests réussis, 0 échec.
- APK non compilé.


## Groupe 1.21 — première implémentation
- Moteur : \`app/src/main/assets/understanding/symbolic-algebra-engine-v1.js\`.
- Tests ciblés : 65 ; tests d'intégration pipeline : 6.
- Réduction de termes semblables, règles élémentaires, développement polynomial par distributivité, puissances entières limitées et factorisation par facteur monomial commun.
- Simplification de fractions à dénominateur numérique constant non nul.
- Source, AST, étapes de transformation et variables inconnues conservés.
- Les équations et inégalités ne sont pas résolues ; les fractions rationnelles symboliques et les restrictions de domaine avancées restent à traiter.
- Validation globale réussie : [workflow 46000721925](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/46000721925) — 1 234 tests réussis, 0 échec.
- APK non compilé.


## Groupe 1.22 — résolution contrôlée des équations
- Module : `app/src/main/assets/understanding/equation-solver-v1.js`.
- Tests : `tests/equation-solver-v1.test.js` et intégration pipeline.
- Équations linéaires et quadratiques, discriminant, racines réelles vérifiées par substitution, fractions à dénominateur numérique non nul, systèmes linéaires carrés jusqu'à trois inconnues par élimination de Gauss.
- Limites : pas de racines complexes ni de systèmes non linéaires ; symboles d'unités ambigus refusés.
- Validation CI réussie : [workflow 46002406886](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/46002406886) — 1305 tests réussis, 0 échec. Tests ciblés du résolveur : 67 ; tests d’intégration du pipeline ajoutés : 4.
- APK non compilé.
