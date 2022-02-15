(function () {
	var qs;

	function $(id) {
		return document.getElementById(id.substr(1));
	}

	// Parse query string
	var match,
		pl     = /\+/g,  // Regex for replacing addition symbol with a space
		search = /([^&=]+)=?([^&]*)/g,
		decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
		query  = window.location.search.substring(1);

	qs = {};
	while (match = search.exec(query))
	{
		qs[decode(match[1])] = decode(match[2]);
	}

	var provider = providers[(qs.p || 'OSM')];
	var layer = new L.tileLayer(provider.tile_url, provider);

	var map = L.map($('#map'), {
		zoom: qs.bb ? false : (qs.z || 5),
		attributionControl: false,
		center: qs.bb ? false : (qs.ll ? qs.ll.split(',') : [0, 0]),
		layers: layer
	});

	L.control.scale({imperial: false, metric: true}).addTo(map);

	if (qs.bb)
	{
		var bbox = qs.bb.split(',');
		map.fitBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);
	}

	window.addEventListener('message', function(e) {
		if (!e.data || typeof e.data != 'object') return;

		var mapData = e.data;

		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = '../leaflet/polyline.encoded.js';

		script.onload = function (e) 
		{
			for (var i = 0; i < mapData.tracks.length, track = mapData.tracks[i]; i++)
			{
				if (track.options instanceof Array)
				{
					for (var j = 0; j < track.options.length, options = track.options[j]; j++)
					{
						L.Polyline.fromEncoded(track.data, options).addTo(map);
					}
				}
				else
				{
					L.Polyline.fromEncoded(track.data, track.options).addTo(map);
				}
			}

			for (var i = 0; i < mapData.points.length, point = mapData.points[i]; i++)
			{
				if (point.label)
				{
					var icon = new L.divIcon({
						className: 'label', 
						html: point.label,
						iconSize: null
					});
				}
				else if (point.icon)
				{
					var icon = new L.icon({
						iconUrl: point.iconUrl,
						iconSize: point.iconSize,
						iconAnchor: point.iconAnchor,
						popupAnchor: point.popupAnchor
					});
				}
				else
				{
					var icon = new L.Icon.Default();
				}

				var marker = L.marker([point.lat, point.lon], {"icon": icon, clickable: point.content ? true : false});

				if (point.content)
				{
					marker.bindPopup(point.content);
				}

				marker.addTo(map);
			}

		};

		document.body.appendChild(script);
	});
}());