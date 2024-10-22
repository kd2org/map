(function () {
	var layers = {};
	var scripts = {};
	var stylesheets = [];
	var default_layer = 'OTM';

	function js(url, callback) {
		if (Array.isArray(url) && url.length == 1) {
			url = url.pop();
		}
		else if (Array.isArray(url)) {
			js(url.pop(), () => js(url, callback));
		}

		if (url in scripts) {
			callback();
		}
		else {
			var s = scripts[url] =  document.createElement('script');
			s.src = url + (url.indexOf('?') == -1 ? '?' : '&') + '2024';
			s.async = true;
			s.defer = true;
			s.onload = callback;
			document.head.appendChild(s);
		}
	}

	// synchronous script load
	function loadScript(url) {
		return new Promise((resolve) => {
			if (url in scripts) {
				resolve(scripts[url]);
				return;
			}

			let script = scripts[url] = document.createElement('script');
			script.type = 'text/javascript';
			script.async = true;
			script.src = url + '?2024';
			script.onload = () => resolve(script);
			document.head.appendChild(script);
		});
	}

	function css(url) {
		if (url in stylesheets) return false;

		var l = stylesheets[url] = document.createElement('link');
		l.rel = 'stylesheet';
		l.type = 'text/css';
		l.href = url;
		return document.head.appendChild(l);
	}

	window.onload = function () {
		document.body.className = '';
	};

	function $(id) {
		return document.getElementById(id.substr(1));
	}

	function _(str) {
		if (typeof lang_strings != 'undefined' && str in lang_strings)
			return lang_strings[str];
		return str;
	}

	function ConvertDDToDMS(D, lng){
		return [0|D, ' ', 0|(D<0?D=-D:D)%1*60, " ", 0|D*60%1*60, ' ', D<0?lng?'W':'S':lng?'E':'N'].join('');
	}

	function fetchPreferences()
	{
		if (!localStorage || !JSON || !localStorage.getItem('preferences'))
		{
			return {
				location: [48.856666, 2.350987],
				zoom: 10,
				layer: 'HERE Map',
				dms: false
			};
		}

		return JSON.parse(localStorage.getItem('preferences'));
	}

	function storePreferences()
	{
		localStorage.setItem('preferences', JSON.stringify(prefs));
		return;
	}

	function updateMapView ()
	{
		prefs.zoom = map.getZoom();
		prefs.location = [map.getCenter().lat, map.getCenter().lng];
		$('#mapCoords').value = prefs.dms
			? ConvertDDToDMS(prefs.location[0], false)  + ' ' + ConvertDDToDMS(prefs.location[1], true)
			: (Math.round(prefs.location[0] * 10000) / 10000) + ' ' + (Math.round(prefs.location[1] * 10000) / 10000);
	}

	var prefs = fetchPreferences();
	window.onbeforeunload = storePreferences;

	var url = parseHashParams();

	/*
	function updateCurrentParams()
	{
		params.lat = Math.round(parseFloat(params.lat) * 100000) / 100000;
		params.lng = Math.round(parseFloat(params.lng) * 100000) / 100000;

		var hash = params.lat + ',' + params.lng + ',' + params.zoom + ',' + (params.marker ? 1 : 0);
		history.replaceState(undefined, undefined, "#" + hash);
	}
	*/

	function parseHashParams()
	{
		if (location.hash.length <= 1) return {};

		var hash = location.hash.substr(1);
		hash = hash.replace(/^geo:/, '');

		hash = hash.split('?');

		var match,
			qs 	   = {},
			pl     = /\+/g,  // Regex for replacing addition symbol with a space
			search = /([^&=]+)=?([^&]*)/g,
			decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); };

		while (match = search.exec(hash[1]))
		{
			qs[decode(match[1])] = decode(match[2]);
		}

		var coords = hash[0].split(',');

		var url = qs;
		url.location = coords;

		if (url.z)
			url.zoom = parseInt(url.z, 10);

		return url;
	}

	let wait_key = null;

	function addMarker(coordinates, label = null, center = false) {
		let marker = new L.Marker(coordinates, {
			draggable: true,
			title: 'Cliquer pour modifier'
		});

		marker.bindPopup(getDefaultMarkerPopup(marker));

		if (label !== null) {
			marker.setIcon(new L.divIcon({className: 'label', html: label, iconSize: null}));
		}

		marker.exportData = {'label': label};

		marker.addTo(userOverlay);

		if (center) {
			map.panTo(coordinates);
		}
	}

	document.getElementById('f_search').onkeyup = (e) => {
		// Autocomplete only works with france
		let b = new L.latLngBounds([[42.3526361615,-4.77666382372], [51.0911090428,8.22608219347]]);

		if (!b.contains(map.getBounds())) {
			return;
		}

		// Only intercept single keys
		if (e.key.length != 1) {
			return;
		}

		if (e.target.value == '') {
			autocompleteClear();
			return;
		}

		window.clearTimeout(wait_key);
		wait_key = window.setTimeout(autocompleteSearch, 300);
	};

	function autocompleteClear() {
		let e = document.getElementById('f_autocomplete');
		e.innerHTML = '';
		e.style.display = 'none';
	}

	async function autocompleteSearch() {
		let search = document.getElementById('f_search').value;
		let list = document.getElementById('f_autocomplete');

		// https://addok.readthedocs.io/en/latest/api/
		let response = await fetch('//demo.addok.xyz/search?q=' + search + '&lat=' + map.getCenter().lat + '&lon=' + map.getCenter().lng);
		autocompleteClear();
		list.style.display = 'block';

		if (!response.ok) {
			return;
		}

		response = await response.json();

		if (!response.features.length) {
			return;
		}

		for (var i = 0; i < response.features.length; i++) {
			let f = response.features[i];
			let e = document.createElement('a');
			e.innerHTML = `<b>${f.properties.label}</b>`;

			if (f.properties.context) {
				e.innerHTML += `<i>${f.properties.context}</i>`;
			}

			e.onclick = () => {
				addMarker(f.geometry.coordinates.reverse(), f.properties.label, true);
				autocompleteClear();
			};

			list.appendChild(e);
		}
	};

	async function exportTiles(format, zooms) {
		let layer;

		map.eachLayer((l2) => {
			if (l2.options && l2.options.tile_url) {
				layer = l2;
				return;
			}
		});

		let count = await countTiles(zooms);

		if (count > 10000) {
			alert(_('You can only download up to %d tiles, please select less zoom levels or change to a smaller region.').replace(/%d/, 10000));
			return;
		}

		document.body.className = 'loading';
		let progress = $('#tiles_progress');
		await L.exportTiles(format, layer, map.getBounds(), zooms, () => {
			progress.value = parseInt(progress.value)+1;
		});
		document.body.className = '';
		progress.value = 0;
	}

	function countTiles(levels) {
		return new Promise(async (resolve) => {
			let layer;

			map.eachLayer((l2) => {
				if (l2.options && l2.options.tile_url) {
					layer = l2;
					return;
				}
			});

			await loadScript('map.export_tiles.js');
			resolve(getTiles(layer, map.getBounds(), levels).length);
		});
	}

	document.querySelectorAll('.buttons button').forEach((b) => b.onclick = (e) => {
		let action = e.target.value;

		if (action == 'google') {
			let ll = map.getCenter();
			let url = 'http://maps.google.fr/?q=' + ll.lat + '%20' + ll.lng;
			window.open(url);
		}
		else if (action == 'osm') {
			let url = 'http://www.openstreetmap.org/?zoom=' + map.getZoom() + '&lat=' + ll.lat + '&lon=' + ll.lng;
			window.open(url);
		}
		/*
		else if (action == 'landez')
		{
			let l;

			map.eachLayer((l2) => {
				if (l2.options && l2.options.tile_url) {
					l = l2;
					return;
				}
			});

			let bbox = map.getBounds();
			let code = "# Install Landez from https://github.com/makinacorpus/landez and run this script:"
				+ "from landez import MBTilesBuilder\n"
				+ "mb = MBTilesBuilder(cache=False,tiles_url=\""+l.options.tile_url+"\")\n"
				+ "mb.add_coverage(bbox=("+bbox.toBBoxString()+"), zoomlevels=["+map.getZoom()+"])\n"
				+ "mb.run()";

			let c = document.createElement('textarea');
			c.readonly = true;
			c.value = code;
			openBottomPanel(c);
		}
		*/
		else if (action == 'export')
		{
			// Export current map to MBTiles
			let f = document.createElement('form');
			f.className = 'exportTiles';
			f.onsubmit = () => {
				let zooms = [];

				f.querySelectorAll('input[type=checkbox]:checked').forEach((e) => {
					zooms.push(e.value);
				});

				exportTiles(f.format.value.toLowerCase(), zooms);
				return false;
			};

			f.innerHTML += '<h3>' + _('Export format') + '</h3>';
			f.innerHTML += '<p><select name="format"><option>MBTiles</option><option>WebP</option><option>PNG</option><option>JPEG</option></select></p>';
			f.innerHTML += '<h3>' + _('Zoom levels to download') + ' (' + _('currently shown:') + ' <span id="tile_zoom"></span>)</h3>';

			let min = Math.max(map.getMinZoom(), 6);
			let max = Math.min(map.getMaxZoom(), 15);

			for (var z = min; z <= max; z++) {
				let checked = z == map.getZoom() ? 'checked' : '';
				let c = `<label class="btn"><input type="checkbox" name="zooms[]" value="${z}" ${checked} /> ${z}</label>`;
				f.innerHTML += c;
			}

			f.innerHTML += '<p>' + _('Number of tiles to download:') + ' <span id="tile_count"></span></p>';
			f.innerHTML += '<input class="btn" type="submit" value="' + _('Export (may take some time)') + '" />';
			f.innerHTML += `<progress value="0" id="tiles_progress" />`;

			function calculateTileCount() {
				let zooms = [];

				f.querySelectorAll('input[type=checkbox]:checked').forEach((e) => {
					zooms.push(e.value);
				});

				countTiles(zooms).then((count) => {
					$('#tile_count').innerText = count;
					$('#tiles_progress').max = count;
				});

				$('#tile_zoom').innerText = map.getZoom();
			}

			f.querySelectorAll('input[type=checkbox]').forEach((e) => e.onchange = calculateTileCount);
			openBottomPanel(f);
			calculateTileCount();

			L.DomEvent.on(map, 'zoomend', calculateTileCount);
			L.DomEvent.on(map, 'moveend', calculateTileCount);
		}
		else if (action == 'image')
		{
			// https://github.com/mapbox/leaflet-image
		}
		else if (action == 'refuges')
		{
			var bbox = map.getBounds();
			var l = 'https://www.refuges.info/api/bbox?bbox=' + bbox.toBBoxString() + '&format=gpx&format_texte=texte&nb_points=1500';
			window.open(l);
		}
		else if (action == 'tout sauf refuges')
		{
			var bbox = map.getBounds();
			var l = 'https://www.refuges.info/api/bbox?bbox=' + bbox.toBBoxString() + '&format=gpx&format_texte=texte&nb_points=1500&types_points=pt_eau,sommet,pt_passage,bivouac,lac';
			window.open(l);
		}
		else if (action == 'refuges seulement')
		{
			var bbox = map.getBounds();
			var l = 'https://www.refuges.info/api/bbox?bbox=' + bbox.toBBoxString() + '&format=gpx&format_texte=texte&nb_points=1500&type_points=cabane,refuge,gite';
			window.open(l);
		}

		return false;
	});

	document.getElementById('f_query').onsubmit = function (elm) {
		autocompleteClear();
		var query = document.getElementById('f_search').value;

		if (pos = query.match(/(-?\d+([\.,]\d+)?)[ ,;]+(-?\d+([\.,]\d+)?)/))
		{
			map.setView(new L.LatLng(parseFloat(pos[1]), parseFloat(pos[3])));
			return false;
		}

		var url = 'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(query)
			+ '&viewbox=' + map.getBounds().toBBoxString()
			+ '&format=json&json_callback=locate_callback_osm';

		js(url);

		return false;
	};

	window.locate_callback_osm = function (data) {
		if (data.length < 1)
		{
			alert('No result found for this query.');
			return;
		}

		var r = data[0];
		document.getElementById('f_search').value = r.display_name;
		map.fitBounds([[r.boundingbox[0], r.boundingbox[2]], [r.boundingbox[1], r.boundingbox[3]]]);

		if (layers[prefs.layer].options.bounds && !map.getBounds().overlaps(layers[prefs.layer].options.bounds)) {
			map.removeLayer(layers[prefs.layer]);
			prefs.layer = 'OTM';
			map.addLayer(layers[prefs.layer]);
			$('#mapSource').querySelector('option[value="' + prefs.layer + '"]').selected = true;
		}

		addMarker([r.lat, r.lon], r.display_name, true);
	};

	function toggleTrackEdit() {
		var layers = userOverlay.getLayers();

		if (layers.length == 0) return false;

		for (var i = 0; i < layers.length, layer = layers[i]; i++) {
			for (var i = 0; i < layer.tracks.length, track = layer.tracks[i]; i++) {
				// FIXME for large tracks (= large number of points) need to zoom in before edit!
				track.polyline.toggleEdit();
			}
		}

		// TODO: ability to create new polylines
	}

	var exportToGPX = function () {
		var layers = userOverlay.getLayers();

		if (layers.length == 0) {
			alert("Aucune donnée exportable sur la carte");
			return;
		}

		var gpx = L.GPX.prototype.fromLayers(layers);

		// Create blob
		var data = new Blob([gpx.toGPX()], {type: 'text/gpx+xml'});
		var url = window.URL.createObjectURL(data);

		// Create hidden link to blob URL
		var a = document.createElement('a');
		document.body.appendChild(a);
		a.download = 'map.gpx';
		a.href = url;
		a.click(); // Trigger download

		// Cleanup
		window.URL.revokeObjectURL(url);
		a.parentNode.removeChild(a);
	};


	var getProviderLayer = function (provider) {
		var p = providers[provider];
		var options = p;
		options.continuousWorld = false;
		options.reuseTiles = true;
		options.noWrap = false;
		options.attribution = '';
		options.errorTileUrl = './tile.png';

		if (p.legend_url)
			options.attribution += '[[Légende|' + p.legend_url + ']]';

		if (p.source)
			options.attribution += (options.attribution ? ' | ' : '') + p.source;

		if (p.copy)
			options.attribution += (options.attribution ? ' | ' : '') + '&copy; ' + p.copy;

		options.attribution = options.attribution.replace(/\[\[(.*?)\|(.*?)\]\]/g, '<a href="$2" onclick="return !window.open(this.href);">$1</a>');

		if (options.type && options.type == 'wms')
			var l = new L.tileLayer.wms(options.tile_url, options);
		else
			var l = new L.tileLayer(options.tile_url, options);

		l.on('load', function () { document.body.className = ''; });
		l.on('loading', function () { document.body.className = 'loading'; });
		return l;
	};

	var populateLayerList = function (layers) {
		for (var i in providers)
		{
			if (!providers.hasOwnProperty(i)) continue;
			layers[i] = getProviderLayer(i);
		}

		var select = document.getElementById('mapSource');

		select.onchange = function (e) {
			map.removeLayer(layers[prefs.layer]);
			prefs.layer = this.value;
			map.addLayer(layers[prefs.layer]);

			var o = layers[prefs.layer].options;
			var zoom = map.getZoom();

			if (o.maxZoom < zoom) {
				map.setZoom(o.maxZoom);
			}
			else if (o.minZoom > zoom) {
				map.setZoom(o.minZoom);
			}

			if (o.bounds) {
				let b = L.latLngBounds(o.bounds);
				if (!b.contains(map.getBounds())) {
					map.flyToBounds(b);
				}
			}
		};

		for (var cat in providers_categories)
		{
			if (!providers_categories.hasOwnProperty(cat))
				continue;

			var group = document.createElement('optgroup');
			group.label = _(cat);

			for (var i in providers_categories[cat])
			{
				if (!providers_categories[cat].hasOwnProperty(i))
					continue;

				var provider = providers_categories[cat][i];

				var o = document.createElement('option');
				o.value = provider;
				o.innerHTML = _(providers[provider].label);

				group.appendChild(o);
			}

			select.appendChild(group);
		}
	};

	var updateLayerList = function (e) {
		var bounds = map.getBounds();
		var select = document.getElementById('mapSource');
		var options = select.getElementsByTagName('option');

		/*
		for (var i = 0; i < options.length, option = options[i]; i++)
		{
			var l = layers[option.value];
			var o = l.options;

			if (!o.bounds || bounds.overlaps(o.bounds))
			{
				option.disabled = false;
			}
			else
			{
				option.disabled = true;
			}
		}
		*/
	};

	// Boutons sidebar
	L.Control.SideBar = L.Control.extend({
		options: {
			position: 'topleft',
			title: '',
		},
		onAdd: function () {
			var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control sidebar');
			var that = this;

			var addBtn = function (className, title, callback) {
				var btn = L.DomUtil.create('a', 'leaflet-bar-part ' + className, container);
				L.DomEvent.on(btn, 'click', function (e) {
					L.DomEvent.stopPropagation(e);
					L.DomEvent.preventDefault(e);
					callback(e);
				}, that);
				var span = document.createElement('span');
				span.innerHTML = title;
				btn.appendChild(span);
			};

			addBtn('hide', 'Afficher / cacher la barre latérale', function (e) {
				var sidebar = $('#sidebar');
				if (sidebar.className == 'hidden')
				{
					e.target.className = e.target.className.replace(/ show/, ' hide');
					sidebar.className = 'full';
					$('#mapContainer').className = $('#mapContainer').className.replace(/ full/, '');
				}
				else
				{
					e.target.className = e.target.className.replace(/ hide/, ' show');
					sidebar.className = 'hidden';
					$('#mapContainer').className += ' full';
				}
				window.setTimeout(function () { map.invalidateSize({pan: false}); }, 500);
			});


			if (window.File && window.FileReader)
			{
				addBtn('loadGPX', 'Charger un fichier GPX', function (e) {
					js('leaflet/gpx2.js', function () {
						$('#loadGPXFile').click();
					});
				});

				addBtn('save', 'Exporter en GPX', function () {
					js('leaflet/gpx2.js', exportToGPX);
				});

				addBtn('elevation', 'Profil altimétrique', function (e) {
					js('leaflet/elevation.js', showElevationProfile);
				});
			}

			//addBtn('edit', 'Éditer les chemins', toggleTrackEdit);

			addBtn('marker', 'Ajouter un marqueur', function (e) {
				addMarker(map.getCenter(), null);
			});

			addBtn('clear', 'Supprimer toutes les traces et marqueurs', function (e) {
				if (userOverlay.getLayers().length == 0) {
					window.alert('Aucun marqueur ou trace à effacer de la carte');
					return;
				}

				if (!window.confirm('Supprimer toutes les traces et marqueurs de la carte ?'))
					return false;

				map.removeLayer(userOverlay);
				userOverlay = L.layerGroup().addTo(map);
			});

			addBtn('export', 'Exporter la carte pour intégrer dans une page web', function (e) {
				js('leaflet/polyline.encoded.js', openExportPanel);
			});

			addBtn('measure', 'Mesurer', function (e) {
				e.target.style.display = 'none';
				css('leaflet/leaflet-measure.css');
				js('leaflet/leaflet-measure.min.js', function () {
					var measureControl = new L.Control.Measure({position: 'topright',
						primaryLengthUnit: 'kilometers', secondaryLengthUnit: 'sqmeters'});
					measureControl.addTo(map);
				});
			});

			return container;
		},
	});

	populateLayerList(layers);

	prefs.layer = url.provider || prefs.layer || default_layer;

	if (!layers[prefs.layer])
	{
		prefs.layer = default_layer;
	}

	prefs.zoom = url.zoom || prefs.zoom || 10;
	prefs.location = url.location || prefs.location;

	// Création de la carte

	var map = L.map($('#map'), {
		zoom: prefs.zoom,
		attributionControl: true,
		center: prefs.location,
		layers: [layers[prefs.layer]],
		maxBounds: [[-90, -190], [90, 190]],
		editable: true
	});

	map.on('editable:vertex:ctrlclick editable:vertex:metakeyclick', function (e) {
		e.vertex.continue();
	});

	if (url.marker)
	{
		var marker = new L.Marker(url.location, {
			title: url.marker || '',
		});

		if (url.content)
		{
			marker.bindPopup('<h2>' + (url.marker || '') + '</h2>' + url.content);
		}

		marker.addTo(map);

		if (url.icon)
		{
			var icon = new Image;
			icon.onload = function (e) {
				marker.setIcon(L.icon({
					iconUrl: e.target.src,
					iconSize: [e.target.width, e.target.height]
				}));
			};
			icon.src = url.icon;
		}
	}

	L.control.scale({imperial: false, metric: true}).addTo(map);
	map.addControl(new L.Control.SideBar());

	// Remove Leaflet Prefix
	map.attributionControl.setPrefix(false);

	map.on('viewreset', updateLayerList);

	map.on('viewreset', updateMapView);
	map.on('moveend', updateMapView);

	// Update the available layers for the current area
	updateLayerList();
	updateMapView();

	var userOverlay = L.layerGroup().addTo(map);

	// Select the default layer
	$('#mapSource').querySelector('option[value="' + prefs.layer + '"]').selected = true;
	$('#mapSwitchDMS').onclick = function () {
		prefs.dms = !prefs.dms;
		updateMapView();
	};
	$('#mapCoords').onclick = function () {
		this.select();
	};

	$('#closeBottomPanel').onclick = function (e) {
		e.preventDefault();
		$('#mapContainer').className = $('#mapContainer').className.replace(/ bottomEnabled/, '');
		$('#bottomContent').innerHTML = '';
		return false;
	};

	$('#loadGPXFile').onchange = function (e) {
		if (e.target.files.length < 1)
			return false;

		var file = e.target.files[0];

		if (!file.name.match(/\.gpx$/i))
		{
			return !alert('Ce fichier n\'est pas un tracé GPX.');
		}

		document.body.className = 'loading';

		var reader = new FileReader;

		reader.onload = function (e) {
			var icon = L.Icon.extend({options: {
				shadowUrl: 'leaflet/pin-shadow.png',
				iconSize: [33, 50],
				shadowSize: [50, 50],
				iconAnchor: [16, 45],
				shadowAnchor: [16, 47],
				clickable: false
			}});

			var startIcon = new icon({
				iconUrl: 'leaflet/pin-start.png'
			});

			var endIcon = new icon({
				iconUrl: 'leaflet/pin-end.png',
			});

			userOverlay.addLayer(new L.GPX(e.target.result, {
				icon: {
					start: startIcon,
					end: endIcon
				}
			}).on('loaded', function(e) {
				document.body.className = '';
				map.fitBounds(e.target.getBounds(), {maxZoom: 14});
				map.invalidateSize(false);
			}));

		};

		reader.readAsText(file);
	};

	var showElevationProfile = function() {
		var layers = userOverlay.getLayers();

		for (var i = 0; i < layers.length, layer = layers[i]; i++)
		{
			if (!(layer instanceof L.GPX)) continue;

			// TODO: track selection

			for (var i = 0; i < layer.tracks.length, track = layer.tracks[i]; i++)
			{
				if (track.elevation.gain == 0 && track.elevation.loss == 0) continue;

				let html = document.createElement('figure');
				html.className = 'elevation';
				html.innerHTML = '<figcaption>Dénivelé positif cumulé&nbsp;: ' + track.elevation.gain +
					' m — Dénivelé négatif cumulé&nbsp;: ' + track.elevation.loss + ' m</figcaption>';
				html.appendChild(new GPXElevationProfile(track, $('#mapContainer').offsetWidth, 150, track.color));
				openBottomPanel(html);

				// FIXME: Ne marche pas trop
				//showHotline(layer, track);
				return false;
			}
		}

		alert('Aucun tracé ne comporte d\'informations altimétriques.');
	};

	function showHotline(layer, track) {
		var points = [];

		layer.remove();

		var min, max, previous, distance = 0, elevation = 0, slope = 0;

		track.segments.forEach(function (segment) {
			segment.points.forEach(function (point) {
				if (previous) {
					// Split by X metres segments
					if (distance >= 100) {
						slope = elevation / distance;
						elevation = distance = 0;

						if (min) {
							min = Math.min(min, slope);
							max = Math.max(max, slope);
						}
						else {
							min = slope;
							max = slope;
						}
					}
					else {
						elevation += point.ele - previous.ele;
						distance += point.distance - previous.distance;
					}
				}

				points.push([point.lat, point.lon, slope]);
				previous = point;
			});
		});

		// Scale down to 0-100
		for (var i = 0; i < points.length; i++) {
			var s = points[i][2];
			points[i][2] = 100 * (s - min) / (max - min);
		}

		new L.Hotline(points, {
			min: 0,
			max: 100,
			palette: {
				0: '#008800',
				0.5: '#ffff00',
				1: '#ff0000'
			},
			weight: 5,
			outlineColor: '#000000',
			outlineWidth: 1
		}).addTo(userOverlay);
	}

	function openBottomPanel(content) {
		$('#mapContainer').className = $('#mapContainer').className.replace(/ bottomEnabled|$/, ' bottomEnabled');
		let c = $('#bottomContent');
		c.innerHTML = '';
		c.appendChild(content);
	};

	function openExportPanel()
	{
		var w = 600, h = 400;

		var url = location.protocol + '//' + location.hostname + location.pathname + 'embed/?';

		url += 'bb=' + map.getBounds().toBBoxString();
		url += '&p=' + prefs.layer;

		if (userOverlay.getLayers().length > 0 && JSON)
		{
			var EOL = "\n";
			var data = {tracks: [], points: []};

			var layers = userOverlay.getLayers();

			for (var i = 0; i < layers.length, layer = layers[i]; i++)
			{
				if (layer instanceof L.GPX)
				{
					var track = layer.getMergedTrack();
					var coords = [];

					for (var j = 0; j < track.points.length, p = track.points[j]; j++)
					{
						coords.push(new L.LatLng(p.lat, p.lon));
					}

					data.tracks.push({
						data: L.PolylineUtil.encode(coords),
						options: {
							color: '#f00'
						}
					});
				}
				else if (layer instanceof L.Marker && layer.exportData)
				{
					var point = layer.exportData;
					point.lat = layer.getLatLng().lat;
					point.lon = layer.getLatLng().lng;
					data.points.push(point);
				}
			}

			// FIXME : si un seul marqueur, exporter en iframe et pas en script
			var html = '<script type="text/javascript">' + EOL;
			html += '(function () {' + EOL;
			html += 'var width = '+w+', height = '+h+';' + EOL;
			html += 'var map_content = ' + JSON.stringify(data) + ';' + EOL;
			html += 'var iframe = document.createElement("iframe");' + EOL;
			html += 'iframe.width = width, iframe.height = height;' + EOL;
			html += 'iframe.frameBorder = 0, iframe.scrolling = "no";' + EOL;
			html += 'iframe.src = "'+url+'";' + EOL;
			html += 'iframe.onload = function(e) { e.target.contentWindow.postMessage(map_content, "*"); };' + EOL;
			html += 'var where = document.getElementsByTagName("script");' + EOL;
			html += 'where = where[where.length - 1];' + EOL;
			html += 'where.parentNode.insertBefore(iframe, where);' + EOL;
			html += '} ());' + EOL;
			html += '</script>';
		}
		else
		{
			url = url.replace(/&/, '&amp;');
			var html = '<object type="text/html" width="' + w + '" height="' + h + '" data="' + url + '">';
			html += '<iframe src="' + url + '" width="' + w + '" height="' + h + '" frameborder="0" scrolling="no"></iframe></object>';
		}

		let c = document.createElement('textarea');
		c.readonly = true;
		c.onclick = () => { c.select(); };
		c.value = html;

		openBottomPanel(c);
	}

	function getDefaultMarkerPopup(marker) {
		var form = document.createElement('form');
		form.className = 'markerForm';

		var useIcon = document.createElement('label');
		var checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.checked = true;
		useIcon.appendChild(checkbox);
		useIcon.appendChild(document.createTextNode(' Avec icône'));

		useIcon.onclick = function () {
			icon.style.display = checkbox.checked ? 'inline' : 'none';
			label.style.display = !checkbox.checked ? 'inline' : 'none';
		};

		form.appendChild(useIcon);

		var icon = document.createElement('input');
		icon.type = 'url';
		icon.placeholder = 'URL de l\'icône (facultatif)';
		icon.name = 'icon';

		form.appendChild(icon);

		var label = document.createElement('input');
		label.type = 'text';
		label.placeholder = 'Libellé';
		label.style.display = 'none';

		form.appendChild(label);

		var content = document.createElement('textarea');
		content.placeholder = 'Contenu de la popup (si vide, aucune popup ne sera associée au marqueur)';

		form.appendChild(content);

		var submit = document.createElement('input');
		submit.type = 'submit';
		submit.value = 'OK';

		var remove = document.createElement('input');
		remove.type = 'reset';
		remove.value = 'Supprimer';

		form.appendChild(submit);
		form.appendChild(remove);

		remove.onclick = function () {
			userOverlay.removeLayer(marker);
			return false;
		};

		form.onsubmit = function () {
			if (!checkbox.checked)
			{
				marker.setIcon(new L.divIcon({className: 'label', html: label.value, iconSize: null}));
				marker.exportData = {label: label.value, content: content.value};
			}
			else
			{
				marker.exportData = {iconUrl: icon.value, content: content.value};
				if (!icon.value)
				{
					marker.setIcon(new L.Icon.Default());
					return false;
				}

				var img = new Image;
				img.onload = function () {
					marker.exportData.iconSize = [this.width, this.height];
					marker.exportData.iconAnchor = [this.width/2, this.height];
					marker.exportData.popupAnchor = [0, -this.height];
					marker.setIcon(new L.Icon(marker.exportData));
				};
				img.src = icon.value;
			}

			marker.closePopup();

			return false;
		};

		return form;
	}
}());