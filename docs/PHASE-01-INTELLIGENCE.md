# Étape 01 — Moteur d'intelligence et de compréhension

## Objectif

Permettre à Idée Vision de comprendre des descriptions françaises libres, y compris des demandes longues, techniques et inédites, puis de produire une représentation structurée exploitable par les autres moteurs.

Cette étape ne doit pas être confondue avec le moteur de dessin actuel : reconnaître quelques mots par expressions régulières ne constitue pas une compréhension générale du français.

## État de départ audité

Branche de travail : `offline-2d3d-phases-1-5`.

- `offline-scene-engine.js` utilise principalement des mots-clés et des expressions régulières sur une liste finie d'objets et d'actions.
- `json-engine-v2-1.js` valide une description de scène structurée (objets, propriétés, relations parent-enfant, actions), mais ne comprend pas directement le français.
- `index.html` appelle actuellement le moteur local de scène ; aucun modèle de langage local n'y est chargé.
- L'application Android utilise une WebView et une passerelle JavaScript/Java pour la synthèse vocale locale lorsqu'une voix française hors ligne est installée.
- Le projet ne contient pas encore de runtime LLM natif Android.

## Architecture cible

1. **Interface de conversation** : reçoit le texte français et, plus tard, la transcription vocale.
2. **Modèle de langage local** : interprète la demande, identifie l'intention, les objets, les propriétés, les quantités, les relations, les contraintes et les ambiguïtés.
3. **Contrat de sortie structuré** : le modèle produit un JSON conforme à un schéma contrôlé ; il ne doit pas écrire directement du code exécutable.
4. **Validateur** : valide le JSON, les limites numériques, les identifiants, les types et les références. Rejette les sorties incorrectes.
5. **Gestionnaire de clarification** : demande une précision lorsqu'une dimension, une matière, une fonction ou une relation importante manque.
6. **Adaptateur vers les moteurs de scène** : transmet uniquement les données validées au moteur de conception et au moteur 3D.
7. **Connaissances locales** : dictionnaires français, synonymes, unités, vocabulaire technique et fiches de connaissances versionnées. Le modèle ne doit pas être présenté comme omniscient.

## Modèle candidat à évaluer

Candidat initial : LFM2.5-1.2B-Instruct au format GGUF, runtime llama.cpp pour Android arm64-v8a.

Motifs :
- modèle compact de 1,2 milliard de paramètres ;
- fiche du modèle annonçant la prise en charge du français ;
- versions GGUF quantifiées adaptées à l'inférence locale ;
- existence d'une voie d'intégration Android avec llama.cpp.

Réserve obligatoire : les chiffres de performance publiés sur des téléphones haut de gamme ne prédisent pas les performances sur le Samsung Galaxy A05s (4 Go de RAM). La vitesse, la mémoire réellement utilisée, la chauffe, la stabilité et la qualité du français doivent être mesurées sur l'appareil. Le modèle ne doit pas être embarqué dans l'APK ; l'utilisateur doit pouvoir sélectionner un fichier GGUF local compatible.

## Contraintes de sécurité et de fiabilité

- Aucune exécution de code arbitraire généré par le modèle.
- JSON limité par schéma, taille, nombre d'objets, profondeur et durée.
- Pas d'affirmation qu'une simulation est physiquement exacte sans modèle et paramètres appropriés.
- Le modèle doit signaler l'incertitude et demander une précision au lieu d'inventer des propriétés.
- Fonctionnement hors ligne après installation/initialisation interne du modèle ; aucune importation manuelle par l'utilisateur.
- Prévoir un mode de secours sans LLM, clairement identifié comme limité.

## Sous-étapes de réalisation

### 01.1 — Audit et architecture
- [x] Examiner le moteur de scène, le validateur JSON, la WebView et le manifeste.
- [x] Identifier l'absence de modèle de langage et de runtime natif.
- [x] Définir le contrat d'architecture et les contraintes de l'appareil.

### 01.2 — Runtime local Android
- [ ] Choisir et intégrer une version compatible de llama.cpp pour arm64-v8a.
- [ ] Ajouter une interface native de chargement, génération, annulation et libération mémoire.
- [ ] Charger le GGUF depuis un emplacement choisi par l'utilisateur, sans le copier dans l'APK.
- [ ] Vérifier le fonctionnement sans réseau.

### 01.3 — Compréhension structurée
- [ ] Définir un schéma d'intention et de scène versionné.
- [ ] Construire les prompts système et les règles de sortie JSON.
- [ ] Ajouter validation, reprise après JSON invalide et clarification.
- [ ] Connecter les sorties validées au moteur JSON existant.

### 01.4 — Évaluation française
- [ ] Tester synonymes, fautes de frappe, formulations orales, phrases longues et demandes multi-objets.
- [ ] Tester relations spatiales, dimensions, quantités, matériaux, actions et contraintes.
- [ ] Mesurer temps de réponse, mémoire, stabilité et qualité sur l'appareil réel.
- [ ] Documenter les limites connues avant de déclarer l'étape terminée.

## Critères de fin de l'étape 01

L'étape 01 ne sera terminée que lorsque :
- un modèle local peut être chargé et utilisé sur le téléphone ;
- des demandes françaises variées sont transformées en données structurées cohérentes ;
- les sorties incorrectes ou ambiguës sont rejetées ou clarifiées ;
- les données validées passent au moteur de scène sans exécuter de code généré ;
- les tests fonctionnent sans connexion Internet ;
- les performances et limites sur le Galaxy A05s sont mesurées.

Aucune étape suivante ne doit être déclarée commencée avant validation de ces critères.
