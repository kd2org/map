# Map.KD2.org

Voir la démo sur [map.kd2.org](https://map.kd2.org/)

Ceci est un outil de cartographie pour la randonnée, permettant de :

* visualiser des cartes en ligne venant de la plupart des fournisseurs mondiaux
* visualiser des traces et routes GPX
* ajouter des marqueurs sur les cartes
* enregistrer les données ajoutées sur la carte en GPX
* fusionner des traces et routes GPX (charger plusieurs traces sur la carte, puis enregistrer)
* sauvegarde de la carte visible en fichier MBTiles à plusieurs niveaux de zoom
* profil altimétrique des traces GPX affichées

## Installation

Il est possible de faire fonctionner cet outil sur n'importe quel serveur web, sans avoir besoin d'installer quoi que ce soit : tout est fait en JS sur le navigateur du visiteur.

Pour accéder aux cartes IGN, Here WeGo et MapBox il convient de se créer des clés d'API, et les renseigner dans le fichier `map.providers_keys.js` (à recopier depuis `map.providers_keys.js.example`).

Il faut ensuite positionner le serveur web vers le chemin de cet outil.

## Licence

GNU AGPL v3

## Modules Leaflet custom

Cet outil utilise des modules Leaflet développés pour l'occasion :

* Export Tiles: permet d'exporter une vue de la carte en fichier MBTiles (nécessite [SQL.js](https://github.com/sql-js/sql.js/))
* GPX2: chargement / export de fichier GPX (plus complet que le module GPX de Leaflet original de Maxime Petazzoni)
* Elevation: crée un profil altimétrique en SVG

Vous pouvez réutiliser ces modules sous licence LGPL, n'oubliez juste pas de reverser les modifs :)