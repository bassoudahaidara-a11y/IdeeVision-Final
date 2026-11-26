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



## Groupe 1.5 — Planificateur multi-moteurs et vérification des résultats (24 tâches)

| # | Tâche | État |
|---:|---|---|
| 1 | Détecter plusieurs domaines dans une demande | Développé, règles heuristiques |
| 2 | Déclarer les capacités attendues des moteurs | Développé |
| 3 | Associer les tâches aux capacités | Développé |
| 4 | Décomposer la demande en tâches identifiées | Développé |
| 5 | Construire un graphe de dépendances | Développé |
| 6 | Vérifier les dépendances inconnues | Développé |
| 7 | Détecter les cycles de dépendances | Développé |
| 8 | Trier les tâches selon leurs dépendances | Développé |
| 9 | Attribuer une priorité aux tâches | Développé |
| 10 | Former des phases de tâches parallélisables | Développé, planification uniquement |
| 11 | Identifier les moteurs candidats | Développé |
| 12 | Signaler les capacités sans moteur déclaré | Développé |
| 13 | Produire un plan multi-domaines | Développé |
| 14 | Générer un contexte de planification pour le générateur | Développé |
| 15 | Valider la présence et le type d'une sortie | Développé |
| 16 | Vérifier des exigences textuelles explicites | Développé |
| 17 | Repérer des divergences numériques possibles | Développé, heuristique |
| 18 | Signaler les résultats nécessitant une revue | Développé |
| 19 | Enregistrer le statut d'une tâche | Développé |
| 20 | Compter les tentatives et borner les reprises | Développé, suivi d'état |
| 21 | Conserver les erreurs de tâche de façon limitée | Développé |
| 22 | Produire un résumé de progression | Développé |
| 23 | Fournir les diagnostics et limites du planificateur | Développé |
| 24 | Ajouter 24 tests automatisés | Écrit, exécution CI à confirmer |

### Intégration et limites du groupe 1.5

Le pipeline crée désormais un plan multi-domaines avant de demander la conception de la scène et transmet ce plan au générateur. Le module peut répartir des tâches sur des capacités déclarées, ordonner les dépendances, identifier les capacités manquantes et préparer des phases parallélisables.

**Limite importante :** à ce stade, le planificateur ne lance pas lui-même plusieurs modèles ou moteurs indépendants. Les moteurs spécialisés sont encore des capacités déclarées et des cibles de planification ; seule la chaîne de génération existante est effectivement appelée. Les comparaisons de résultats numériques sont des alertes heuristiques, pas une preuve de contradiction. Les tentatives sont suivies dans le plan mais aucun effet externe n'est relancé automatiquement.

Le planificateur fonctionne localement, sans requête réseau. La génération de scènes de l'application utilise toujours le service Groq déjà configuré ; l'ajout de ce planificateur ne rend donc pas l'application entièrement hors ligne.


## Groupe 1.6 — Vérification scientifique et calculs contrôlés (36 tâches)

| # | Tâche | État |
|---:|---|---|
| 1 | Déclarer un registre d'unités SI courantes | Développé |
| 2 | Définir les facteurs de conversion | Développé |
| 3 | Analyser une quantité et son unité | Développé |
| 4 | Convertir les unités d'une même dimension | Développé |
| 5 | Refuser les conversions de dimensions différentes | Développé |
| 6 | Extraire plusieurs grandeurs d'une demande | Développé |
| 7 | Détecter des formules candidates | Développé, règles lexicales |
| 8 | Vérifier la compatibilité de deux dimensions | Développé |
| 9 | Contrôler une liste de dimensions | Développé |
| 10 | Effectuer des opérations arithmétiques autorisées | Développé, sans eval |
| 11 | Refuser la division par zéro | Développé |
| 12 | Borner les exposants | Développé |
| 13 | Compter les chiffres significatifs | Développé |
| 14 | Arrondir selon les chiffres significatifs | Développé |
| 15 | Comparer deux résultats avec tolérance | Développé |
| 16 | Contrôler une valeur positive | Développé |
| 17 | Vérifier un intervalle annoncé | Développé |
| 18 | Valider l'inégalité triangulaire | Développé |
| 19 | Vérifier les dimensions d'un rectangle | Développé |
| 20 | Calculer une vitesse moyenne | Développé |
| 21 | Calculer une masse volumique | Développé |
| 22 | Appliquer la deuxième loi de Newton | Développé |
| 23 | Calculer le poids avec la gravité terrestre | Développé |
| 24 | Appliquer la loi d'Ohm | Développé |
| 25 | Calculer l'énergie cinétique | Développé |
| 26 | Comparer une conservation énergétique à une tolérance | Développé |
| 27 | Vérifier la forme entière et positive de coefficients chimiques | Développé, sans équilibrage automatique |
| 28 | Calculer une concentration molaire | Développé |
| 29 | Détecter quelques risques de calcul dans le texte | Développé, heuristique |
| 30 | Valider la présence d'un résultat numérique | Développé |
| 31 | Vérifier la compatibilité de l'unité d'un résultat | Développé |
| 32 | Fournir des constantes physiques usuelles | Développé |
| 33 | Construire un audit scientifique d'une demande | Développé |
| 34 | Produire un contexte prudent pour le générateur | Développé |
| 35 | Exposer les diagnostics du moteur | Développé |
| 36 | Ajouter 36 tests automatisés | Développé |

### Intégration et limites du groupe 1.6

Le moteur scientifique est chargé dans l'application. Avant la génération, il analyse la demande, extrait certaines quantités, suggère des formules candidates et ajoute des alertes et règles de vérification au contexte transmis au générateur.

Les calculs déterministes exposés par le module peuvent être testés directement. En revanche, le branchement au générateur reste un contexte de vérification : le module ne recalcule pas automatiquement chaque réponse produite par le modèle et ne certifie pas une solution. Le catalogue de formules et la reconnaissance des unités sont limités aux éléments explicitement implémentés. Le contrôle de coefficients chimiques ne vérifie pas l'équilibrage des équations. Les alertes lexicales peuvent manquer des erreurs ou signaler à tort un risque.

Le moteur fonctionne localement et ne nécessite pas de service distant pour ses opérations. La génération de films/scènes utilise toujours le service Groq configuré dans l'application. Aucun APK n'est compilé à cette étape.


## Groupe 1.7 — Moteur mathématique et calcul symbolique (38 tâches)

| # | Tâche | État |
|---:|---|---|
| 1 | Créer un tokenizer mathématique | Développé |
| 2 | Construire un parseur récursif sécurisé | Développé |
| 3 | Accepter les nombres décimaux | Développé |
| 4 | Reconnaître la variable x | Développé |
| 5 | Gérer les parenthèses | Développé |
| 6 | Respecter les priorités opératoires | Développé |
| 7 | Gérer les puissances entières | Développé |
| 8 | Évaluer une expression numérique | Développé |
| 9 | Refuser les caractères et fonctions inconnus | Développé |
| 10 | Refuser les divisions par zéro | Développé |
| 11 | Convertir les expressions en polynômes | Développé, degré limité à 8 |
| 12 | Additionner et soustraire les polynômes | Développé |
| 13 | Multiplier les polynômes | Développé |
| 14 | Simplifier les expressions polynomiales | Développé |
| 15 | Calculer la dérivée des polynômes | Développé |
| 16 | Calculer une primitive polynomiale | Développé |
| 17 | Résoudre les équations linéaires | Développé |
| 18 | Distinguer identité et équation impossible | Développé |
| 19 | Calculer le discriminant | Développé |
| 20 | Résoudre les équations du second degré réelles | Développé |
| 21 | Détecter les équations de degré non pris en charge | Développé |
| 22 | Résoudre une équation polynomiale des deux côtés | Développé, degrés 1 et 2 |
| 23 | Résoudre un système linéaire 2×2 | Développé |
| 24 | Détecter les systèmes singuliers | Développé |
| 25 | Construire une table de valeurs | Développé |
| 26 | Vérifier des racines par substitution | Développé |
| 27 | Signaler quelques restrictions de domaine | Développé, heuristique |
| 28 | Calculer moyenne et médiane | Développé |
| 29 | Calculer le PGCD | Développé |
| 30 | Calculer le PPCM | Développé |
| 31 | Réduire une fraction rationnelle simple | Développé |
| 32 | Calculer un pourcentage | Développé |
| 33 | Calculer le sommet d'une parabole | Développé |
| 34 | Construire un audit de demande mathématique | Développé |
| 35 | Générer des consignes de vérification | Développé |
| 36 | Exposer les diagnostics hors ligne | Développé |
| 37 | Limiter la taille des expressions et les degrés | Développé |
| 38 | Ajouter 38 tests automatisés | Développé |

### Intégration et limites du groupe 1.7

Le moteur est chargé avant la génération. Il repère certains sujets mathématiques dans la demande et ajoute des consignes de prudence au contexte envoyé au générateur. Ses fonctions de calcul symbolique sont accessibles au code de l'application.

Le parseur accepte uniquement les opérations arithmétiques élémentaires, les parenthèses et la variable x. Il ne prend pas encore en charge les fonctions trigonométriques, logarithmiques, exponentielles, les matrices générales, les nombres complexes, ni les intégrales définies. La résolution exacte est limitée aux équations polynomiales de degrés 1 et 2 et aux systèmes linéaires 2×2. Les primitives sont calculées pour les polynômes seulement. Ce moteur n'est pas un logiciel de calcul formel complet.

Aucun APK n'est compilé à cette étape ; les vérifications restent automatisées sur GitHub.


## Groupe 1.8 — Intelligence géométrique et géométrie analytique (46 tâches)

| # | Tâche | État |
|---:|---|---|
| 1 | Valider les coordonnées finies | Développé |
| 2 | Valider les listes de points et leurs limites | Développé |
| 3 | Calculer la distance euclidienne | Développé |
| 4 | Calculer le milieu d'un segment | Développé |
| 5 | Construire un vecteur entre deux points | Développé |
| 6 | Calculer produit scalaire et produit vectoriel | Développé |
| 7 | Calculer la norme d'un vecteur | Développé |
| 8 | Déterminer une pente et reconnaître les droites verticales | Développé |
| 9 | Construire l'équation normalisée d'une droite | Développé |
| 10 | Calculer l'intersection de deux droites | Développé |
| 11 | Distinguer droites parallèles ou confondues | Développé |
| 12 | Projeter un point sur une droite | Développé |
| 13 | Calculer la distance point-droite | Développé |
| 14 | Calculer l'aire d'un cercle | Développé |
| 15 | Calculer la circonférence d'un cercle | Développé |
| 16 | Déterminer la position d'un point par rapport à un cercle | Développé |
| 17 | Calculer l'aire d'un triangle par coordonnées | Développé |
| 18 | Calculer aire et périmètre par la formule de Héron | Développé |
| 19 | Refuser les triangles impossibles | Développé |
| 20 | Classifier un triangle par ses côtés et ses angles | Développé |
| 21 | Calculer un angle par produit scalaire | Développé, radians |
| 22 | Convertir degrés et radians | Développé |
| 23 | Calculer l'aire d'un polygone (formule du lacet) | Développé |
| 24 | Calculer l'aire orientée | Développé |
| 25 | Calculer le périmètre d'un polygone | Développé |
| 26 | Calculer le centroïde d'un polygone | Développé |
| 27 | Tester si un point est dans un polygone | Développé |
| 28 | Détecter un point sur la frontière d'un polygone | Développé |
| 29 | Détecter l'intersection de segments | Développé |
| 30 | Reconnaître des segments colinéaires | Développé |
| 31 | Calculer les intersections cercle-droite | Développé |
| 32 | Détecter la tangence cercle-droite | Développé |
| 33 | Calculer les intersections de deux cercles | Développé |
| 34 | Détecter la tangence de deux cercles | Développé |
| 35 | Effectuer une translation | Développé |
| 36 | Effectuer une rotation autour d'un centre | Développé, angle en radians |
| 37 | Effectuer une homothétie | Développé |
| 38 | Effectuer une symétrie axiale | Développé |
| 39 | Calculer le centre du cercle circonscrit | Développé |
| 40 | Détecter trois points alignés pour le cercle circonscrit | Développé |
| 41 | Calculer une boîte englobante | Développé |
| 42 | Rejeter les coordonnées non finies | Développé |
| 43 | Rejeter les rayons négatifs | Développé |
| 44 | Détecter les sujets géométriques dans une demande | Développé |
| 45 | Générer des consignes de vérification géométrique | Développé |
| 46 | Ajouter 46 tests automatisés | Développé |

### Intégration et limites du groupe 1.8

Le moteur est chargé dans l'application et son audit ajoute des consignes géométriques au contexte de génération. Les fonctions de calcul sont accessibles sous `window.IdeeVisionGeometry`.

Cette version traite la géométrie plane en 2D. Elle ne crée pas encore de figures interactives à l'écran et ne constitue pas un moteur de géométrie 3D. Les cas de segments colinéaires sont signalés comme tels, sans calculer leur éventuelle zone de recouvrement. Les rotations utilisent les radians. Les calculs numériques utilisent une tolérance pour les approximations.

Aucun APK n'est compilé à ce groupe ; le workflow exécute uniquement les contrôles et tests.


## Groupe 1.9 — Physique avancée et mécanique (50 tâches)

Le moteur `physics-mechanics-engine-v1.js` est chargé dans l'application. Son audit ajoute un contexte de vérification au prompt de génération.

| # | Fonctionnalité | État |
|---:|---|---|
| 1 | Addition de vecteurs | Développé |
| 2 | Soustraction de vecteurs | Développé |
| 3 | Norme d'un vecteur 3D | Développé |
| 4 | Produit scalaire | Développé |
| 5 | Multiplication d'un vecteur par un scalaire | Développé |
| 6 | Accélération résultant de F = ma | Développé |
| 7 | Force résultante par la deuxième loi de Newton | Développé |
| 8 | Poids avec gravité standard | Développé |
| 9 | Mouvement rectiligne à accélération constante | Développé |
| 10 | Vitesse moyenne | Développé |
| 11 | Accélération moyenne | Développé |
| 12 | Mouvement circulaire uniforme | Développé |
| 13 | Force centripète | Développé |
| 14 | Énergie cinétique | Développé |
| 15 | Énergie potentielle de pesanteur | Développé |
| 16 | Énergie mécanique | Développé |
| 17 | Travail d'une force et angle | Développé |
| 18 | Travail nul pour une force perpendiculaire | Développé |
| 19 | Puissance mécanique moyenne | Développé |
| 20 | Rendement énergétique en pourcentage | Développé |
| 21 | Quantité de mouvement vectorielle | Développé |
| 22 | Impulsion d'une force | Développé |
| 23 | Variation de quantité de mouvement | Développé |
| 24 | Loi de gravitation universelle | Développé |
| 25 | Force de rappel d'un ressort (Hooke) | Développé |
| 26 | Énergie potentielle élastique | Développé |
| 27 | Force de frottement simple | Développé |
| 28 | Décomposition du poids sur un plan incliné | Développé |
| 29 | Moment d'une force (couple) | Développé |
| 30 | Énergie cinétique de rotation | Développé |
| 31 | Moment cinétique | Développé |
| 32 | Masse volumique | Développé |
| 33 | Pression mécanique | Développé |
| 34 | Pression hydrostatique | Développé |
| 35 | Poussée d'Archimède | Développé |
| 36 | Période d'un oscillateur masse-ressort | Développé |
| 37 | Période d'un pendule simple | Développé |
| 38 | Fréquence d'un oscillateur masse-ressort | Développé |
| 39 | Collision parfaitement inélastique en 1D | Développé |
| 40 | Conversion d'unités de distance, temps, masse, vitesse, force, énergie, puissance et pression | Développé |
| 41 | Conversion km/h vers m/s | Développé |
| 42 | Refus des conversions entre grandeurs incompatibles | Développé |
| 43 | Validation de masse non nulle dans F/m | Développé |
| 44 | Validation des durées pour la puissance | Développé |
| 45 | Validation de distance non nulle pour la gravitation | Développé |
| 46 | Validation de volume non nul pour la masse volumique | Développé |
| 47 | Détection des sujets physiques dans la demande | Développé |
| 48 | Consignes sur unités SI, hypothèses et référentiels | Développé |
| 49 | Diagnostics du moteur hors ligne | Développé |
| 50 | Tests automatisés du moteur | 50 tests ajoutés |

### Formules et limites du groupe 1.9

Le moteur couvre notamment (F=ma), (P=mg), (E_c=\frac12mv^2), (E_p=mgh), (W=Fd\cos(\theta)), (P=W/\Delta t), la gravitation universelle, la loi de Hooke et la poussée d'Archimède.

Les calculs utilisent les unités SI. Le mouvement cinématique suppose une accélération constante. Le pendule simple utilise l'approximation des petites oscillations. Le modèle de collision suppose une collision parfaitement inélastique sur une seule dimension. Les modèles ne remplacent pas une simulation numérique complète ni une validation expérimentale.

Le moteur fournit des fonctions de calcul et des consignes au générateur ; il ne simule pas encore visuellement les mécanismes en temps réel. Aucun APK n'est compilé à ce groupe : le workflow GitHub exécute seulement les vérifications et tests.


## Groupe 1.10 — Simulation numérique des systèmes physiques (52 tâches)

| # | Fonction | État |
|---:|---|---|
| 1 | Intégration numérique d'Euler | Développé et testé |
| 2 | Méthode du point milieu | Développé et testé |
| 3 | Runge-Kutta d'ordre 4 (RK4) | Développé et testé |
| 4 | Validation des états numériques | Développé et testé |
| 5 | Vérification de compatibilité des dimensions d'état | Développé et testé |
| 6 | Refus des pas de temps nuls ou négatifs | Développé et testé |
| 7 | Détection des valeurs non finies | Développé et testé |
| 8 | Simulation à pas de temps fixe | Développé et testé |
| 9 | Dernier pas ajusté à la durée demandée | Développé et testé |
| 10 | Limite de sécurité du nombre de pas | Développé et testé |
| 11 | Détection de divergence numérique | Développé et testé |
| 12 | Intégration semi-implicite pour position-vitesse | Développé et testé |
| 13 | Modèle masse-ressort-amortisseur | Développé et testé |
| 14 | Force extérieure variable ou constante sur le ressort | Développé et testé |
| 15 | Calcul de l'énergie de l'oscillateur | Développé et testé |
| 16 | Diagnostic de dissipation par amortissement | Développé et testé |
| 17 | Pendule simple non linéaire | Développé et testé |
| 18 | Prise en compte de l'amortissement du pendule | Développé et testé |
| 19 | Calcul de l'énergie du pendule | Développé et testé |
| 20 | Conservation des séries temps et états | Développé et testé |
| 21 | Dérivée numérique centrée et aux bords | Développé et testé |
| 22 | Intégration par trapèzes | Développé et testé |
| 23 | Intégration de Simpson | Développé et testé |
| 24 | Interpolation d'une valeur à un instant | Développé et testé |
| 25 | Refus des instants hors de la série | Développé et testé |
| 26 | Comparaison de deux pas pour estimer l'erreur | Développé et testé |
| 27 | Analyse de la tendance énergétique | Développé et testé |
| 28 | Calcul de l'amplitude maximale | Développé et testé |
| 29 | Comptage des passages par zéro | Développé et testé |
| 30 | Conversion période-fréquence | Développé et testé |
| 31 | Calcul de la pulsation | Développé et testé |
| 32 | Fréquence propre d'un ressort | Développé et testé |
| 33 | Taux d'amortissement | Développé et testé |
| 34 | Classification sous-amortie | Développé et testé |
| 35 | Classification critique | Développé et testé |
| 36 | Classification sur-amortie | Développé et testé |
| 37 | Décroissance exponentielle | Développé et testé |
| 38 | Construction d'une grille temporelle | Développé et testé |
| 39 | Rééchantillonnage d'une série | Développé et testé |
| 40 | Valeur quadratique moyenne (RMS) | Développé et testé |
| 41 | Moyenne d'une série numérique | Développé et testé |
| 42 | Validation des options de simulation | Développé et testé |
| 43 | Détection des thèmes de simulation | Développé et testé |
| 44 | Construction d'un contexte explicatif pour le générateur | Développé et testé |
| 45 | Déclaration des unités SI et hypothèses | Développé et testé |
| 46 | Contrôle de convergence par raffinement du pas | Développé et testé |
| 47 | Protection contre les simulations trop longues | Développé et testé |
| 48 | Diagnostics hors ligne | Développé et testé |
| 49 | Tests des trois méthodes d'intégration | Développé et testé |
| 50 | Tests de l'oscillateur et du pendule | Développé et testé |
| 51 | Tests des outils d'analyse numérique | Développé et testé |
| 52 | Tests automatisés de diagnostic et d'audit | Développé et testé |

### Intégration dans Idée Vision

Le fichier `numerical-simulation-v1.js` est chargé par `index.html`. Avant la génération, l'application analyse les demandes liées à la simulation, prépare un contexte qui précise les méthodes disponibles, les unités SI, le pas de temps, les conditions initiales et la nécessité de vérifier la convergence. Le moteur expose aussi des fonctions exécutables de simulation et d'analyse, accessibles depuis JavaScript.

### Limites scientifiques

Les simulations sont des modèles numériques pédagogiques. Elles dépendent des paramètres fournis et du pas de temps ; une sortie numérique n'est pas une mesure réelle. L'estimation par comparaison de pas est un indicateur, pas une borne mathématique universelle de l'erreur. Les modèles actuels couvrent l'oscillateur masse-ressort-amortisseur et le pendule simple non linéaire, sans prétendre simuler toute la physique. Le moteur est local, mais la génération de films et de scènes continue d'utiliser le service distant déjà présent.

## Contrôle de version par groupes de dix

À partir de la version 1.10.0, chaque bloc de dix groupes donne lieu à une vérification complète : présence des fichiers, chargement des moteurs dans l'application, tests automatisés, compilation Android et publication de l'APK de contrôle. Le nom affiché est **Idée Vision** et l'icône Android porte désormais le monogramme **IV**. Le code de version Android de ce jalon est 10.
