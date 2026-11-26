# Étape 01 — Moteur d'intelligence et de compréhension

## Objectif
Construire une intelligence spécialisée Idée Vision, utilisable hors ligne, qui comprend des demandes françaises libres, conserve les concepts nouveaux, demande des précisions et produit des données structurées contrôlées.

## Architecture retenue
1. Interface texte et future transcription vocale.
2. Compréhension française : module lexical de secours et futur modèle neuronal spécialisé.
3. Contrat JSON versionné.
4. Validation stricte des objets, propriétés, relations, actions et limites.
5. Clarification des demandes incomplètes.
6. Adaptateur vers les moteurs de conception et de scène.
7. Corpus français versionné et évaluations reproductibles.
8. Runtime neuronal Android, à choisir après comparaison technique.

## État du code
- `french-understanding-v1.js` : analyse lexicale initiale, limitée à un vocabulaire connu.
- `idea-understanding-contract-v1.js` : contrat JSON strict et conversion du résultat lexical.
- `index.html` : charge le contrat et le moteur lexical ; conserve le moteur de scène et l'apparence existants. Le résultat structuré est validé et conservé pour diagnostic, mais ne pilote pas encore la scène.
- `training/phase01/examples-fr-v0.2.jsonl` : corpus français élargi (139 exemples : formulations standard, orales, fautes courantes et descriptions multi-objets).
- `training/phase01/system-prompt-fr-v0.1.md` : consignes destinées au futur modèle.
- `training/phase01/MODEL-SELECTION.md` : protocole de sélection et de mesure.
- Aucun modèle neuronal ni runtime natif n'est intégré à ce stade.

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

### 3. Comparaison des modèles
- [x] Définir les critères et le protocole de notation.
- [x] Faire une présélection documentaire de quatre candidats à partir de leurs fiches officielles.
- [ ] Vérifier les licences complètes et restrictions de redistribution.
- [ ] Évaluer plusieurs candidats sur le même corpus.
- [ ] Mesurer mémoire, vitesse, chauffe et stabilité sur le Galaxy A05s.
- [ ] Choisir le modèle seulement après les résultats.

### 4. Préparation de l'entraînement
- [x] Définir un format JSONL avec exemples et sorties attendues.
- [x] Écrire une première consigne système.
- [x] Ajouter un test automatique du corpus.
- [ ] Nettoyer les étiquettes et enrichir les exemples.
- [ ] Constituer des ensembles séparés sans fuite de données.
- [ ] Choisir une méthode d'adaptation après sélection du modèle et de la machine d'entraînement.

### 5. Intégration progressive
- [x] Charger le contrat et la compréhension lexicale dans la WebView.
- [x] Valider et conserver le résultat structuré à titre de diagnostic.
- [x] Préserver l'interface et le moteur de scène existants.
- [ ] Connecter le modèle neuronal après tests indépendants.
- [ ] Gérer les poids dans le stockage privé de l'application sans importation manuelle.
- [ ] Vérifier le fonctionnement hors ligne sur le téléphone réel.

## Stratégie du modèle
Nous développons notre propre architecture, notre corpus spécialisé, nos consignes, notre contrat, nos validateurs et nos adaptateurs. Un modèle neuronal compact pré-entraîné pourra être adapté avec nos données si les essais le justifient. Entraîner un grand modèle fondamental depuis zéro n'est pas réaliste sur le téléphone ; l'entraînement éventuel se fera sur une machine adaptée.

Le fichier de poids sera géré en interne par l'application (intégré si sa taille le permet ou initialisé une fois dans le stockage privé). L'utilisateur ne devra pas sélectionner un fichier GGUF.

## Règle de compilation
**Aucune compilation Android ne doit être lancée sans autorisation explicite de l'utilisateur.** Le workflow automatique est limité aux tests JavaScript et ne lance ni Gradle ni la création d'APK. Les vérifications de code ne valent pas validation sur téléphone.

## Critères de fin
L'étape 01 ne sera terminée que lorsque le modèle neuronal fonctionne hors ligne dans l'application, produit des interprétations conformes, demande des précisions, passe les tests français et a été mesuré sur le téléphone réel. Les fondations actuelles ne suffisent pas à déclarer l'étape terminée.

## Découpage expérimental du corpus

Le script `training/phase01/split-corpus.js` génère trois ensembles déterministes : train (environ 70 %), validation (environ 15 %) et test (environ 15 %). Les exemples ayant la même signature sémantique sont regroupés avant répartition. Les fichiers générés sont dans `training/phase01/splits/`. Ce découpage réduit les fuites évidentes entre paraphrases, mais il ne remplace pas une revue humaine des étiquettes et ne constitue pas encore un benchmark représentatif. Le workflow vérifie la conformité des trois fichiers et l'absence de familles identiques entre ensembles.
