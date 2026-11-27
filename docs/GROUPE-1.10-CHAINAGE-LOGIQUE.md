# Groupe 1.10 — Raisonnement en plusieurs étapes

## Objectif
Relier plusieurs règles conditionnelles en chaînes de dépendances explicites. Le moteur ne doit pas inventer les étapes intermédiaires, résoudre arbitrairement les pronoms, ni présenter une conclusion candidate comme une certitude.

## Les 20 éléments de travail
1. Vérifier que l'analyse logique concerne exactement la même source.
2. Extraire les règles conditionnelles utilisables.
3. Préserver l'identifiant de chaque règle.
4. Comparer les résultats d'une règle aux conditions d'une autre.
5. N'accepter automatiquement qu'un pont textuel normalisé exact.
6. Représenter les dépendances sous forme d'arêtes orientées.
7. Construire les chaînes de plusieurs règles.
8. Conserver chaque condition et résultat de chaque étape.
9. Conserver les preuves textuelles d'origine.
10. Identifier la conclusion terminale comme candidate.
11. Calculer le nombre de règles et de liens.
12. Calculer la longueur maximale des chaînes.
13. Gérer plusieurs chaînes indépendantes.
14. Signaler les règles isolées.
15. Repérer les correspondances approximatives sans les valider.
16. Signaler les ponts possibles à confirmer.
17. Repérer les cycles potentiels sans les traiter comme des preuves.
18. Préserver les informations inconnues et les ambiguïtés.
19. Ne pas résoudre automatiquement les pronoms dans les ponts.
20. Ne jamais inventer de valeur de vérité ou de loi scientifique.

## Implémentation
- Module : `app/src/main/assets/understanding/reasoning-chain-engine-v1.js`.
- Tests ciblés : `tests/reasoning-chain-engine-v1.test.js` (30 tests).
- Intégration : `representation.reasoningChains`, `stages.reasoningChains` et contexte JSON du pipeline.
- Chargement local dans `index.html`, avant le pipeline.
- Validation globale : [workflow 45977512671](https://github.com/bassoudahaidara-a11y/IdeeVision-Final/actions/runs/45977512671) — 707 tests réussis, 0 échec.

## Limites connues
- Les ponts automatiques sont volontairement stricts et reposent sur une correspondance textuelle normalisée.
- Les paraphrases, synonymes et pronoms demandent une résolution plus avancée.
- Un lien textuel ne prouve pas une causalité.
- Les règles conditionnelles de départ peuvent être mal analysées ou incomplètes.
- Le système est un chaînage candidat, pas encore un démonstrateur formel complet.
- Aucun APK n'a été compilé.
