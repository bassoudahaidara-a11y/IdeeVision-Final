# Gestionnaire évolutif des connaissances

## Objectif
Permettre à Idée Vision d'acquérir des connaissances hors ligne sans réinstaller l'APK. Les données sont séparées du code du moteur et conservées dans le stockage privé/local de l'application.

## Paquet d'importation v1
- Format : JSON UTF-8.
- Racine : `format: "ideevision-knowledge"`, `schemaVersion: 1`, `title`, `entries: []`.
- Chaque entrée possède un identifiant stable, domaine, titre, description, type, variables/unités facultatives, formule déclarative facultative, hypothèses, tests de référence et source.
- Taille maximale de fichier initiale : 2 Mio ; maximum 500 entrées.

## Cycle d'intégration
1. Lire le fichier comme données, jamais comme programme.
2. Vérifier le schéma, les champs, les tailles et les caractères autorisés.
3. Refuser les identifiants dupliqués et les entrées mal formées.
4. Enregistrer les entrées acceptées en statut `draft`.
5. Présenter les entrées à l'utilisateur pour examen.
6. L'utilisateur peut activer ou désactiver chaque entrée.
7. Les connaissances actives peuvent être consultées par les moteurs compatibles.

## Sécurité et limites
- Aucune exécution de JavaScript, de code importé ou de formule arbitraire.
- Les formules sont stockées comme expressions déclaratives ; elles ne deviennent pas automatiquement des solveurs.
- Une entrée importée n'est pas une vérité certifiée. Les sources, hypothèses et tests doivent être examinés.
- L'activation indique que l'utilisateur accepte de rendre cette donnée disponible ; elle ne garantit pas sa validité scientifique.
- Le moteur doit vérifier qu'il sait interpréter le type de connaissance avant de l'utiliser dans un calcul.
- Un nouveau solveur ou une nouvelle capacité algorithmique peut nécessiter une mise à jour du code, contrairement à l'ajout d'une donnée.

## Persistance
Version initiale : stockage local persistant du WebView (localStorage), activé par le stockage DOM Android. Les données ne dépendent pas du fichier source après importation. Une sauvegarde/export est prévue pour protéger les données contre la désinstallation ou l'effacement des données de l'application.

## Évolution
Les versions ultérieures pourront ajouter IndexedDB ou un stockage Android natif, les migrations de schéma, les paquets signés, les imports CSV et l'extraction contrôlée de documents. Les documents libres ne devront jamais modifier directement les connaissances actives.
