var providers_categories = {
	'General': ['OSM', 'ESRI.WorldStreetMap', 'HERE.Maps', 'HERE.Maps.Night', 'HERE.Traffic', 'G.Maps', 'Local'],
	'Bicycle': ['CyclOSM', 'OpenCycleMap', 'CycleTravel', 'MTBMap', 'HikeBike'],
	'Topo': ['OTM', 'Mapy.Outdoor', 'SigmaTopo', 'ESRI.WorldTopo', 'HERE.Terrain', 'Thunderforest.Landscape',
		'Thunderforest.Outdoors', 'ESRI.NatGeoWorldMap', 'Refuges', 'Reitkarte'],
	'Satellite': ['HERE.Satellite', 'ESRI.WorldImagery', 'HERE.Hybrid', 'G.Satellite'],
	'Public transport': ['Thunderforest.Transport', 'HERE.Transit'],
	'Spain': ['ES.IGN'],
	'Italy': ['IT.IGMI'],
	'France': ['FR.IGN', 'FR.IGN.TOPO', 'FR.IGN.V2', 'FR.IGN.SCANEXPRESS', 'FR.IGN.PHOTOS', 'FR.OSM', 'FR.TOPEN25'],
	'Australia': ['AU.Base', 'AU.Topo', 'AU.HEMA', 'AU.EOTopo', 'AU.NSW.Base', 'AU.NSW.Topo', 'AU.NSW.Aerial',
		"AU.SA.Topo",
		'AU.TAS.Scan', 'AU.TAS.Topo', 'AU.TAS.Aerial',
		'AU.VIC.Mapscape'],
	'New Zealand': ['NZ.Topo'],
	'Denmark': ['DK.Topo', 'DK.Topo2', 'DK.Topo3', 'DK.Topo4', 'DK.Topo5'],
	'Sweden': ['SE.Topo', 'SE.Mountain', 'SE.Hitta', 'SE.Hitta2', 'SE.HittaSat'],
	'Finland': ['FI.Topo', 'FI.Simplified', 'FI.Satellite'],
	'Norway': ['NO.MTBMap', 'NO.Norgeskart'],
	'Decorative': ['CartoDB.Positron', 'Stamen.Watercolor', 'Stamen.Toner',
		'MapBox.Pirate', 'MapBox.SpaceStation', 'MapBox.Assemblage', 'MapBox.RoadTrippers',
		'MapBox.Wheatpaste', 'MapBox.PiratesReturn', 'MapBox.Pinterest', 'MapBox.Pencil', 'MapBox.ControlRoom',
		'MapBox.GeographyClass'],
};

var providers = {
	'Local': {
		label: 'Local Mapsforge tile server',
		tile_url: '//localhost:6090/{z}/{x}/{y}'
	},
	'OSM': {
		label: 'OpenStreetMap',
		tile_url: '//tile.openstreetmap.org/{z}/{x}/{y}.png',
		source: '[[OpenStreetMap|//www.openstreetmap.org/]]',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors'
	},
	'OTM': {
		label: 'OpenTopoMap',
		tile_url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
		source: '[[OpenTopoMap|https://opentopomap.org/]]',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors',
		maxZoom: 15,
		minZoom: 2,
		legend_url: 'https://opentopomap.org/about'
	},
	'CyclOSM': {
		label: 'CyclOSM',
		tile_url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
		source: '[[CyclOSM|https://www.cyclosm.org/]]',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors'
	},
	'SigmaTopo': {
		label: 'Sigma Topo',
		maxZoom: 14,
		tile_url: '//tiles1.sigma-dc-control.com/layer5/{z}/{x}/{y}.png',
		source: '[[SIGMA Sport|//www.sigmasport.com/]]',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors',
		legend_url: '//www.gpsies.com/page.do?page=mapLegend'
	},
	'Mapy.Outdoor': {
		label: 'Mapy.cz Outdoor',
		maxZoom: 19,
		tile_url: 'https://mapserver.mapy.cz/turist-m/{z}-{x}-{y}',
		source: '[[Mapy.cz|https://en.mapy.cz/]]',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors',
		legend_url: "https://en.mapy.cz/?lgnd=1",
	},
	'WikiMedia': {
		label: 'WikiMedia',
		tile_url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',
		maxZoom: 18,
		source: '[[WikiMedia|https://www.mediawiki.org/wiki/Maps]]',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors'
	},
	'Refuges': {
		'label': 'Refuges.info (EU Huts)',
		'tile_url': 'https://maps.refuges.info/hiking/{z}/{x}/{y}.png',
		'source': '[[Refuges.info|https://wiki.openstreetmap.org/wiki/Hiking/mri]]',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors',
		'bounds': [[33.0, -25.0], [72.0, 45.0]]
	},
	'Reitkarte': {
		'label': 'Reit- und Wanderkarte',
		'tile_url': 'https://www.wanderreitkarte.de/topo/{z}/{x}/{y}.png',
		'source': '[[Nop\'s Hiking and Trail Riding Map|https://www.wanderreitkarte.de/]]',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors',
		'bounds': [[27.3, -32], [71.5, 30.3]]
	},

	/* Divers vélo */
	'OpenCycleMap': {
		label: 'OpenCycleMap',
		tile_url: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=a5dd6a2f1c934394bce6b0fb077203eb',
		source: '[[OpenCycleMap|//www.opencyclemap.org/]]',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors',
		legend_url: '//www.opencyclemap.org/docs/'
	},
	'MTBMap': {
		label: 'MTB Map Europe',
		tile_url: 'http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png',
		source: '[[MTBMap.cz|//mtbmap.cz/]]',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors &amp; USGS',
		legend_url: '//mtbmap.cz/map/legend/?zoom={z}'
	},
	'HikeBike': {
		label: 'Hike &amp; Bike',
		tile_url: 'http://{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png',
		source: '[[HikeBike|//www.hikebikemap.org/]]',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors'
	},
	'CycleTravel': {
		'label': 'Cycle.travel',
		'tile_url': 'https://eu.cycle.travel/topoclassical_eu/{z}/{x}/{y}.png',
		'source': '[[Cycle.travel|https://cycle.travel/]]',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors',
		'bounds': [[33.0, -25.0], [72.0, 45.0]]
	},
	/*
	'SigmaCycle': {
		label: 'Sigma Cycle',
		tile_url: '//tiles1.sigma-dc-control.com/layer8/{z}/{x}/{y}.png',
		copy: '[[SIGMA Sport|//www.sigmasport.com/]]',
		legend_url: '//www.gpsies.com/page.do?page=mapLegend'
	},
	*/

	/* ESRI */
	'ESRI.WorldTopo': {
		label: 'ESRI World topo',
		tile_url: '//server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
		copy: 'Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
	},
	'ESRI.WorldImagery': {
		label: 'ESRI World imagery',
		tile_url: '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
		copy: 'Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
	},
	'ESRI.WorldStreetMap': {
		label: 'ESRI Roads map',
		tile_url: '//server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
		copy: 'Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
	},
	'ESRI.NatGeoWorldMap': {
		label: 'National Geographic',
		maxZoom: 12,
		tile_url: '//server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
		copy: 'Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
	},

	/* Thunderforest */
	'Thunderforest.Transport': {
		label: 'Thunderforest Transport',
		tile_url: '//{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png',
		copy: '[[OpenCycleMap|//www.opencyclemap.org]], [[OpenStreetMap|//www.openstreetmap.org/copyright]]'
	},
	'Thunderforest.Landscape': {
		label: 'Thunderforest Landscape',
		tile_url: '//{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
		copy: '[[OpenCycleMap|//www.opencyclemap.org]], [[OpenStreetMap|//www.openstreetmap.org/copyright]]'
	},
	'Thunderforest.Outdoors': {
		label: 'Thunderforest Outdoors',
		tile_url: '//{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png',
		copy: '[[OpenCycleMap|//www.opencyclemap.org]], [[OpenStreetMap|//www.openstreetmap.org/copyright]]'
	},

	/* Décoratif */
	'CartoDB.Positron': {
		label: 'Positron CartoDB',
		tile_url: '//{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
		copy: '<a href="//www.openstreetmap.org/copyright">OpenStreetMap</a> &amp; <a href="//cartodb.com/attributions">CartoDB</a>',
		subdomains: 'abcd',
		minZoom: 0,
		maxZoom: 18
	},
	'Stamen.Watercolor': {
		label: 'Stamen Watercolor',
		tile_url: '//{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png',
		copy: '[[Stamen Design|//stamen.com]], [[CC BY 3.0|//creativecommons.org/licenses/by/3.0]] &mdash; Map data [[OpenStreetMap|//www.openstreetmap.org/copyright]]',
		minZoom: 1,
		maxZoom: 16
	},
	'Stamen.Toner': {
		label: 'Stamen Toner',
		tile_url: '//{s}.tile.stamen.com/toner/{z}/{x}/{y}.png',
		copy: '[[Stamen Design|//stamen.com]], [[CC BY 3.0|//creativecommons.org/licenses/by/3.0]] &mdash; Map data &copy; [[OpenStreetMap|//www.openstreetmap.org/copyright]]',
		minZoom: 0,
		maxZoom: 20
	},
	'MapBox.Pirate': {
		label: 'MapBox Pirate',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors',
		tile_url: 'https://b.tiles.mapbox.com/v3/aj.Sketchy2/{z}/{x}/{y}.png?access_token=' + MAPBOX_KEY,
		maxZoom: 6
	},
	'MapBox.SpaceStation': {
		label: 'MapBox Space Station',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors',
		tile_url: 'https:\/\/a.tiles.mapbox.com\/v4\/examples.3hqcl3di\/{z}\/{x}\/{y}.png?access_token=' + MAPBOX_KEY,
		maxZoom: 19
	},
	'MapBox.Assemblage': {
		label: 'MapBox Assemblage',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors',
		tile_url: 'https:\/\/a.tiles.mapbox.com\/v4\/saman.h6ek9086\/{z}\/{x}\/{y}.png?access_token=' + MAPBOX_KEY,
		maxZoom: 22
	},
	'MapBox.RoadTrippers': {
		label: 'MapBox RoadTrippers',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors',
		tile_url: 'https:\/\/a.tiles.mapbox.com\/v4\/examples.ra3sdcxr\/{z}\/{x}\/{y}.png?access_token=' + MAPBOX_KEY,
		maxZoom: 21
	},
	'MapBox.Wheatpaste': {
		label: 'MapBox Wheatpaste',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors',
		tile_url: 'https:\/\/a.tiles.mapbox.com\/v4\/villeda.c4c63d13\/{z}\/{x}\/{y}.png?access_token=' + MAPBOX_KEY,
		maxZoom: 22
	},
	'MapBox.PiratesReturn': {
		label: 'MapBox Pirates Return',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors',
		tile_url: 'https:\/\/a.tiles.mapbox.com\/v4\/examples.a3cad6da\/{z}\/{x}\/{y}.png?access_token=' + MAPBOX_KEY,
		maxZoom: 21
	},
	'MapBox.Pinterest': {
		label: 'MapBox Pinterest',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors',
		tile_url: 'https:\/\/a.tiles.mapbox.com\/v3\/pinterest.ijz1714i\/{z}\/{x}\/{y}.png?access_token=' + MAPBOX_KEY,
		maxZoom: 22
	},
	'MapBox.Pencil': {
		label: 'MapBox Pencil',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors',
		tile_url: 'https:\/\/a.tiles.mapbox.com\/v4\/examples.a4c252ab\/{z}\/{x}\/{y}.png?access_token=' + MAPBOX_KEY,
		maxZoom: 21
	},
	'MapBox.ControlRoom': {
		label: 'MapBox Control Room',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors',
		tile_url: 'https:\/\/a.tiles.mapbox.com\/v3\/mapbox.control-room\/{z}\/{x}\/{y}.png?access_token=' + MAPBOX_KEY,
		maxZoom: 8
	},
	'MapBox.GeographyClass': {
		label: 'MapBox Geography Class',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors',
		tile_url: 'https:\/\/a.tiles.mapbox.com\/v3\/mapbox.geography-class\/{z}\/{x}\/{y}.png?access_token=' + MAPBOX_KEY,
		maxZoom: 8
	},

	/* GMAPS */
	'G.Maps': {
		label: 'G Maps',
		tile_url: '//mt0.google.com/vt/lyrs=m@169000000&hl=en&x={x}&y={y}&z={z}&s=Ga'
	},
	'G.Satellite': {
		label: 'G Satellite',
		tile_url: '//mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
	},

	/* HERE, see https://developer.here.com/documentation/map-tile/topics/request-constructing.html */
	'HERE.Maps': {
		label: 'HERE Maps',
		tile_url: 'https://{s}.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?' + HERE_PARAMS,
		copy: '[[Nokia HERE|//here.com/]]',
		subdomains: '1234'
	},
	'HERE.Maps.Night': {
		label: 'HERE Maps Night',
		tile_url: 'https://{s}.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.night/{z}/{x}/{y}/256/png8?' + HERE_PARAMS,
		copy: '[[Nokia HERE|//here.com/]]',
		subdomains: '1234'
	},
	'HERE.Terrain': {
		label: 'HERE Terrain',
		tile_url: 'https://{s}.aerial.maps.ls.hereapi.com/maptile/2.1/maptile/newest/terrain.day/{z}/{x}/{y}/256/png8?' + HERE_PARAMS,
		copy: '[[Nokia HERE|//here.com/]]',
		subdomains: '1234'
	},
	'HERE.Traffic': {
		label: 'HERE Trafic',
		tile_url: '//{s}.traffic.maps.ls.hereapi.com/maptile/2.1/traffictile/newest/normal.traffic.day/{z}/{x}/{y}/256/png8?' + HERE_PARAMS,
		copy: '[[Nokia HERE|//here.com/]]',
		subdomains: '1234'
	},
	'HERE.Satellite': {
		label: 'HERE Satellite',
		tile_url: 'https://{s}.aerial.maps.ls.hereapi.com/maptile/2.1/maptile/newest/satellite.day/{z}/{x}/{y}/256/jpg?' + HERE_PARAMS,
		copy: '[[Nokia HERE|//here.com/]]',
		subdomains: '1234'
	},
	'HERE.Hybrid': {
		label: 'HERE Hybrid',
		tile_url: 'https://{s}.aerial.maps.ls.hereapi.com/maptile/2.1/maptile/newest/hybrid.day/{z}/{x}/{y}/256/jpg?' + HERE_PARAMS,
		copy: '[[Nokia HERE|//here.com/]]',
		subdomains: '1234'
	},
	'HERE.Transit': {
		label: 'HERE Public transport',
		tile_url: 'https://{s}.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.day.transit/{z}/{x}/{y}/256/png8?' + HERE_PARAMS,
		copy: '[[Nokia HERE|//here.com/]]',
		subdomains: '1234'
	},

	/* Pays */
	'NZ.Topo': {
		label: 'LINZ Topo',
		tile_url: 'https://nztiles.haere.net/{z}/{x}/{y}.jpg',
		minZoom: 8,
		maxZoom: 15,
		maxNativeZoom: 14,
		bounds: [[-50.8518089754, 165.893036472], [-34.4147179327,178.557618293]],
		copy: 'Creative Commons Attribution [[LINZ|//linz.govt.nz/]]',
		source: '[[Haere.net|//haere.net/]]',
		legend_url: 'legend/linz.png'
	},
	'AU.Base': {
		'label': 'Geoscience Base',
		'tile_url': 'https://services.ga.gov.au/gis/rest/services/NationalBaseMap/MapServer/tile/{z}/{y}/{x}',
		'minZoom': 1,
		'maxZoom': 16,
		'bounds': [[-43.6480550261,113.224427389],[-10.7097180211,153.606000214]],
		'copy': '[[Copyleft Geoscience|https://services.ga.gov.au/gis/rest/services/NationalBaseMap/MapServer/legend]]'
	},
	'AU.Topo': {
		'label': 'Geoscience Topo 1:150,000',
		'tile_url': 'https://services.ga.gov.au/gis/rest/services/Topographic_Base_Map/MapServer/tile/{z}/{y}/{x}',
		'minZoom': 1,
		'maxZoom': 12,
		'bounds': [[-43.6480550261,113.224427389],[-10.7097180211,153.606000214]],
		'copy': '[[Copyleft Geoscience|//gaservices.ga.gov.au/site_7/rest/services/Topographic_Base_Map_WM/MapServer]]',
		'legend_url': 'https://services.ga.gov.au/gis/rest/services/Topographic_Base_Map/MapServer/legend'
	},
	'AU.HEMA': {
		'label': 'HEMA',
		'tile_url': 'http://skippy.hema-labs.com/AUS/ExplorerMap_v1_2/{z}/{y}/{x}.png',
		'bounds': [[-43.6480550261,113.224427389],[-10.7097180211,153.606000214]],
	},
	'AU.EOTopo': {
		label: 'EOTopo',
		tile_url: 'http://au-maptiles.kd2.org/{z}/{x}/{y}',
		maxZoom: 13,
		bounds: [[-43.6480550261,113.224427389],[-10.7097180211,153.606000214]],
		copy: 'I.T. Beyond Pty Ltd',
		legend_url: 'https://maps.exploroz.com/images/Legend_2019.pdf'
	},
	'AU.NSW.Base': {
		label: 'New South Wales - Base map',
		minZoom: 5,
		maxZoom: 19,
		tile_url: '//maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Base_Map/MapServer/tile/{z}/{y}/{x}',
		bounds: [[-37.50515,140.99922],[-28.15689,159.10544]],
		source: 'Copyleft Creative Commons - [[NSW LPI|//www.lpi.nsw.gov.au/mapping_and_imagery/lpi_web_services]]'
	},
	'AU.NSW.Topo': {
		label: 'New South Wales - Topo',
		minZoom: 5,
		maxZoom: 17,
		tile_url: '//maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Topo_Map/MapServer/tile/{z}/{y}/{x}',
		bounds: [[-37.50515,140.99922],[-28.15689,159.10544]],
		source: 'Copyleft Creative Commons - [[NSW LPI|//www.lpi.nsw.gov.au/mapping_and_imagery/lpi_web_services]]'
	},
	'AU.NSW.Aerial': {
		label: 'New South Wales - Aerial',
		minZoom: 5,
		maxZoom: 20,
		tile_url: '//maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Imagery/MapServer/tile/{z}/{y}/{x}',
		bounds: [[-37.50515,140.99922],[-28.15689,159.10544]],
		source: 'Copyleft Creative Commons - [[NSW LPI|//www.lpi.nsw.gov.au/mapping_and_imagery/lpi_web_services]]'
	},
	"AU.SA.Topo": {
		"label": "South Australia - Topo",
		"maxZoom": 16,
		"minZoom": 4,
		"tile_url": "https://basemap.geohub.sa.gov.au/server/rest/services/BaseMaps/Topographic_wmas/MapServer/tile/{z}/{y}/{x}",
        "bounds": [[-37.0552, 129.0],[-26.1752, 141.2183]],
		"source": "[[LocationSA|//location.sa.gov.au/viewer/]]",
		'copy': 'CC-By License'
	},
	'AU.TAS.Scan': {
		label: 'Tasmania - TASMap Scan',
		minZoom: 5,
		maxZoom: 16,
		tile_url: '//services.thelist.tas.gov.au/arcgis/rest/services/Basemaps/TasmapRaster/MapServer/tile/{z}/{y}/{x}',
		bounds: [[-44.00000,143.50000],[-39.20000,149.00000]],
		source: '[[TASMap|https://www.tasmap.tas.gov.au/]]',
		copy: 'Creative Commons BY - LIST'
	},
	'AU.TAS.Topo': {
		label: 'Tasmania - TASMap Topo',
		minZoom: 5,
		maxZoom: 18,
		tile_url: '//services.thelist.tas.gov.au/arcgis/rest/services/Basemaps/Topographic/MapServer/tile/{z}/{y}/{x}',
		bounds: [[-44.00000,143.50000],[-39.20000,149.00000]],
		source: '[[TASMap|https://www.tasmap.tas.gov.au/]]',
		copy: 'Creative Commons BY - LIST'
	},
	'AU.TAS.Aerial': {
		label: 'Tasmania - State Aerial Photo',
		minZoom: 5,
		maxZoom: 19,
		tile_url: '//services.thelist.tas.gov.au/arcgis/rest/services/Basemaps/Orthophoto/MapServer/tile/{z}/{y}/{x}',
		bounds: [[-44.00000,143.50000],[-39.20000,149.00000]],
		source: '[[TASMap|https://www.tasmap.tas.gov.au/]]'
	},
	'AU.VIC.Mapscape': {
		label: 'Victoria - Mapscape',
		tile_url: '//tiles-proxy.spatialvision.com.au/v2/mapscape_vic_merc_colour_ed9/{z}/{x}/{y}.png',
		source: '[[Spatial Vision|//spatialvision.com.au/]]',
		bounds: [[-40.9633, 135.1868], [-29.5926, 157.5989]]
	},
	'FR.IGN': {
		label: 'IGN GéoPortail SCAN25 (uniquement)',
		tile_url: '//data.geopf.fr/private/wmts?layer={type}&apikey=ign_scan_ws&style=normal&tilematrixset=PM&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix={z}&TileCol={x}&TileRow={y}',
		type: 'GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN25TOUR',
		bounds: [[41.333333, -5.133333], [51.083333, 9.533333]],
		minZoom: 7,
		maxZoom: 17,
		copy: '[[IGN|//www.ign.fr/]]'
	},
	'FR.IGN.TOPO': {
		label: 'IGN GéoPortail SCAN25 (+ autres échelles)',
		tile_url: '//data.geopf.fr/private/wmts?layer={type}&apikey=ign_scan_ws&EXCEPTIONS=text/xml&FORMAT=image/jpeg&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}',
		type: 'GEOGRAPHICALGRIDSYSTEMS.MAPS', //GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN25TOPO.L93
		bounds: [[41.333333, -5.133333], [51.083333, 9.533333]],
		minZoom: 7,
		maxZoom: 17,
		copy: '[[IGN|//www.ign.fr/]]'
	},
	'FR.IGN.SCANEXPRESS': {
		label: 'IGN GéoPortail Scan Express',
		tile_url: '//data.geopf.fr/private/wmts?layer={type}&apikey=ign_scan_ws&EXCEPTIONS=text/xml&FORMAT=image/jpeg&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}',
		type: 'GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.STANDARD',
		bounds: [[41.333333, -5.133333], [51.083333, 9.533333]],
		minZoom: 7,
		maxZoom: 17,
		copy: '[[IGN|//www.ign.fr/]]'
	},
	'FR.IGN.V2': {
		label: 'IGN GéoPortail Plan v2',
		tile_url: '//data.geopf.fr/private/wmts?layer={type}&apikey=ign_scan_ws&EXCEPTIONS=text/xml&FORMAT=image/png&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}',
		type: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
		bounds: [[41.333333, -5.133333], [51.083333, 9.533333]],
		minZoom: 7,
		maxZoom: 17,
		copy: '[[IGN|//www.ign.fr/]]'
	},
	'FR.IGN.PHOTOS': {
		label: 'IGN BD Ortho',
		tile_url: 'https://data.geopf.fr/tms/1.0.0/ORTHOIMAGERY.ORTHOPHOTOS/{z}/{x}/{y}.jpeg',
		bounds: [[41.333333, -5.133333], [51.083333, 9.533333]],
		minZoom: 7,
		maxZoom: 19,
		copy: '[[IGN|//www.ign.fr/]]'
	},
	'FR.OSM': {
		label: 'OpenStreetMap France',
		tile_url: '//a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',
		bounds: [[41.333333, -5.133333], [51.083333, 9.533333]],
		minZoom: 5,
		source: '[[OpenStreetMap France|//tile.openstreetmap.fr/]]',
		copy: '[[OSM|//www.openstreetmap.org/]] contributors'
	},
	'FR.TOPEN25': {
		label: 'TOpen25',
		tile_url: '//osm.cquest.org/topen25@x2/{z}/{x}/{y}.png',
		bounds: [[41.333333, -5.133333], [51.083333, 9.533333]],
		minZoom: 15,
		maxZoom: 15,
		source: 'Rendu TOPen25 by cquest (CC-BY-SA), données IGN BDTopo 2020-09 / BDAlti (LO)'
	},
	'ES.IGN': {
		type: 'wms',
		label: 'IGN Topo',
		tile_url: '//www.ign.es/wms-inspire/mapa-raster',
		layers: 'mtn_rasterizado',
		format: 'image/png',
		minZoom: 4,
		maxZoom: 19,
		bounds: [[36.6582, -9.3054], [43.7698, 3.8899]],
		copy: '[[IGN|//www.ign.es/]]'
	},
	'IT.IGMI': {
		'type': 'wms',
		'label': 'IGMI Overview',
		'tile_url': 'http://212.77.67.76/wms2',
		'layers': 'ristonchi',
		'format': 'image/png',
		'bounds': [[35.2889616, 6.6272658], [47.0921462, 18.7844746]]
	},
	'NO.MTBMap': {
		label: 'MTBMap.no',
		tile_url: '//{s}.tiles.mtbmap.no/osm/mtbmap/{z}/{x}/{y}.png',
		bounds: [[56.15, 3.033333],	[71.181944, 31.166667]],
		minZoom: 5,
		maxZoom: 16,
		copy: '[[MTBMap.no|//mtbmap.no/]]'
	},
	'NO.Norgeskart': {
		label: 'Norgeskart',
		tile_url: '//opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo2&zoom={z}&x={x}&y={y}',
		bounds: [[56.15, 3.033333],	[71.181944, 31.166667]],
		copy: '[[Kartverket|//www.kartverket.no/]]'
	},
	'FI.Topo': {
		'label': 'Peruskartta (Topo)',
		'tile_url': 'https://tiles.kartat.kapsi.fi/peruskartta/{z}/{x}/{y}.jpg',
		'copy': '[[Kapsi|https://kartat.kapsi.fi]]'
	},
	'FI.Simplified': {
		'label': 'Taustakartta (Simplified map)',
		'tile_url': 'https://tiles.kartat.kapsi.fi/taustakartta/{z}/{x}/{y}.jpg',
		'copy': '[[Kapsi|https://kartat.kapsi.fi]]'
	},
	'FI.Satellite': {
		'label': 'Ortoilmakuva (Satellite)',
		'tile_url': 'https://tiles.kartat.kapsi.fi/ortokuva/{z}/{x}/{y}.jpg',
		'copy': '[[Kapsi|https://kartat.kapsi.fi]]'
	},
	'SE.Topo': {
		'label': 'Lantmäteriets Topografisk (Topo map)',
		'tile_url': 'https://minkarta.lantmateriet.se/map/topowebbcache/?layer=topowebb&style=default&tilematrixset=3857&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={z}&TileCol={x}&TileRow={y}',
		'copy': '[[Lantmäteriet|https://minkarta.lantmateriet.se]]'
	},
	'SE.Mountain': {
		'label': 'Lantmäteriets Fjällkarta (Mountain map)',
		'minZoom': 5,
		'maxZoom': 12,
		'tile_url': 'https://johanberonius.github.io/Lantmateriets-Fjallkarta/tiles/{z}/{x}/{y}.jpg',
		'copy': '[[Lantmäteriet|https://minkarta.lantmateriet.se]] / [[Johan Beronius|https://github.com/johanberonius/Lantmateriets-Fjallkarta]]'
	},
	'SE.Hitta': {
		'label': 'Hitta',
		'tile_url': 'http://static.hitta.se/tile/v3/0_2x/{z}/{x}/{-y}',
		'copy': '[[Hitta|https://hitta.se]]'
	},
	'SE.Hitta2': {
		'label': 'Hitta Frilufts (Topo)',
		'tile_url': 'http://static.hitta.se/tile/v3/4_2x/{z}/{x}/{-y}',
		'copy': '[[Hitta|https://hitta.se]]'
	},
	'SE.HittaSat': {
		'label': 'Hitta Satellite',
		'tile_url': 'http://static.hitta.se/tile/v3/1/{z}/{x}/{-y}',
		'copy': '[[Hitta|https://hitta.se]]'
	},
	'DK.Topo': {
		'label': 'Kort25 Klassisk (Topo 25)',
		'type': 'wms',
		'layers': 'topo25_klassisk',
		'tile_url': 'https://api.dataforsyningen.dk/topo25?token=f3ecb52320902f733a433aa9945d8dc8',
		'copy': '[[Kortforsyningen|https://kortforsyningen.dk/indhold/webservice-liste]]'
	},
	'DK.Topo2': {
		'label': 'Kort25 dæmpet (Topo 25 yellow)',
		'type': 'wms',
		'layers': 'topo25_daempet',
		'tile_url': 'https://api.dataforsyningen.dk/topo25?token=f3ecb52320902f733a433aa9945d8dc8',
		'copy': '[[Kortforsyningen|https://kortforsyningen.dk/indhold/webservice-liste]]'
	},
	'DK.Topo3': {
		'label': 'Kort25 grå (Topo 25 gray)',
		'type': 'wms',
		'layers': 'topo25_graa',
		'tile_url': 'https://api.dataforsyningen.dk/topo25?token=f3ecb52320902f733a433aa9945d8dc8',
		'copy': '[[Kortforsyningen|https://kortforsyningen.dk/indhold/webservice-liste]]'
	},
	'DK.Topo4': {
		'label': 'Kort50 (Topo 50)',
		'type': 'wms',
		'layers': 'dtk_2cm',
		'tile_url': 'https://api.dataforsyningen.dk/topo50?token=f3ecb52320902f733a433aa9945d8dc8',
		'copy': '[[Kortforsyningen|https://kortforsyningen.dk/indhold/webservice-liste]]'
	},
	'DK.Topo5': {
		'label': 'Kort100 (Topo 100)',
		'type': 'wms',
		'layers': 'dtk_1cm',
		'tile_url': 'https://api.dataforsyningen.dk/topo100?token=f3ecb52320902f733a433aa9945d8dc8',
		'copy': '[[Kortforsyningen|https://kortforsyningen.dk/indhold/webservice-liste]]'
	}
};

/* Bounds:
France = -5.133333	41.333333	9.533333	51.083333
min_lon	min_lat	max_lon	max_lat
=> leaflet format: [[min_lat, min_lon], [max_lat, max_lon]]
=> bounds: [[41.333333, -5.133333], [51.083333, 9.533333]],

Findin other country bounds: //wiki.openstreetmap.org/wiki/User:Ewmjc/Country_bounds
*/