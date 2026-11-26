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

## Groupe 1.2 — Mémoire de travail et contexte conversationnel (22 tâches)

| # | Tâche | État |
|---:|---|---|
| 1 | Créer une mémoire de travail locale | Développé |
| 2 | Séparer les messages utilisateur et assistant | Développé |
| 3 | Nettoyer les messages avant stockage | Développé |
| 4 | Limiter le nombre de tours conservés | Développé |
| 5 | Limiter la taille totale de la mémoire | Développé |
| 6 | Refuser les messages vides | Développé |
| 7 | Extraire des mots-clés de contexte | Développé |
| 8 | Construire une liste de sujets récents | Développé |
| 9 | Détecter les demandes de continuation | Développé |
| 10 | Détecter les pronoms et démonstratifs | Développé |
| 11 | Résoudre les références avec les sujets précédents | Développé, heuristique |
| 12 | Signaler les références impossibles à résoudre | Développé |
| 13 | Distinguer une nouvelle demande d'un suivi | Développé |
| 14 | Résumer les tours de conversation | Développé |
| 15 | Construire un contexte lisible pour les moteurs | Développé |
| 16 | Effacer la mémoire de session | Développé |
| 17 | Exporter un historique structuré | Développé |
| 18 | Importer un historique validé | Développé |
| 19 | Refuser les formats d'import inconnus | Développé |
| 20 | Afficher les diagnostics de mémoire | Développé |
| 21 | Associer une intention à un tour | Développé |
| 22 | Garder la mémoire volatile par défaut | Développé |

### Confidentialité et limites

La mémoire est conservée uniquement en mémoire vive pendant la session. Aucun stockage persistant n'est activé automatiquement. L'export et l'import sont explicites. La résolution des pronoms est heuristique : si plusieurs objets sont possibles, le moteur devra demander une précision au lieu d'inventer le référent.

Le pipeline de conception reçoit désormais le contexte des échanges précédents avant de préparer les plans. Le module ne rend pas encore l'application autonome : le générateur de scène utilise toujours le service de conversation déjà présent.


## Groupe 1.3 — Raisonnement logique et résolution de problèmes (25 tâches)

| # | Tâche | État |
|---:|---|---|
| 1 | Détecter le domaine général du problème | Développé, heuristique |
| 2 | Extraire les nombres fournis | Développé |
| 3 | Extraire les unités connues | Développé |
| 4 | Décomposer une demande en sous-problèmes | Développé |
| 5 | Repérer les résultats inconnus | Développé, heuristique |
| 6 | Distinguer les faits chiffrés des éléments à trouver | Développé |
| 7 | Extraire les contraintes hors ligne | Développé |
| 8 | Extraire les contraintes de langue | Développé |
| 9 | Repérer certaines restrictions explicites | Développé |
| 10 | Détecter un conflit hors ligne / recherche web | Développé |
| 11 | Détecter un conflit gratuit / paiement obligatoire | Développé |
| 12 | Détecter un conflit sur l'utilisation des données | Développé |
| 13 | Identifier les hypothèses liées aux unités | Développé |
| 14 | Repérer les valeurs approximatives | Développé |
| 15 | Choisir une stratégie mathématique | Développé |
| 16 | Choisir une stratégie physique | Développé |
| 17 | Choisir une stratégie de programmation | Développé |
| 18 | Choisir une stratégie de conception | Développé |
| 19 | Choisir une stratégie biologique | Développé |
| 20 | Construire un plan de résolution ordonné | Développé |
| 21 | Déclarer les dépendances entre étapes | Développé |
| 22 | Vérifier les dépendances et étapes obligatoires | Développé |
| 23 | Comparer deux plans de résolution | Développé |
| 24 | Générer un contexte de raisonnement pour le modèle | Développé |
| 25 | Ajouter 25 tests automatisés | Écrit, exécution CI à confirmer |

### Limites du groupe 1.3

Ce moteur est une aide de structuration heuristique : il ne prouve pas mathématiquement une solution, ne remplace pas un solveur spécialisé et ne constitue pas une intelligence générale. La détection des domaines, hypothèses et conflits peut manquer des formulations. Les données absentes ne doivent pas être inventées : le générateur doit demander une précision lorsque celle-ci est indispensable. Le contexte transmis au modèle contient un résumé de méthode vérifiable, pas un raisonnement privé détaillé.

Le pipeline ajoute maintenant le plan logique au contexte de conception avant de demander la génération de la scène.


## Groupe 1.4 — Gestion des connaissances et des sources (26 tâches)

| # | Tâche | État |
|---:|---|---|
| 1 | Importer des fichiers texte depuis l'appareil | Développé |
| 2 | Prendre en charge TXT | Développé |
| 3 | Prendre en charge Markdown (MD) | Développé |
| 4 | Prendre en charge CSV | Développé |
| 5 | Prendre en charge JSON valide | Développé |
| 6 | Prendre en charge LOG et XML | Développé |
| 7 | Vérifier l'extension des fichiers | Développé |
| 8 | Contrôler la taille maximale d'un fichier | Développé |
| 9 | Refuser les documents vides | Développé |
| 10 | Nettoyer le texte importé | Développé |
| 11 | Découper les documents en extraits avec chevauchement | Développé |
| 12 | Tokeniser les extraits et normaliser les accents | Développé |
| 13 | Construire un index de recherche local | Développé, calcul du score à la recherche |
| 14 | Classer les extraits par pertinence | Développé, score lexical de type TF-IDF |
| 15 | Retrouver les passages pertinents selon la demande | Développé |
| 16 | Conserver le nom du document comme source | Développé |
| 17 | Ajouter les extraits trouvés au contexte du générateur | Développé |
| 18 | Séparer les documents de référence des instructions | Développé, consigne de prudence dans le contexte |
| 19 | Enregistrer les documents dans IndexedDB | Développé |
| 20 | Lister les documents importés | Développé |
| 21 | Supprimer un document individuellement | Développé |
| 22 | Effacer toute la base locale | Développé |
| 23 | Exporter une archive structurée | Développé dans le moteur |
| 24 | Importer une archive structurée validée | Développé dans le moteur |
| 25 | Fournir des diagnostics de la base | Développé |
| 26 | Ajouter 26 tests automatisés | Écrit, exécution CI à confirmer |

### Utilisation dans l'application

Dans les réglages, la section **Ma base de connaissances** permet de sélectionner des fichiers depuis l'appareil, de les ajouter, de voir les documents importés et de les supprimer. Avant la génération, Idée Vision recherche les extraits qui correspondent à la demande et transmet les passages retrouvés avec le nom de leur document source.

Les documents sont stockés localement dans IndexedDB. La recherche est lexicale et approximative : elle ne comprend pas encore le sens profond des textes comme un modèle vectoriel. Les noms de fichiers et les extraits sont transmis au service de génération lorsque celui-ci est appelé.

### Limites et sécurité des sources

- Formats pris en charge actuellement : TXT, MD, CSV, JSON, LOG et XML.
- PDF et DOCX ne sont pas encore pris en charge : ils sont explicitement refusés, sans prétendre avoir extrait leur contenu.
- Limites actuelles : 3 Mo par fichier, 40 documents et 1 200 000 caractères dans la base par défaut.
- La recherche classe les passages par correspondance lexicale ; elle peut manquer une formulation sémantiquement proche.
- Les documents importés sont des données non fiables. Le contexte demande au modèle de ne pas suivre les instructions contenues dans ces documents.
- L'application n'effectue pas encore de vérification externe de la véracité d'un document ou de son auteur.
- L'effacement des données de l'application ou du navigateur peut supprimer la base IndexedDB.

