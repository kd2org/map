# Map.KD2.org

Voir la démo sur [map.kd2.org](https://map.kd2.org/)

Ceci est un outil de cartographie pour la randonnée, permettant de :

* visualiser des cartes en ligne venant de la plupart des fournisseurs mondiaux
* visualiser des traces et routes GPX
* ajouter des marqueurs sur les cartes
* enregistrer les données ajoutées sur la carte en GPX
* fusionner des traces et routes GPX (charger plusieurs traces sur la carte, puis enregistrer)
* sauvegarde de la carte visible en fichier MBTiles à plusieurs niveaux de zoom (ne fonctionne qu'avec les fournisseurs qui fournissent un entête HTTP `access-control-allow-origin: *`)
* sauvegarde de la carte visible sous forme d'image à plusieurs niveaux de zoom (même restriction que pour MBTiles)
* profil altimétrique des traces GPX affichées
* export HTML de la carte visualisée, avec les tracés dessus
* mesure de distance sur la carte

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

## TODO list

* Pouvoir choisir la couleur d'un tracé ou d'une route GPX
* Export de carte avec les tracés et marqueurs en image
* Export MBTiles: Prévisualisation d'une tuile pour indiquer le niveau de zoom, dans la sélection de niveaux de zoom
* Création de tracé sur la carte
* Modification des tracés sur la carte
* Suppression d'un seul tracé de la carte
* Panneau latéral pour lister les tracés et points sur la carte
* Sauvegarde et restauration de l'état de la carte (via localStorage)
* Import GPX: gestion des couleurs, des icônes des waypoints
* Export GPX: stocker la couleur et les icônes des waypoints
* Impression de carte
* Ajouter un bouton éditer dans OSM
* Possibilité de créer des itinéraires avec BRouter/OSRM/YOURS
* Partage de position sur la carte
* Possibilité de simplifier le nombre de points d'un tracé
* Colorisation du tracé selon la pente (inspiré de https://iosphere.github.io/Leaflet.hotline/demo/) en ayant une couleur différente lors des descentes (à la OruxMaps ?)
* Possibilité d'utiliser des cartes vectorielles : https://gitlab.com/jkuebart/Leaflet.VectorTileLayer/ (EOTopo, MAPBox)
* Télécharger des cartes vecto en MBTiles pour usage offline ! https://gis.stackexchange.com/questions/217704/vector-tile-formats-vector-mbtiles-and-mvf/217836 (sous Android il y a cette lib : http://mousebird.github.io/WhirlyGlobe/ )
* Profil coloré : https://github.com/GIScience/Leaflet.Heightgraph

Lisser les traces GPS :
https://www.gpsvisualizer.com/tutorials/elevation_gain.html