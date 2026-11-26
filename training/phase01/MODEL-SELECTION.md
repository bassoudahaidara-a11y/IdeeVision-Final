# Évaluation des modèles compacts — plan de décision

Aucun modèle neuronal n'est encore choisi ni intégré.

## Critères obligatoires

1. Licence autorisant clairement l'usage prévu, la modification et la redistribution dans l'application.
2. Qualité réelle en français : consignes complexes, langage courant, fautes et phrases longues.
3. Capacité à produire un JSON strict selon le contrat Idée Vision.
4. Taille des poids après quantification et mémoire de travail totale.
5. Compatibilité Android arm64-v8a et disponibilité d'un runtime maintenable.
6. Temps de réponse, consommation mémoire, chauffe et stabilité sur le Galaxy A05s.
7. Fonctionnement sans réseau une fois les composants installés.

## Familles à comparer

- Petits modèles multilingues instruction-tuned de 0,5 à 1,5 milliard de paramètres.
- Modèles compacts généralistes avec bonne génération structurée.
- Modèles spécialisés légers ou adaptables par LoRA/QLoRA sur une machine adaptée.

## Protocole de comparaison

Chaque candidat recevra le même lot de tests, sans accès Internet. Notation sur 100 :
- compréhension du français : 25 ;
- exactitude des objets, attributs et relations : 20 ;
- respect du JSON : 20 ;
- clarification et gestion de l'incertitude : 15 ;
- mémoire et vitesse sur l'appareil : 15 ;
- licence et intégration : 5.

Un modèle qui invente des dimensions ou valide du code arbitraire est éliminé, même si sa note moyenne est élevée.

## Décision

Ne pas télécharger de poids, modifier le Gradle, intégrer un runtime natif ou figer un candidat avant :
- vérification de la licence et de la fiche technique officielle ;
- tests comparatifs sur le même corpus ;
- estimation de la mémoire totale, pas seulement de la taille du fichier ;
- validation de la stratégie de distribution interne sans sélecteur de fichier pour l'utilisateur.

L'entraînement depuis zéro d'un grand modèle n'est pas une cible réaliste sur le téléphone. Notre valeur propre sera l'architecture Idée Vision, le corpus français spécialisé, le contrat, les évaluations, les adaptateurs et l'éventuel ajustement du modèle.
