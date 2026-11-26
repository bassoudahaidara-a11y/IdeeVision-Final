# Découpage du corpus français — Phase 01

Le corpus source est `examples-fr-v0.2.jsonl`. Le script `split-corpus.js` génère trois fichiers dans `splits/` :

- `train.jsonl` : environ 70 % ;
- `validation.jsonl` : environ 15 % ;
- `test.jsonl` : environ 15 %.

Le découpage est déterministe et sans dépendance externe. Les exemples partageant la même signature sémantique (intention, objets, quantités, propriétés, relations, actions et besoin de clarification) sont placés ensemble. Cela réduit le risque qu'une reformulation d'une même sortie attendue soit présente à la fois dans l'entraînement et dans l'évaluation.

**Important :** ce découpage automatique n'est pas une certification de qualité sémantique. Les annotations doivent encore être relues. Les trois ensembles sont encore petits et ne constituent pas un benchmark représentatif. Toute évolution du corpus exige de relancer le script et les tests.

Commande depuis la racine du dépôt :

```bash
node training/phase01/split-corpus.js
```
