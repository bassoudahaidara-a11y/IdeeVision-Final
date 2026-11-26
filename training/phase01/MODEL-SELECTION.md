# Présélection des modèles — Idée Vision

Mise à jour : 26 novembre 2026. Cette présélection repose sur les fiches officielles consultées ; elle ne constitue pas un benchmark sur le Galaxy A05s. Aucun modèle n'est encore choisi, téléchargé ou intégré.

## Candidats à comparer

### A. Qwen3-0.6B-Instruct — référence légère
- 0,6 milliard de paramètres.
- Le fabricant annonce plus de 100 langues et 32 768 tokens de contexte.
- Licence Apache 2.0 sur la fiche officielle.
- La fiche officielle indique une prise en charge par des outils locaux, dont llama.cpp.
- Intérêt : commencer par un candidat compact, multilingue et avec une licence simple à auditer.
- Risque : petit modèle ; sa compréhension des demandes françaises longues et techniques doit être testée.

Source officielle : https://huggingface.co/Qwen/Qwen3-0.6B

### B. LFM2.5-1.2B-Instruct — candidat extraction et appareil
- Environ 1,17 milliard de paramètres.
- La fiche annonce huit langues, dont le français, et 32 768 tokens de contexte.
- Liquid AI le destine notamment à l'extraction de données et aux tâches agentiques ; le fabricant annonce une exécution sous 1 Go dans ses conditions de mesure.
- La fiche précise qu'il n'est pas recommandé pour les tâches très dépendantes des connaissances ni la programmation.
- Licence LFM Open License v1.0 : ses conditions devront être examinées avant toute redistribution.
- Intérêt : l'extraction structurée d'une description vers notre contrat correspond à un usage annoncé.
- Risque : plus grand que Qwen3-0.6B et licence distincte d'Apache 2.0 ; performances annoncées non garanties sur notre téléphone.

Source officielle : https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct

### C. Qwen3.5-0.8B — candidat récent à surveiller
- Environ 0,8 milliard de paramètres pour le modèle de langage.
- Licence Apache 2.0.
- La fiche annonce 201 langues et dialectes et un contexte natif très long.
- Architecture multimodale et hybride ; la fiche consultée recommande des frameworks récents, mais ne confirme pas à elle seule un chemin Android/llama.cpp stable.
- Intérêt : couverture linguistique et petite taille annoncée.
- Risque : compatibilité mobile et coût mémoire réels à établir avant de le retenir.

Source officielle : https://huggingface.co/Qwen/Qwen3.5-0.8B

### D. Gemma 3-1B-IT — candidat de comparaison
- 1 milliard de paramètres.
- La fiche annonce plus de 140 langues et 32K de contexte pour la variante 1B.
- Conditions Gemma spécifiques ; l'accès aux fichiers exige l'acceptation des conditions Google.
- Intérêt : candidat multilingue supplémentaire.
- Risque : licence/conditions de redistribution à examiner et taille supérieure au candidat Qwen3-0.6B.

Source officielle : https://huggingface.co/google/gemma-3-1b-it

## Priorité d'essai (pas un classement de qualité)

1. Qwen3-0.6B : baseline pour vérifier la faisabilité sur appareil limité.
2. LFM2.5-1.2B-Instruct : comparaison directe sur extraction et compréhension française.
3. Qwen3.5-0.8B : vérifier d'abord la disponibilité d'un runtime mobile et d'une quantification maintenue.
4. Gemma 3-1B-IT : comparaison secondaire, sous réserve des conditions de licence.

## Protocole de test

Chaque modèle reçoit exactement les mêmes demandes du corpus, en mode hors ligne :
- français courant, formulations orales, fautes et synonymes ;
- objets simples et objets inventés ;
- plusieurs objets et relations spatiales ;
- quantités, dimensions, unités, matériaux et actions ;
- demande volontairement incomplète où il doit poser une question ;
- sortie JSON stricte, sans prose, sans code.

Notation sur 100 :
- compréhension du français : 25 ;
- exactitude des objets, attributs et relations : 20 ;
- conformité au contrat JSON : 20 ;
- clarification et gestion de l'incertitude : 15 ;
- mémoire, vitesse et stabilité sur le téléphone : 15 ;
- licence et facilité d'intégration : 5.

Élimination immédiate si le modèle invente des dimensions, accepte des champs arbitraires, référence des objets inexistants ou produit du code exécutable à transmettre au moteur.

## Conditions avant décision

- Examiner la licence complète et les obligations de redistribution.
- Vérifier que la version quantifiée est fidèle et maintenue.
- Vérifier le runtime Android arm64-v8a et la compatibilité exacte de l'architecture.
- Mesurer la mémoire totale (poids + contexte + runtime + application), pas seulement la taille du fichier.
- Mesurer vitesse, chauffe et stabilité sur le Galaxy A05s.
- Ne pas embarquer de poids dans l'APK ni choisir de format de stockage avant d'avoir les mesures.

Le modèle pré-entraîné sera une base technique éventuelle. L'intelligence spécialisée Idée Vision sera construite avec notre propre corpus, contrat, règles de raisonnement, connaissances, validateurs et adaptation.
