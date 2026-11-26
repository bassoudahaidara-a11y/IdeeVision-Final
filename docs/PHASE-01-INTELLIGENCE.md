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
