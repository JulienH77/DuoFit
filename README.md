# Duo Fit — V1

Le carnet de sport de Julien et Arina, conçu pour téléphone et tablette. Aucun historique fictif. Catalogue JSON modifiable, activités personnelles partagées, calendrier, progression et défis quotidiens.

## Mettre les fichiers sur GitHub Pages

1. Copier **le contenu du dossier `site`** à la racine du dépôt `DuoFit` : `index.html`, `style.css`, `app.js`, `config.js`, `activities.json`. Conserver le dossier `docs` pour la documentation si souhaité.
2. Dans Settings → Pages, sélectionner la branche `main`, dossier `/ (root)`, puis enregistrer.
3. Ouvrir l’URL GitHub Pages. Les fichiers utilisent des chemins relatifs, compatibles avec `/DuoFit/`.

Pas de serveur, de compilation ni de dépendances JavaScript. Ne pas ouvrir directement index.html avec file:// : le catalogue se charge par HTTP.

## Activer la vraie sauvegarde partagée (Supabase)

1. Créer un projet Supabase. Dans SQL Editor, exécuter le contenu intégral de `supabase.sql`.
2. Dans Authentication, activer le fournisseur Email. Si la confirmation email est activée, configurer Site URL / les URLs de redirection avec l’adresse de votre application. Chaque personne doit confirmer son email avant de se connecter.
3. Dans les réglages du projet, récupérer l’URL du projet et la **clé publique publishable ou anon**. Ne jamais utiliser `service_role` / une clé secrète dans le navigateur.
4. Renseigner ces deux valeurs dans `config.js`, puis envoyer ce fichier dans votre dépôt. Elles sont publiques ; la protection des données repose sur les policies RLS du SQL. On peut aussi les saisir dans les réglages de l’application sur chaque appareil.
5. Julien crée son compte dans les réglages et se connecte, puis clique sur **Créer notre duo**.
6. Julien affiche le code d’invitation. Arina crée son propre compte, se connecte et choisit **Rejoindre** en saisissant ce code. Maximum deux comptes par duo.
7. Vérifier que le statut indique **Duo connecté · séances enregistrées sur Supabase**. À partir de là, les nouvelles séances et les activités personnalisées sont sauvegardées en ligne.
8. Tester : ajouter une courte séance depuis un appareil, puis cliquer sur Actualiser les données sur l’autre. La séance doit apparaître dans le calendrier.

Les séances se synchronisent à l’ouverture, quand l’application reprend le focus et avec le bouton d’actualisation. Pas de synchronisation instantanée en arrière-plan. La session d’authentification est conservée dans sessionStorage : une nouvelle session de navigateur peut nécessiter une reconnexion. Les mots de passe ne sont pas sauvegardés par l’application.

## Mode découverte

Sans Supabase, tous les boutons de saisie fonctionnent pour essayer l’interface, mais les données restent **en mémoire** et disparaissent au rechargement. Le statut le rappelle. Il n’y a pas de fausse promesse de sauvegarde. L’export JSON permet de conserver ces essais ; la connexion exporte automatiquement les essais présents avant de les remplacer par les données du compte. La V1 n’a pas d’import JSON.

GitHub Pages héberge les fichiers mais n’écrit pas de nouvelles séances dans le dépôt : pour cela, cette version utilise Supabase. Ne mettez aucun token GitHub dans l’application.

## Catalogue et points

- Modifier `activities.json` pour changer la liste de base : identifiant unique, nom, catégorie, durée proposée et description. Préserver les identifiants existants ; les séances gardent aussi une copie du nom et de la catégorie.
- Ajouter une activité depuis l’application pour l’enregistrer dans votre catalogue partagé.
- Catégories : Étirements, Mobilité, Cardio, Renforcement et Libre.
- Séance : 10 points + 2 par tranche complète de 5 minutes, bonus de durée plafonné à 20 points.
- Séance ensemble : +10 points **à chacun**, en plus des points normaux.
- Défi : +5 points par personne et par jour, au maximum une fois pour chaque défi. La date de la séance détermine le défi correspondant.
- Tous les sports, y compris les étirements, suivent le même barème. 100 points par niveau. Pas de perte de points lors des journées sans activité.
- Durée d’une séance : de 1 à 240 minutes. Dates futures refusées. En cas de mauvaise saisie, supprimer la séance et la recréer ; les points sont recalculés.

Les séances et activités sont stockées dans `duofit_records.payload` (JSON). Les deux membres peuvent consulter, ajouter et supprimer les données de leur duo. Les policies empêchent un autre compte de les consulter. Ce carnet est un outil personnel : les points sont calculés dans le navigateur et ne constituent pas un classement compétitif contrôlé côté serveur.

## Vérification et limites

Vérifications réalisées : syntaxe JavaScript, catalogue JSON, calcul des points et bonus, cohérence du calendrier, rendus avec données vides et séances d’essai. Aucun projet Supabase réel n’a été fourni : la connexion, le SQL et le partage doivent être vérifiés après configuration de votre projet. Pas de test visuel dans un navigateur pour cette livraison.

Les activités proposées sont des suggestions générales : choisissez une amplitude et une durée confortables. Le catalogue n’est pas un programme médical personnalisé.
