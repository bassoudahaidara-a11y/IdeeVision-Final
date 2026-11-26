# Fondation française d'Idée Vision — données v0.1

Ce dossier contient les premiers exemples contrôlés qui serviront à définir le comportement du futur modèle spécialisé.

- `examples-fr-v0.1.jsonl` : exemples d'entrées françaises et de sorties attendues.
- Les exemples sont des données de conception initiales, pas un corpus suffisant pour entraîner un modèle neuronal.
- Les sorties doivent rester validées par un schéma avant toute transmission au moteur de scène.
- Ajouter progressivement des variantes : synonymes, fautes, langage oral, formulations longues, unités, relations spatiales, mécanique, physique, chimie et biologie.
- Ne jamais transformer une hypothèse du modèle en fait scientifique certain.

La première implémentation lexicale est séparée du moteur de rendu afin de pouvoir être remplacée ou enrichie par un modèle neuronal sans réécrire l'interface.
