# Groupe 1.3 — Compréhension initiale des intentions

## Objectif
Identifier ce que l'utilisateur demande ou décrit avant toute interprétation scientifique. Module local, déterministe et sans dépendance externe.

## 15 axes fonctionnels
1. Question. 2. Instruction. 3. Description. 4. Explication. 5. Comparaison. 6. Création/invention. 7. Modification. 8. Suppression. 9. Simulation demandée. 10. Mesure/calcul. 11. Traduction. 12. Résumé. 13. Planification. 14. Vérification. 15. Formats de sortie, contraintes, priorités, cibles candidates et preuves textuelles.

## Résultat structuré
- intents : type, preuve textuelle, position et statut candidat.
- outputs : code, étapes, tableau, schéma, modèle, explication ou fichier.
- constraints : hors ligne, gratuit, sans image, sans compilation, etc.
- priorities : marqueurs de priorité explicites.
- targetCandidates : cible candidate, jamais tenue pour certaine.
- issues : intentions multiples ou non reconnues.

## Limites
Règles lexicales initiales, couverture française limitée, intentions implicites non résolues. Plusieurs intentions dans une phrase sont signalées au lieu d'être ordonnées arbitrairement. Une simulation est seulement identifiée : aucune loi physique n'est appliquée ici.

## Vérification
30 tests ciblés dans tests/intent-understanding-v1.test.js. Le workflow vérifie la syntaxe et les tests sans compiler l'APK.
