# Groupe 1.30 — Élimination algébrique par résultant

## Objectif
Introduire une méthode d'élimination algébrique indépendante de la simple proportionnalité des parties quadratiques : construire le résultant de deux polynômes bivariés à l'aide de la matrice de Sylvester.

## Éléments réalisés
1. Nouveau module polynomial-resultant-engine-v1.js.
2. Lecture de deux équations à deux inconnues.
3. Réutilisation du parseur mathématique symbolique existant.
4. Conversion contrôlée des AST en polynômes bivariés.
5. Addition et soustraction des polynômes.
6. Multiplication avec contrôle du degré total.
7. Gestion des signes unaires.
8. Gestion des parenthèses.
9. Gestion des puissances entières 0, 1 et 2.
10. Gestion des coefficients décimaux.
11. Gestion des fractions à dénominateur numérique non nul.
12. Détection des symboles d'unités ambigus.
13. Décomposition en coefficients suivant l'inconnue éliminée.
14. Construction de la matrice de Sylvester.
15. Calcul déterministe de son déterminant par permutations.
16. Calcul du polynôme résultant.
17. Évaluation des deux axes d'élimination et sélection d'un résultant non constant.
18. Conservation des équations sources et des coefficients ordonnés.
19. Signalement explicite des cas dégénérés ou non pris en charge.
20. Intégration au pipeline, à l'interface de chargement et au contexte JSON.
21. Tests unitaires et tests d'intégration dédiés.

## Limites essentielles
Ce groupe calcule le polynôme résultant, mais **ne prétend pas encore résoudre le système**. Il ne calcule pas encore les racines du résultant, ne reconstruit pas les valeurs de la seconde inconnue et ne vérifie donc aucune solution. La prochaine extension devra isoler les racines réelles, effectuer la substitution arrière et vérifier les candidats dans les deux équations d'origine.

Domaine actuel : deux équations, deux variables, degré total au plus deux, coefficients numériques réels. Les expressions non polynomiales, les dénominateurs variables, les symboles d'unités ambigus et les degrés supérieurs sont refusés.

- Tests ciblés ajoutés : 35.
- Tests d'intégration pipeline ajoutés : 6.
- Aucun eval, aucune IA externe.
- Aucun APK compilé.
- Validation CI réussie : workflow 46013399363 — 1 926 tests réussis, 0 échec. Syntaxe de tous les moteurs JavaScript vérifiée.
