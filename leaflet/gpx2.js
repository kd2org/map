L.GPX = L.FeatureGroup.extend({
	initialize: function(gpx, options) {
		options = options || {};

		this.default_icon = new L.Icon({
			iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAMFBMVEUAAADIPC3mSzvSQy/zQjrcRjfmSzrTQjPmTDv/AADOPzG+OSvAOSviSTnYRTbnTDwSCntMAAAADHRSTlMA9ZYaFcvyZUkB/v42czlwAAAAcUlEQVQI12NgYJgRn9rJAAQs+v//f3IAMpj+rzn1XwHIcPu4vXBZCpDRf9uAed8PEOM1lNF2u4B9L4gx9c/W6PUBQAbH/9W7/jeADIr///8riGbw//8/Bcxg+g82D2hH/jcHMIOh/juEZnBNgTI4QJoB1EIqiRGJ2WsAAAAASUVORK5CYII=',
			iconSize: [16, 16]
		});

		options.icon = options.icon || {};
		options.icon.waypoint = options.icon.waypoint || this.default_icon;
		options.icon.start = options.icon.start || this.default_icon;
		options.icon.end = options.icon.end || this.default_icon;

		options.async = true;

		L.Util.setOptions(this, options);

		this._layers = {};
		this._gpx = gpx;
		this.tracks = [];
		this.routes = [];
		this.waypoints = [];

		if (gpx) {
			this.loadAndDisplay(gpx);
		}
	},

	load: function(input, callback) {
		if (input.substr(0,1) === '<')
		{
			// direct XML has to start with a <
			var parser = new DOMParser();
			var _this = this;

			var cb = function (gpx) {
				return _this.loadXML(gpx, callback);
			};

			setTimeout(function() {
				cb(parser.parseFromString(input, "text/xml"));
			});
		}
		else if (input.match(/^(https?:|\/)/))
		{
			return this.loadURL(input, callback);
		}
		else
		{
			return false;
		}
	},

	loadAndDisplay: function(input, callback) {
		this.load(input, function (obj) {
			var layers = [];

			for (var i = 0; i < obj.tracks.length, track = obj.tracks[i]; i++)
			{
				var coords = [];

				for (var j = 0; j < track.segments.length, segment = track.segments[j]; j++)
				{
					for (var k = 0; k < segment.points.length, point = segment.points[k]; k++)
					{
						coords.push(new L.LatLng(point.lat, point.lon, point.ele));
					}
				}

				// Start marker
				var p  = new L.Marker(coords[0], {clickable: false, icon: obj.options.icon.start});
				obj.fire('addpoint', { point: p });
				layers.push(p);
				track.startMarker = p;

				// Polyline
				track.color = 'hsl(' + Math.floor(Math.random()*360) + ',100%,40%)';
				var l = new L.Polyline(coords, {color: track.color, clickable: false, opacity: 0.75});
				obj.fire('addline', { line: l });
				layers.push(l);
				track.polyline = l;

				// End marker
				var p = new L.Marker(coords[coords.length - 1], {clickable: false, icon: obj.options.icon.end});
				obj.fire('addpoint', { point: p });
				layers.push(p);
				track.endMarker = p;
			}

			for (var i = 0; i < obj.routes.length, route = obj.routes[i]; i++)
			{
				var coords = [];

				for (var k = 0; k < route.points.length, point = route.points[k]; k++)
				{
					coords.push(new L.LatLng(point.lat, point.lon, point.ele));
				}

				// Start markerLatLng
				var p  = new L.Marker(coords[0], {clickable: false, icon: obj.options.icon.start});
				obj.fire('addpoint', { point: p });
				layers.push(p);

				// Polyline
				route.color = 'hsl(' + Math.floor(Math.random()*360) + ',100%,40%)';
				var l = new L.Polyline(coords, {color: route.color, clickable: false, dashArray: '10, 10', opacity: 0.7});
				obj.fire('addline', { line: l });
				layers.push(l);

				// End marker
				var p = new L.Marker(coords[coords.length - 1], {clickable: false, icon: obj.options.icon.end});
				obj.fire('addpoint', { point: p });
				layers.push(p);
			}

			for (var i = 0; i < obj.waypoints.length, point = obj.waypoints[i]; i++)
			{
				var opt = {icon: obj.options.icon.waypoint};

				if (point.name)
					opt.title = point.name;
				else
					opt.opacity = 0.5;

				var p = new L.Marker(new L.LatLng(point.lat, point.lon, point.ele), opt);

				var desc = point.desc;

				if (desc.indexOf('<') == -1) {
					desc = desc.replace(/(\r\n|\n)/g, '<br />');
				}

				desc = (point.name ? '<h3>' + point.name + '</h3>' : '')
					+ (desc && desc != point.name ? '<p>' + desc + '</p>' : '');

				desc = desc + "<input type='text' onclick='this.select();' value='" + point.lat + ' ' + point.lon + "' />";

				p.bindPopup(desc);

				obj.fire('addpoint', { point: p });
				layers.push(p);
			}

			if (layers.length > 0)
			{
				obj.addLayer(new L.FeatureGroup(layers));
			}

			obj.fire('loaded');

			if (callback)
				callback(obj);
		});
	},

	loadURL: function(url, callback) {
		var req = new window.XMLHttpRequest();

		req.open('GET', url, this.options.async);

		try {
			req.overrideMimeType('text/xml'); // unsupported by IE
		} catch(e) {}

		var _this = this;
		var cb = function (gpx) {
			return _this.loadXML(gpx, callback);
		};

		req.onreadystatechange = function() {
			if (req.readyState != 4) return;
			if(req.status == 200) cb(req.responseXML);
		};

		return req.send(null);
	},

	loadXML: function(xml, callback) {
		if (typeof xml != 'object')
		{
			throw new Error('input is not a valid XML object');
		}

		this._parseTracks(xml);
		this._parseRoutes(xml);
		this._parseWaypoints(xml);

		if (callback)
			callback(this);
	},

	_parseWaypoints: function (xml) {
		var waypoints = xml.getElementsByTagName('wpt');

		for (var i = 0; i < waypoints.length, point = waypoints[i]; i++)
		{
			var p = {
				lat: parseFloat(point.getAttribute('lat')),
				lon: parseFloat(point.getAttribute('lon')),
				ele: null
			};

			if ((t = point.getElementsByTagName('time')) && t.length > 0)
				p.time = new Date(Date.parse(t[0].textContent));

			if ((t = point.getElementsByTagName('ele')) && t.length > 0)
				p.ele = parseFloat(t[0].textContent);

			if ((t = point.getElementsByTagName('name')) && t.length > 0)
				p.name = t[0].textContent;

			if ((t = point.getElementsByTagName('cmt')) && t.length > 0)
				p.cmt = t[0].textContent;

			if ((t = point.getElementsByTagName('desc')) && t.length > 0)
				p.desc = t[0].textContent;

			if ((t = point.getElementsByTagName('link')) && t.length > 0)
				p.link = t[0].textContent;

			if ((t = point.getElementsByTagName('sym')) && t.length > 0)
				p.sym = t[0].textContent;

			this.waypoints.push(p);
		}
	},

	_parseRoutes: function(xml) {
		var route = null;
		var routes = xml.getElementsByTagName('rte');

		for (var i = 0; i < routes.length, route = routes[i]; i++)
		{
			var myRoute = {
				distance: 0.0,
				elevation: {gain: 0.0, loss: 0.0},
				duration: 0.0
			};

			if ((t = route.getElementsByTagName('name')) && t.length > 0)
				myRoute.name = t[0].textContent;

			if ((t = route.getElementsByTagName('cmt')) && t.length > 0)
				myRoute.cmt = t[0].textContent;

			if ((t = route.getElementsByTagName('desc')) && t.length > 0)
				myRoute.desc = t[0].textContent;

			if ((t = route.getElementsByTagName('link')) && t.length > 0)
				myRoute.link = t[0].textContent;

			myRoute.points = this._parsePoints(route, myRoute, null, 'rtept');
			this.routes.push(myRoute);
		}
	},

	_parseTracks: function(xml) {
		var track = null;
		var tracks = xml.getElementsByTagName('trk');

		for (var i = 0; i < tracks.length, track = tracks[i]; i++)
		{
			var myTrack = {
				distance: 0.0,
				elevation: {gain: 0.0, loss: 0.0},
				duration: 0.0
			};

			if ((t = track.getElementsByTagName('name')) && t.length > 0)
				myTrack.name = t[0].textContent;

			if ((t = track.getElementsByTagName('cmt')) && t.length > 0)
				myTrack.cmt = t[0].textContent;

			if ((t = track.getElementsByTagName('desc')) && t.length > 0)
				myTrack.desc = t[0].textContent;

			if ((t = track.getElementsByTagName('link')) && t.length > 0)
				myTrack.link = t[0].textContent;

			myTrack.segments = this._parseTrackSegments(track, myTrack);

			this.tracks.push(myTrack);
		}
	},

	_parseTrackSegments: function (xml, track) {
		var mySegments = [];
		var segment = null;
		var segments = xml.getElementsByTagName('trkseg');

		for (var i = 0; i < segments.length, segment = segments[i]; i++)
		{
			var s = {
				distance: 0.0,
				elevation: {gain: 0.0, loss: 0.0},
				duration: 0.0
			};

			s.points = this._parsePoints(segment, s, track, 'trkpt');

			track.duration += s.duration;
			track.elevation.gain += s.elevation.gain;
			track.elevation.loss += s.elevation.loss;

			mySegments.push(s);
		}

		return mySegments;
	},

	_parsePoints: function (xml, segment, track, tagName) {
		var myPoints = [],
			point = null,
			points = xml.getElementsByTagName(tagName);

		for (var i = 0; i < points.length, point = points[i]; i++)
		{
			var p = {
				lat: parseFloat(point.getAttribute('lat')),
				lon: parseFloat(point.getAttribute('lon')),
				ele: null
			};

			if ((t = point.getElementsByTagName('time')) && t.length > 0)
			{
				p.time = new Date(Date.parse(t[0].textContent));

				if (i > 0 && myPoints[i-1].time)
				{
					segment.duration += +(p.time) - +(myPoints[i-1].time);
				}
			}

			if ((t = point.getElementsByTagName('ele')) && t.length > 0)
			{
				p.ele = parseFloat(t[0].textContent);

				if (i > 0 && myPoints[i-1].ele)
				{
					var e = Math.floor(p.ele - myPoints[i-1].ele);

					if (e > 0)
						segment.elevation.gain += e;
					else
						segment.elevation.loss += Math.abs(e);
				}
			}

			if ((t = point.getElementsByTagName('name')) && t.length > 0)
				p.name = t[0].textContent;

			if ((t = point.getElementsByTagName('cmt')) && t.length > 0)
				p.cmt = t[0].textContent;

			if ((t = point.getElementsByTagName('desc')) && t.length > 0)
				p.desc = t[0].textContent;

			if ((t = point.getElementsByTagName('link')) && t.length > 0)
				p.link = t[0].textContent;

			if ((t = point.getElementsByTagName('sym')) && t.length > 0)
				p.sym = t[0].textContent;


			if (i > 0)
			{
				var distance = this._dist2d(myPoints[i-1], p);
				segment.distance += distance;

				if (track)
				{
					track.distance += distance;
					p.distance = track.distance;
				}
				else
				{
					p.distance = segment.distance;
				}
			}
			else
			{
				p.distance = 0;
			}

			myPoints.push(p);
		}

		return myPoints;
	},

	_dist2d: function(a, b) {
		var R = 6371000;
		var dLat = this._deg2rad(b.lat - a.lat);
		var dLon = this._deg2rad(b.lon - a.lon);
		var r = Math.sin(dLat/2) *
			Math.sin(dLat/2) +
			Math.cos(this._deg2rad(a.lat)) *
			Math.cos(this._deg2rad(b.lat)) *
			Math.sin(dLon/2) *
			Math.sin(dLon/2);
		var c = 2 * Math.atan2(Math.sqrt(r), Math.sqrt(1-r));
		var d = R * c;
		return d;
	},

	_dist3d: function(a, b) {
		var planar = this._dist2d(a, b);

		if (!a.ele || !b.ele)
			return planar;

		var height = Math.abs(b.ele - a.ele);
		return Math.sqrt(Math.pow(planar, 2) + Math.pow(height, 2));
	},

	_deg2rad: function(deg) {
		return deg * Math.PI / 180;
	},

	m_to_km: function(v) {
		return v / 1000;
	},

	fromLayers(layers) {
		var obj = new L.GPX();

		for (var i = 0; i < layers.length, layer = layers[i]; i++) {
			if (layer instanceof L.GPX) {
				obj.routes = obj.routes.concat(layer.routes);
				obj.tracks = obj.tracks.concat(layer.tracks);
				obj.waypoints = obj.waypoints.concat(layer.waypoints);
			}
			else if (layer instanceof L.Marker) {
				var wpt = {
					name: layer.exportData.label,
					desc: layer.exportData.content,
					lat: layer.getLatLng().lat,
					lon: layer.getLatLng().lng,
					ele: layer.getLatLng().alt
				};

				obj.waypoints.push(wpt);
			}
			else if (layer instanceof L.PolyLine) {
				console.log('FIXME');
			}
		}
		return obj;
	},

	toGPX: function(data) {
		var gpx = document.implementation.createDocument("http://www.topografix.com/GPX/1/1", "gpx");

		var waypoints = data && data.waypoints || this.waypoints;
		var routes = data && data.routes || this.routes;
		var tracks = data && data.tracks || this.tracks;

		for (var i = 0; i < waypoints.length, waypoint = waypoints[i]; i++) {
			var wpt = gpx.createElement('wpt');
			wpt.setAttribute('lat', waypoint.lat);
			wpt.setAttribute('lon', waypoint.lon);

			if (waypoint.ele) {
				var ele = gpx.createElement('ele');
				ele.innerHTML = waypoint.ele;
				wpt.appendChild(ele);
			}

			if (waypoint.name) {
				var name = gpx.createElement('name');
				name.appendChild(gpx.createCDATASection(waypoint.name));
				wpt.appendChild(name);
			}

			if (waypoint.desc) {
				var desc = gpx.createElement('desc');
				desc.appendChild(gpx.createCDATASection(waypoint.desc));
				wpt.appendChild(desc);
			}

			gpx.documentElement.appendChild(wpt);
		}

		for (var i = 0; i < routes.length, route = routes[i]; i++) {
			if (route.points.length == 0) continue;

			var rte = gpx.createElement('rte');

			for (var j = 0; j < route.points.length, point = route.points[j]; j++) {
				var rtept = gpx.createElement('rtept');
				rtept.setAttribute('lat', point.lat);
				rtept.setAttribute('lon', point.lon);

				if (point.ele) {
					var ele = gpx.createElement('ele');
					ele.innerHTML = point.ele;
					rtept.appendChild(ele);
				}

				rte.appendChild(rtept);
			}

			gpx.documentElement.appendChild(rte);
		}

		for (var i = 0; i < tracks.length, track = tracks[i]; i++) {
			if (track.segments.length == 0) continue;

			var trk = gpx.createElement('trk');

			for (var k = 0; k < track.segments.length, segment = track.segments[i]; i++) {
				if (segment.points.length == 0) continue;

				var trkseg = gpx.createElement('trkseg');

				for (var j = 0; j < segment.points.length, point = segment.points[j]; j++) {
					var trkpt = gpx.createElement('trkpt');
					trkpt.setAttribute('lat', point.lat);
					trkpt.setAttribute('lon', point.lon);

					if (point.ele) {
						var ele = gpx.createElement('ele');
						ele.innerHTML = point.ele;
						trkpt.appendChild(ele);
					}

					trkseg.appendChild(trkpt);
				}

				trk.appendChild(trkseg);
			}

			gpx.documentElement.appendChild(trk);
		}

		return '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>' + (new XMLSerializer().serializeToString(gpx.documentElement));
	},

	/**
	 * Returns a track containing all the waypoints of all the tracks (not routes or waypoints)
	 * @return {object}
	 */
	getMergedTrack: function () {
		var myTrack = {
			distance: 0.0,
			elevation: {gain: 0.0, loss: 0.0},
			duration: 0.0,
			points: []
		};

		for (var h = 0; h < this.tracks.length, track = this.tracks[h]; h++)
		{
			for (var i = 0; i < track.segments.length, segment = track.segments[i]; i++)
			{
				for (var j = 0; j < segment.points.length, point = segment.points[j]; j++)
				{
					myTrack.points.push(point);
				}
			}

			myTrack.distance += track.distance;
			myTrack.duration += track.duration;
			myTrack.elevation.gain += track.elevation.gain;
			myTrack.elevation.loss += track.elevation.loss;
		}

		return myTrack;
	},
});