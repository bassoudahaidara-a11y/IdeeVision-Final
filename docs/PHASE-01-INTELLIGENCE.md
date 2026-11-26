# Étape 01 — Moteur d'intelligence et de compréhension

## Objectif
Construire une intelligence spécialisée Idée Vision, utilisable hors ligne, qui comprend des demandes françaises libres, conserve les concepts nouveaux, demande des précisions et produit des données structurées contrôlées.

## Architecture retenue
1. Interface texte et future transcription vocale.
2. Compréhension française : analyse lexicale, grammaire de règles et représentation structurée développées en interne.
3. Contrat JSON versionné.
4. Validation stricte des objets, propriétés, relations, actions et limites.
5. Clarification des demandes incomplètes.
6. Adaptateur vers les moteurs de conception et de scène.
7. Corpus français versionné et évaluations reproductibles.
8. Tests de référence et mesure des performances sur Android ; aucun runtime neuronal externe requis.

## État du code
- `french-understanding-v1.js` : analyse lexicale initiale, limitée à un vocabulaire connu.
- `idea-understanding-contract-v1.js` : contrat JSON strict et conversion du résultat lexical.
- `index.html` : charge le contrat et le moteur lexical ; conserve le moteur de scène et l'apparence existants. Le résultat structuré est validé et conservé pour diagnostic, mais ne pilote pas encore la scène.
- `training/phase01/examples-fr-v0.2.jsonl` : corpus français élargi (139 exemples : formulations standard, orales, fautes courantes et descriptions multi-objets).
- `training/phase01/system-prompt-fr-v0.1.md` : consignes destinées au futur modèle.
- `training/phase01/MODEL-SELECTION.md` : protocole de sélection et de mesure.
- Décision Option A : aucun modèle neuronal externe ne sera requis. Le moteur spécialisé sera développé en interne.

## Les cinq chantiers

### 1. Corpus français
- [x] Élargir le corpus initial à des demandes de création, simulation et explication.
- [x] Ajouter un contrôle automatique de format et de conformité au contrat.
- [x] Ajouter des paraphrases orales, des synonymes et quelques fautes courantes.
- [ ] Ajouter des demandes longues, complexes et multi-étapes.
- [ ] Faire vérifier les exemples ambigus et corriger les étiquettes.
- [x] Séparer les ensembles entraînement, validation et test par familles de signatures sémantiques.
- [ ] Relire manuellement toutes les annotations et mesurer la couverture réelle des intentions.

### 2. Contrat de compréhension
- [x] Définir les intentions, modes, objets, quantités, propriétés, dimensions, relations et actions.
- [x] Contrôler les références, les identifiants, les tailles et les valeurs.
- [x] Rejeter les champs inconnus et le code arbitraire.
- [x] Autoriser une sortie sans objet uniquement si une clarification est demandée.
- [ ] Ajouter les contraintes mécaniques, unités avancées et références aux connaissances scientifiques.
- [ ] Stabiliser l'adaptateur vers le schéma du moteur 3D.

### 3. Architecture d'intelligence interne
- [x] Retenir l'Option A : construire le moteur spécialisé en interne.
- [x] Définir les modules langage, représentation, raisonnement, connaissances, calcul et validation.
- [ ] Définir les contrats techniques entre chaque module.
- [ ] Implémenter le moteur de raisonnement symbolique.
- [ ] Mesurer mémoire, vitesse et stabilité des moteurs internes sur Android.

### 4. Préparation des connaissances et des règles
- [x] Définir un format JSONL d'exemples et sorties attendues pour les tests de compréhension.
- [x] Ajouter un test automatique du corpus.
- [x] Constituer des ensembles séparés sans fuite évidente entre familles sémantiques.
- [ ] Nettoyer les annotations par revue humaine.
- [ ] Construire le catalogue des règles de compréhension et de raisonnement.

### 5. Intégration progressive
- [x] Charger le contrat et la compréhension lexicale dans la WebView.
- [x] Valider et conserver le résultat structuré à titre de diagnostic.
- [x] Préserver l'interface et le moteur de scène existants.
- [x] Ajouter un gestionnaire local de connaissances importées en JSON (brouillon, activation, désactivation, suppression).
- [x] Ajouter un premier écran Paramètres pour gérer les connaissances et le mode filaire.
- [ ] Intégrer progressivement les modules internes validés.
- [ ] Vérifier le fonctionnement hors ligne sur le téléphone réel.

## Décision Option A
Idée Vision sera un moteur spécialisé construit en interne, sans dépendance obligatoire à un LLM pré-entraîné. Voir `docs/DECISION-OPTION-A.md` pour l'architecture cible et les règles de conception. Les modèles présents sur le téléphone ne sont pas nécessaires au fonctionnement du projet.

## Règle de compilation
**Aucune compilation Android ne doit être lancée sans autorisation explicite de l'utilisateur.** Le workflow automatique est limité aux tests JavaScript et ne lance ni Gradle ni la création d'APK. Les vérifications de code ne valent pas validation sur téléphone.

## Critères de fin
L'étape 01 ne sera terminée que lorsque le moteur interne interprète les demandes couvertes, produit des structures conformes, demande des précisions, passe les tests français et a été mesuré sur le téléphone réel. Les fondations actuelles ne suffisent pas à déclarer l'étape terminée.

## Découpage expérimental du corpus

Le script `training/phase01/split-corpus.js` génère trois ensembles déterministes : train (environ 70 %), validation (environ 15 %) et test (environ 15 %). Les exemples ayant la même signature sémantique sont regroupés avant répartition. Les fichiers générés sont dans `training/phase01/splits/`. Ce découpage réduit les fuites évidentes entre paraphrases, mais il ne remplace pas une revue humaine des étiquettes et ne constitue pas encore un benchmark représentatif. Le workflow vérifie la conformité des trois fichiers et l'absence de familles identiques entre ensembles.


## Gestionnaire évolutif de connaissances — première version

Le module `knowledge-manager-v1.js` importe des paquets JSON versionnés, vérifie leurs entrées et les conserve dans le stockage local du WebView. Les entrées importées sont des brouillons à examiner avant activation. Le fichier d'origine n'est pas nécessaire après l'importation. Les formules sont stockées comme données déclaratives ; aucun code importé n'est exécuté. Voir `docs/KNOWLEDGE-MANAGER.md`.

## Rendu filaire 3D — première version

Le rendu des maillages peut être basculé vers un affichage des arêtes uniquement. Le réglage est mémorisé localement dans les paramètres. Il s'agit d'une première visualisation filaire, pas encore d'une navigation 3D avec caméra tactile ni d'un outil de modélisation complet.


## Première fondation du monde 3D procédural

Le module `world-engine-v1.js` construit une description de monde locale avec un biome (ville, forêt, campagne, port ou aéroport), des routes et des éléments positionnés. Il dispose d'un premier aperçu 3D stylisé avec caméra orientable au doigt et zoom. Il s'agit d'une base procédurale de type prototype, pas d'un monde ouvert réaliste de qualité AAA.

Le modèle d'ordinateur de bureau a aussi été ajouté au catalogue de maillages de l'ancien moteur de scène.

## Importation de fichiers sur Android

Le WebView dispose maintenant d'un `WebChromeClient` et d'un sélecteur Android via `onShowFileChooser`. Cette correction répond au problème où le champ de sélection JSON apparaissait mais ne permettait pas d'ouvrir le gestionnaire de fichiers. Elle doit encore être vérifiée sur appareil lors d'une prochaine compilation autorisée.

## Politique de compilation

Aucun workflow de compilation Android automatique n'est actif. Seuls les tests JavaScript s'exécutent lors des changements. Une compilation APK attend une autorisation explicite de l'utilisateur.


## Terrain procédural et exploration de base

Le moteur de monde ajoute une grille de terrain 16 × 16 cellules, avec une hauteur calculée localement à partir de fonctions déterministes. Les biomes montagne, forêt et campagne possèdent des amplitudes de relief différentes; les montagnes utilisent plusieurs sommets procéduraux. Les éléments posés dans le monde prennent en compte la hauteur locale du terrain.

La caméra accepte la rotation par glissement, le zoom, les touches WASD/flèches et un pavé directionnel tactile dessiné dans le canvas. Cette navigation est une première exploration de prototype; elle ne constitue pas encore un contrôleur de personnage ni un moteur physique de monde ouvert.

Les tests automatisés vérifient la détection des montagnes, la présence d'un relief non plat et les paramètres de terrain. Les tests JavaScript sont verts. Aucune compilation Android n'a été exécutée.


## Architecture des bâtiments procéduraux

Le moteur distingue désormais les maisons et les immeubles. Les maisons de campagne reçoivent une façade avec porte et fenêtres ainsi qu'une toiture à deux pentes. Les immeubles urbains reçoivent un nombre d'étages déterministe, des fenêtres répétées, des séparations de niveaux, une entrée et un toit plat avec acrotère. Les bâtiments sont dessinés à partir de primitives géométriques dans le moteur de rendu existant.

Les tests vérifient que les immeubles possèdent un nombre d'étages cohérent et que les maisons disposent d'une échelle valide. Les intérieurs visitables, l'ouverture des portes et l'édition libre des bâtiments ne sont pas encore implémentés.


## Premiers intérieurs et portes interactives

Les maisons et immeubles générés possèdent maintenant des métadonnées d'intérieur : pièces prévues, porte et présence d'un escalier. Dans le mode monde, le joueur peut s'approcher d'un bâtiment puis toucher l'écran pour entrer. Une vue intérieure simplifiée affiche les murs, le sol, une porte et, pour les immeubles, un escalier stylisé. Un toucher permet de ressortir.

Cette première version est une transition vers une vue intérieure illustrative : les pièces ne sont pas encore séparées en espaces réellement traversables, les escaliers ne permettent pas encore de changer d'étage et les portes ne possèdent pas encore d'animation d'ouverture. Les tests vérifient les métadonnées des maisons et des immeubles.


### Intérieurs procéduraux — première disposition des pièces

Les maisons et immeubles possèdent désormais une disposition déclarative de pièces avec positions relatives. Le rendu intérieur affiche des séparations simplifiées et des emplacements de mobilier schématiques. Cette version reste une représentation 2D dans le canvas pendant le mode intérieur : les pièces ne sont pas encore des espaces 3D séparés et les meubles ne sont pas encore interactifs. La porte utilise une animation visuelle et les niveaux d'immeuble sont représentés par un changement d'étage logique. La compilation APK et la validation sur appareil restent à faire après autorisation explicite.


### Navigation intérieure par pièces — première version

Le mode intérieur présente maintenant une pièce à la fois dans une vue en perspective, avec sol, murs, porte animée, fenêtre et mobilier schématique variant selon le type de pièce. Les pièces prévues dans les métadonnées (entrée, séjour, cuisine, chambre) sont parcourues dans l'ordre : le joueur ouvre la porte puis sélectionne la zone centrale pour accéder à la pièce suivante. Les immeubles conservent une commande tactile pour changer de niveau. Cette étape améliore l'illusion d'espaces visitables, mais ne constitue pas encore une géométrie 3D indépendante avec collisions, navigation libre entre portes placées dans le monde, ni véritable escalier parcourable. Validation sur téléphone et compilation APK non réalisées.


### Déplacements intérieurs et collisions — première protection

Le déplacement intérieur passe maintenant par une fonction de résolution qui limite le joueur à la pièce, empêche de traverser les meubles schématiques du séjour, de la cuisine et de la chambre, et bloque le seuil lorsque la porte est fermée. Le déplacement sur un axe est résolu séparément pour autoriser le glissement le long d'un obstacle. Les tests couvrent les limites, les meubles, le seuil de porte et le glissement. Il s'agit de collisions 2D simplifiées sur coordonnées locales, pas encore d'un moteur physique 3D ni d'une détection de collision sur des maillages réels. La touche E ignore les répétitions automatiques du clavier pour éviter les basculements multiples de la porte.
