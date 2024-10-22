L.exportTiles = async function (format, layer, bounds, levels, progress_callback) {
	if (format === 'mbtiles') {
		await L.exportMBTiles(layer, bounds, levels, progress_callback);
		return;
	}

	levels.forEach(async z => {
		// Create canvas
		let tiles = getTiles(layer, bounds, [z]);
		var w = 0, h = 0, max_col = 0, min_row, min_col, max_row = 0;
		var canvas, ctx;

		try {
			for (const tile of tiles) {
				min_col = Math.min(tile.x, min_col ?? tile.x);
				max_col = Math.max(tile.x, max_col);
				min_row = Math.min(tile.y, min_row ?? tile.y);
				max_row = Math.max(tile.y, max_row);
			}

			for (const tile of tiles) {
				let img;

				try {
					img = await loadImage(tile.url);
				}
				catch (e) {
					continue;
				}

				let w = img.width, h = img.height;

				if (!canvas) {
					canvas = document.createElement('canvas');
					canvas.width = w * (max_col - min_col + 1);
					canvas.height = h * (max_row - min_row + 1);
					ctx = canvas.getContext('2d');
				}

				ctx.drawImage(img, w * (tile.x - min_col), h * (tile.y - min_row));

				delete img;
			}
		}
		finally {
			delete tiles, ctx;
		}

		const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/' + format, 0.9));
		let url = window.URL.createObjectURL(blob);

		let a = document.createElement('a');
		document.body.appendChild(a);
		a.href = url;
		a.download = 'map_z' + z + '.' + format;
		a.click();

		delete canvas, a, blob;

		setTimeout(() => window.URL.revokeObjectURL(url), 1000);
	});

	return;

	async function loadImage(url) {
		const img = document.createElement('img');
		img.crossOrigin = 'anonymous';
		return new Promise((resolve, reject) => {
			img.onload = () => {
				resolve(img);
			};
			img.onerror = () => {
				reject('Unable to load image');
			};
			img.src = url;
		});
	}
};

L.exportMBTiles = async function (layer, bounds, levels, progress_callback) {
	await loadScript('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.4.0/dist/sql-wasm.min.js');
	await loadScript('map.export_tiles.js');
	SQL = await initSqlJs({
		// Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
		// You can omit locateFile completely when running in node
		locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.4.0/dist/${file}`
	});

	let db = new SQL.Database();
	db.run('CREATE TABLE tiles (zoom_level integer, tile_column integer, tile_row integer, tile_data blob); '
		+ 'CREATE INDEX tiles_idx on tiles (zoom_level, tile_column, tile_row); '
		+ 'CREATE TABLE metadata (name text, value text); '
		+ 'CREATE UNIQUE INDEX metadata_idx  ON metadata (name);');

	db.run('INSERT INTO metadata VALUES (?, ?);', ['bounds', [bounds.getEast(), bounds.getSouth(), bounds.getWest(), bounds.getNorth()].join(',')]);
	db.run('INSERT INTO metadata VALUES (?, ?);', ['type', 'baselayer']);
	db.run('INSERT INTO metadata VALUES (?, ?);', ['version', '1.1']);
	db.run('INSERT INTO metadata VALUES (?, ?);', ['description', layer.options.label]);
	db.run('INSERT INTO metadata VALUES (?, ?);', ['format', layer.options.tile_url.match(/jpe?g/) ? 'jpeg' : 'png']);
	db.run('INSERT INTO metadata VALUES (?, ?);', ['maxzoom', Math.max(levels)]);
	db.run('INSERT INTO metadata VALUES (?, ?);', ['minzoom', Math.min(levels)]);

	db.run('BEGIN;');
	let stmt = db.prepare('INSERT INTO tiles VALUES (:zoom, :col, :row, :data);');
	let tiles = getTiles(layer, bounds, levels);

	try {
		await insertTiles(tiles, stmt, progress_callback);
	}
	catch (e) {
		if (e.message == 'Failed to fetch') {
			alert('Une erreur est survenue, cette carte n\'autorise peut-être pas le téléchargement ?');
		}
		else {
			//alert('Erreur : ' + e.message);
			throw e;
		}

		return false;
	}
	finally {
		delete db, tiles, stmt;
	}

	db.run('COMMIT;');

	let blob = new Blob([db.export()], {
		type: 'application/x-sqlite3'
	});

	let url = window.URL.createObjectURL(blob);

	let a = document.createElement('a');
	document.body.appendChild(a);
	a.href = url;
	a.download = 'map.mbtiles';
	a.click();

	setTimeout(() => window.URL.revokeObjectURL(url), 1000);

	return;

	async function insertTiles(tiles, stmt, progress_callback) {
		for (const tile of tiles) {
			try {
				var r = await fetch(tile.url);
				if (!r.ok) {
					throw Error(r.statusText);
				}
			}
			catch (e) {
				console.log('Fail: ' + e.message);
				continue;
			}

			r = await r.arrayBuffer();
			let flipped_y = Math.pow(2, tile.z) - 1 - tile.y;

			stmt.run({':zoom': tile.z, ':col': tile.x, ':row': flipped_y, ':data': new Uint8Array(r)});
			progress_callback();
		}
	}

	function loadScript(url) {
		const scripts = [];

		return new Promise((resolve) => {
			if (url in scripts) {
				resolve(scripts[url]);
				return;
			}

			let script = scripts[url] = document.createElement('script');
			script.type = 'text/javascript';
			script.async = true;
			script.src = url;
			script.onload = () => resolve(script);
			document.head.appendChild(script);
		});
	}
};

// From https://github.com/veltman/xyz-affair/blob/master/index.js
function getTiles(layer, bounds, zooms) {
	var R = 6378137,
		sphericalScale = 0.5 / (Math.PI * R);

	var tiles = [];

	zooms.forEach((z) => tiles = tiles.concat(xyz(bounds,z)) );

	return tiles;

	/* Adapted from: https://gist.github.com/mourner/8825883 */
	function xyz(bounds, zoom) {
		var zoom = parseInt(zoom, 10),
			min = project(bounds.getNorth(), bounds.getWest(), zoom),
			//south,east
			max = project(bounds.getSouth(), bounds.getEast(), zoom),
			tiles = [];

		for (var x = min.x; x <= max.x; x++) {
			for (var y = min.y; y <= max.y; y++) {
				var coords = new L.Point(x, y);

				tiles.push({
					x: x,
					y: y,
					z: zoom,
					url: getTileUrl(coords, zoom, layer)
				});
			}
		}

		return tiles;
	}

	// @function template(str: String, data: Object): String
	// Simple templating facility, accepts a template string of the form `'Hello {a}, {b}'`
	// and a data object like `{a: 'foo', b: 'bar'}`, returns evaluated string
	// `('Hello foo, bar')`. You can also specify functions instead of strings for
	// data values — they will be evaluated passing `data` as an argument.
	function template(str, data) {
		const templateRe = /\{ *([\w_-]+) *\}/g;

		return str.replace(templateRe, function (str, key) {
			var value = data[key];

			if (value === undefined) {
				throw Error('No value provided for variable ' + str);

			} else if (typeof value === 'function') {
				value = value(data);
			}
			return value;
		});
	}

	// We must fork this function as the zoom level is issued from the map in leaflet
	function getTileUrl(coords, zoom, layer) {
		var retina = (window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI)) > 1;

		var data = {
			r: retina ? '@2x' : '',
			s: layer._getSubdomain(coords),
			x: coords.x,
			y: coords.y,
			z: zoom
		};
		if (layer._map && !layer._map.options.crs.infinite) {
			var invertedY = layer._globalTileRange.max.y - coords.y;
			if (layer.options.tms) {
				data['y'] = invertedY;
			}
			data['-y'] = invertedY;
		}

		return template(layer._url, L.extend(data, layer.options));
	}

	/*
	 Adapts a group of functions from Leaflet.js to work headlessly
	 https://github.com/Leaflet/Leaflet

	 Combines/modifies the following methods:
	 L.Transformation._transform (src/geometry/Transformation.js)
	 L.CRS.scale (src/geo/crs/CRS.js)
	 L.CRS.latLngToPoint (src/geo/crs/CRS.js)
	 L.Projection.SphericalMercator.project (src/geo/projection/Projection.SphericalMercator.js)
	*/
	function project(lat,lng,zoom) {
		var d = Math.PI / 180,
				max = 1 - 1E-15,
				sin = Math.max(Math.min(Math.sin(lat * d), max), -max),
				scale = 256 * Math.pow(2, zoom);

		var point = {
			x: R * lng * d,
			y: R * Math.log((1 + sin) / (1 - sin)) / 2
		};

		point.x = tiled(scale * (sphericalScale * point.x + 0.5));
		point.y = tiled(scale * (-sphericalScale * point.y + 0.5));

		return point;
	}

	function tiled(num) {
		return Math.floor(num/256);
	}

}
