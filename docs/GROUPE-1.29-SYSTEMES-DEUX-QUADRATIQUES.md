# Groupe 1.29 — Systèmes de deux équations quadratiques

## Objectif
Étendre le moteur non linéaire à un cas de deux équations quadratiques à deux inconnues. La première version de ce groupe prend en charge les systèmes dont les parties quadratiques sont proportionnelles et dont la soustraction convenablement pondérée produit une contrainte linéaire exploitable.

## Méthode
Pour deux équations (F_1(x,y)=0) et (F_2(x,y)=0), le moteur compare les coefficients des termes (x^2), (xy) et (y^2). Si ces parties quadratiques sont proportionnelles, il calcule le rapport λ et forme (F_2-λ F_1). Lorsque cette différence est une équation linéaire non dégénérée, il isole une inconnue, remplace dans l'une des équations quadratiques, résout le polynôme réduit de degré au plus deux, reconstruit les deux inconnues puis vérifie chaque candidate dans les deux équations d'origine.

## Exemple
```
x² + y² = 25
2x² + 2y² + x - y = 50
```

La seconde équation moins deux fois la première donne (x-y=0), donc (y=x). La substitution donne (2x^2=25), soit deux solutions réelles :
- (x=y=-\sqrt{12.5})
- (x=y=\sqrt{12.5})

Les deux candidates sont vérifiées dans les deux équations sources.

## Capacités ajoutées
- Détection des deux équations quadratiques.
- Extraction des coefficients des termes (x^2), (xy), (y^2).
- Comparaison de proportionnalité des parties quadratiques.
- Rapport de proportionnalité positif, négatif ou fractionnaire.
- Élimination des termes quadratiques par combinaison linéaire.
- Obtention et conservation de la contrainte linéaire résultante.
- Détection des équations quadratiques dépendantes ou incompatibles.
- Réutilisation de l'isolation et de la substitution algébriques existantes.
- Résolution de l'équation réduite de degré au plus deux.
- Reconstruction et vérification des solutions dans les deux équations d'origine.
- Refus explicite des parties quadratiques non proportionnelles.
- Intégration dans le pipeline et le contexte JSON.
- Fonctionnement local, sans `eval` et sans IA externe.

## Limites
- Deux équations et deux inconnues uniquement.
- Les parties quadratiques doivent être proportionnelles.
- Leur différence doit donner une contrainte linéaire exploitable.
- Les systèmes généraux à deux quadratiques non proportionnelles ne sont pas encore résolus.
- Pas de racines complexes, de degré supérieur à deux, de dénominateur variable ni de fonction transcendante.
- Les solutions restent numériques et sont vérifiées par tolérance.

## Tests
- 60 tests ciblés : `tests/nonlinear-quadratic-pair-solver-v1.test.js`.
- 6 tests d'intégration du pipeline.
- Validation CI en attente.
- APK non compilé.
