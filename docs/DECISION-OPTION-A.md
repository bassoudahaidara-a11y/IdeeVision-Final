# Décision d'architecture — Option A : intelligence spécialisée construite en interne

Date : 26 novembre 2026
Statut : décision retenue

## Décision

Idée Vision ne dépendra pas d'un grand modèle de langage pré-entraîné pour comprendre, raisonner ou connaître les sciences. Nous construisons progressivement notre propre système spécialisé, composé de modules déterministes, de bases de connaissances structurées, de règles vérifiables, de validateurs et de moteurs de simulation.

Les modèles locaux déjà présents sur le téléphone de l'utilisateur ne sont pas une dépendance du projet. Aucun modèle externe ne sera requis pour les fonctions fondamentales d'Idée Vision.

## Ce que « depuis zéro » signifie ici

Nous écrivons nous-mêmes :
1. le vocabulaire et l'analyse des formulations françaises ;
2. la représentation interne des idées et des objets ;
3. les règles de composition et de raisonnement ;
4. les connaissances scientifiques structurées et leurs domaines de validité ;
5. les calculs numériques et les solveurs ;
6. les constructeurs de scènes 2D/3D ;
7. les animations et interactions ;
8. les tests de référence et les mécanismes de détection d'incertitude.

Cela ne signifie pas entraîner immédiatement un modèle neuronal fondamental avec des milliards de paramètres. Un tel entraînement nécessite des données et des ressources informatiques très importantes. Notre option A consiste à construire notre propre intelligence fonctionnelle spécialisée, testable et extensible, sans dépendre d'un LLM externe. Une éventuelle recherche neuronale ultérieure ne pourra être qu'une option facultative, jamais une exigence de fonctionnement.

## Architecture modulaire cible

```text
Phrase française / transcription vocale
                |
                v
1. Analyse linguistique et lexique
                |
                v
2. Compréhension structurée de l'idée
                |
                v
3. Raisonnement symbolique et planification
                |
        +-------+--------+
        |                |
        v                v
4. Connaissances     5. Constructeur
   scientifiques       de scène 2D/3D
        |                |
        v                v
6. Solveurs et       7. Animation et
   simulations          interaction
        +-------+--------+
                |
                v
8. Validation, explication et résultat
```

Chaque module aura un contrat d'entrée/sortie, des limites explicites, des tests unitaires et des exemples de référence. Les modules pourront évoluer séparément sans casser l'interface.

## Architecture scientifique

Les connaissances ne seront pas de simples paragraphes mémorisés. Chaque loi ou modèle sera enregistré avec :
- son domaine (mécanique, thermique, électricité, optique, chimie, biologie, etc.) ;
- ses variables et unités ;
- ses équations et conditions d'application ;
- ses hypothèses et limites ;
- un calculateur ou solveur associé ;
- des cas de test avec résultats attendus ;
- une explication accessible en français.

Une simulation devra distinguer le modèle idéal, les approximations et les paramètres manquants. Le système ne devra jamais présenter un résultat approximatif comme une validation expérimentale réelle.

## Progression de construction

- Étape 01 : langage, représentation des idées, raisonnement général et clarification.
- Étape 02 : planification et conception d'objets/mécanismes.
- Étape 03 : géométrie et construction 3D.
- Étape 04 : animation et interaction.
- Étape 05 : bibliothèques de lois scientifiques, unités, calculateurs et simulations.
- Étape 06 : intégration, tests de bout en bout et mesures sur le téléphone.

Les connaissances scientifiques seront préparées avec des modules autonomes dès que leurs fondations sont nécessaires, puis intégrées complètement dans l'étape 05.

## Contraintes du téléphone

Le téléphone Android est la cible d'exécution, pas la machine sur laquelle nous prétendons entraîner un grand modèle. Les modules seront conçus pour être légers : calculs ciblés, structures de données compactes, limites de complexité, chargement à la demande et absence de réseau obligatoire. Les mesures réelles sur l'appareil seront nécessaires avant de fixer les plafonds de complexité.

## Règles non négociables

- Aucun modèle pré-entraîné obligatoire.
- Aucun accès Internet nécessaire aux fonctions fondamentales.
- Aucune exécution de code arbitraire produit par une interprétation.
- Toute relation, unité, formule et action est validée avant utilisation.
- Une inconnue ou une ambiguïté déclenche une question, pas une invention.
- Aucune compilation Android sans autorisation explicite de l'utilisateur.


## Bibliothèque évolutive de connaissances

Le moteur principal est extensible par une bibliothèque de connaissances séparée du code. L'utilisateur peut importer depuis les paramètres des paquets JSON hors ligne. Le gestionnaire valide la structure, refuse les entrées invalides ou dupliquées, puis enregistre les entrées acceptées en brouillon. L'utilisateur peut les examiner, les activer, les désactiver ou les supprimer.

Les données validées sont conservées dans le stockage local de l'application et ne dépendent plus du fichier importé. La suppression du fichier source n'efface donc pas les connaissances enregistrées. Une sauvegarde/export est nécessaire pour les préserver en cas d'effacement des données ou de désinstallation.

Les fichiers importés sont traités comme des données, jamais comme du code exécutable. Une formule déclarative ne devient utilisable que si un solveur compatible sait l'interpréter. L'ajout de connaissances ne nécessite pas une réinstallation ; l'ajout d'un nouvel algorithme peut encore nécessiter une mise à jour du moteur.

## Première démonstration 3D filaire

Le moteur de scène réutilise les maillages polygonaux déjà définis et peut les afficher en fil de fer : seules les arêtes des faces sont tracées. Le choix est accessible dans les paramètres et mémorisé localement. Ce mode est un rendu de visualisation, pas encore un éditeur 3D interactif.
