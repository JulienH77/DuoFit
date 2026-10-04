# DUO FIT — V001

Premier prototype fonctionnel d'une application web sportive à deux.

## Lancer
Ouvrir `index.html` dans un navigateur.

Aucune installation ni serveur n'est nécessaire.

## Données
Cette V001 utilise `localStorage` pour être immédiatement testable.
Les données sont stockées dans le navigateur sous la clé `duo_fit_v001`.

## Fonctionnalités
- Dashboard personnel et collectif
- Deux profils : Julien / Elle
- Calendrier mensuel
- Bibliothèque d'exercices illustrés
- Création de séances
- Séries, répétitions, durée
- Activités rapides
- Points
- XP et niveaux
- Défis individuels, compétition et coopération
- Classement hebdomadaire
- Records/statistiques de base
- Interface responsive mobile

## Suite prévue
Pour une version de production :
1. Supabase Auth
2. tables Supabase pour utilisateurs, exercices, séances et défis
3. synchronisation temps réel entre les deux téléphones
4. stockage des illustrations dans Supabase Storage
5. système de badges/records plus poussé
6. objectifs personnalisés
