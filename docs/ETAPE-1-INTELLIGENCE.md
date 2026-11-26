# Idée Vision — Étape 1 : Intelligence, compréhension et raisonnement

## Organisation par groupes de groupes

Chaque groupe contient au minimum 15 tâches. Le travail est livré progressivement, et une tâche n'est considérée comme terminée que si son code et son test sont présents.

### Groupe 1.1 — Fondations cognitives locales (20 tâches)

| # | Tâche | État |
|---:|---|---|
| 1 | Normaliser les espaces et caractères typographiques | Développé |
| 2 | Normaliser les accents pour les comparaisons | Développé |
| 3 | Découper le texte en mots Unicode | Développé |
| 4 | Détecter heuristiquement le français | Développé |
| 5 | Détecter heuristiquement l'anglais | Développé |
| 6 | Ajouter une première reconnaissance de marqueurs bambara | Développé, couverture limitée |
| 7 | Classer les demandes de création | Développé |
| 8 | Classer les demandes d'explication | Développé |
| 9 | Classer les demandes de calcul | Développé |
| 10 | Extraire les nombres entiers et décimaux | Développé |
| 11 | Extraire les unités sans confondre les lettres isolées | Développé |
| 12 | Extraire les dimensions 2D/3D simples | Développé |
| 13 | Repérer les demandes trop courtes ou ambiguës | Développé |
| 14 | Marquer les requêtes potentiellement dangereuses pour examen | Développé, filtre préliminaire seulement |
| 15 | Construire un plan de traitement selon l'intention | Développé |
| 16 | Conserver un historique limité à la session | Développé, mémoire volatile |
| 17 | Construire un contexte structuré à transmettre aux autres moteurs | Développé |
| 18 | Router les intentions vers les moteurs spécialisés | Développé, cibles déclaratives |
| 19 | Fournir un diagnostic du moteur cognitif | Développé |
| 20 | Ajouter 20 tests automatisés | Écrit, exécution CI à confirmer |

### Limites connues

- Ce moteur est une base heuristique hors ligne, pas encore une intelligence générale ni un modèle de langage.
- La détection de langue est approximative, surtout pour le bambara et les phrases très courtes.
- Le routage nomme les moteurs cibles ; leur intégration sera réalisée dans les groupes suivants.
- La mémoire actuelle disparaît à la fermeture de l'application.
- Le contrôle de sécurité est un premier signalement et ne remplace pas les contrôles des moteurs spécialisés.

## Critères de validation du groupe 1.1

1. Les tests Node doivent tous réussir.
2. L'application doit charger le fichier cognitif sans erreur JavaScript.
3. Une demande utilisateur doit être analysée avant d'être envoyée au générateur.
4. Le contexte structuré doit être transmis au pipeline de conception.
5. Les limites connues doivent rester affichées dans la documentation jusqu'à leur résolution.

## Prochains groupes de l'étape 1

- Groupe 1.2 : mémoire de travail, contexte conversationnel et références.
- Groupe 1.3 : raisonnement logique, décomposition et résolution de problèmes.
- Groupe 1.4 : gestion des connaissances et sources.
- Groupe 1.5 : planificateur multi-moteurs et vérification des résultats.
