# Duo Fit V2

Application pour Julien et Arina, compatible GitHub Pages, téléphone et iPad. Julien en bleu, Arina en rose pâle. Séances, calendrier, activités modifiables depuis l’interface, défis et progression. Onglet Mesures facultatif, activable séparément et masquable sur chaque appareil.

## Stockage sans compte

Aucun email, mot de passe ou compte utilisateur. Les deux appareils utilisent le même code d’espace privé. Les données ne sont pas ouvertes au public : la clé publique Supabase seule ne permet pas de lire le carnet.

1. Exécuter `supabase.sql` dans le SQL Editor du projet Supabase. Ce script V2 conserve les anciennes tables et ne touche pas aux autres applications.
2. Renseigner l’URL Supabase et la clé publique publishable / anon dans `config.js`, ou dans les Réglages de Duo Fit. **Ne jamais y mettre une clé secrète ou service_role.**
3. Sur le premier appareil : Réglages → Créer notre espace.
4. Afficher le code de partage et le conserver dans un endroit privé. Sur les autres appareils : Réglages → Rejoindre notre espace, puis coller ce code.
5. Le statut « Sauvegarde partagée active » confirme l’accès au stockage.

Ne mettez pas le code d’espace dans GitHub, dans config.js ou dans un lien public. Toute personne qui possède ce code peut lire, modifier et supprimer les données du carnet. Sans compte, il n’y a pas de récupération par email ; conservez le code avant d’effacer les données de navigation. Le code est stocké sur l’appareil ; les séances et les mesures sont stockées dans Supabase. La base conserve uniquement le hachage du code. L’API passe par des fonctions vérifiant ce code ; l’accès direct aux tables est fermé.

Sans configuration Supabase, le mode essai est temporaire, en mémoire. Le message de statut le rappelle. Un export permet de garder une copie. Il n’y a pas d’import automatique dans cette version. Les essais présents sont exportés avant la première connexion à l’espace partagé.

## Activités

Onglet Activités → Ajouter une activité : nom, description, catégorie et durée proposée. Le bouton Modifier permet aussi de modifier les activités de base depuis le téléphone. Aucune manipulation de JSON n’est nécessaire. Les séances existantes gardent le nom et la catégorie au moment de leur création.

## Mesures

Chaque personne peut activer son suivi séparément. Saisie du poids et/ou de la masse graisseuse en pourcentage, notes, courbe et historique modifiable. Les nombres avec virgule sont acceptés. Ce suivi ne rapporte aucun point et ne compare jamais les deux personnes. Pas de poids initial inventé, pas d’objectif imposé.

Les mesures enregistrées sont partagées avec l’autre membre. Masquer ou désactiver cet onglet ne constitue pas une restriction d’accès : cela masque l’affichage sur cet appareil, sans supprimer les données. Pour une mesure réellement privée, ne pas la saisir dans cet espace partagé.

## Déploiement et vérifications

Fichiers à la racine du dépôt, GitHub Pages sur main/root. Les chemins sont relatifs, compatibles avec `/DuoFit/`. Les assets ont une version dans leur URL pour éviter un mélange de vieux et nouveaux fichiers en cache. Interface sans police distante obligatoire.

Les points reposent sur les séances : 10 + 2 par tranche de 5 minutes (bonus de durée plafonné à 20), +10 par personne pour une séance ensemble, +5 par défi validé une fois par jour et par personne. 100 points par niveau. Les mesures n’entrent pas dans ce calcul.

Les données sont actualisées à l’ouverture, au retour sur l’application, ou avec le bouton Actualiser. Les erreurs réseau empêchent la confirmation d’une sauvegarde ; pas de faux enregistrement local lorsque le stockage est configuré. Ce carnet n’est pas utilisable hors ligne pour ajouter des données au stockage partagé.
