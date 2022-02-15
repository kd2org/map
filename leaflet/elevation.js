(function () {
	window.GPXElevationProfile = function (track, width, height, color) {
		var left_margin = 50,
			bottom_margin = 10,
			right_margin = 10,
			w = width - left_margin - right_margin,
			h = height - bottom_margin;

		var max_elevation = 0;
		var min_elevation = 8000;
		var data = [];

		for (var i = 0; i < track.segments.length, segment = track.segments[i]; i++)
		{
			for (var j = 0; j < segment.points.length, point = segment.points[j]; j++)
			{
				max_elevation = Math.max(point.ele, max_elevation);
				min_elevation = Math.min(point.ele, min_elevation);
				data.push(point);
			}
		}

		var elevation_floor = Math.floor(min_elevation / 100)*100;
		var elevation_ceil = Math.ceil(max_elevation / 100)*100 - elevation_floor;
		var dist = Math.round(track.distance / 1000);
		var step = Math.ceil(data.length / w);
		var v = 0;

		var calc_y = function (elevation) {
			var y = elevation - elevation_floor;
			return (h - Math.round(y / (elevation_ceil) * h));
		};

		var d = 'M 0 ' + calc_y(elevation_floor);
		var points = [];

		for (var i = 0; i < data.length; i++)
		{
			v += data[i].ele;

			if ((i % step) == 0)
			{
				v /= step;
				var x = Math.ceil((i / data.length) * w);
				var y = calc_y(v);
				d += ' L ' + x + ' ' + y;
				points.push(x + ',' + y);
				v = 0;
			}
		}

		d += [' L', w, calc_y(data[data.length-1].ele), 'L', w, calc_y(elevation_floor), 'Z'].join(' ');

		var y_axis = [elevation_ceil+elevation_floor,
			Math.round((elevation_ceil/3)*2/20)*20 + elevation_floor,
			Math.round(elevation_ceil/3/20)*20 + elevation_floor,
			elevation_floor
		];
		var x_axis = [];

		for (var i = 0; i < 10; i++)
		{
			var _i = i == 9 ? data.length-1 : Math.round(i*(data.length/10));
			var _d = data[_i].distance;
			x_axis.push(Math.round(_d / 1000));
		}

		var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute('viewBox', '0 0 ' + (w+left_margin+10) + ' ' + (h+bottom_margin+10));
		svg.setAttribute('width', w+left_margin+10);
		svg.setAttribute('height', h+bottom_margin+10);

		var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
		g.setAttribute('transform', 'translate(5,5)');

		for (var i = 0; i < y_axis.length; i++)
		{
			var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
			var y = (i * (h / (y_axis.length-1)));
			line.setAttribute('x1', 40);
			line.setAttribute('y1', y);
			line.setAttribute('x2', w+left_margin+right_margin);
			line.setAttribute('y2', y);
			line.setAttribute('class', 'y-axis');
			g.appendChild(line);

			var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
			text.setAttribute('x', left_margin/1.5);
			text.setAttribute('y', y+2);
			text.setAttribute('class', 'y-axis');
			text.appendChild(document.createTextNode(y_axis[i] + ' m'));
			g.appendChild(text);
		}

		for (var i = 0; i < x_axis.length; i++)
		{
			var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
			var x = left_margin + (i * (w / (x_axis.length - 1)));
			line.setAttribute('x1', x);
			line.setAttribute('y1', h-10);
			line.setAttribute('x2', x);
			line.setAttribute('y2', h);
			line.setAttribute('class', 'x-axis');
			g.appendChild(line);

			var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
			text.setAttribute('x', x);
			text.setAttribute('y', h+10);
			text.setAttribute('class', 'x-axis');
			text.appendChild(document.createTextNode(x_axis[i] + ' km'));
			g.appendChild(text);
		}

		var g2 = document.createElementNS("http://www.w3.org/2000/svg", "g");
		g2.setAttribute('transform', 'translate('+left_margin+',0)');

		var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		path.setAttribute('d', d);

		var polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
		polyline.setAttribute('points', points.join(' '));

		if (color)
			polyline.setAttribute('style', 'stroke: '+color);

		g2.appendChild(path);
		g2.appendChild(polyline);
		g.appendChild(g2);
		svg.appendChild(g);
		return svg;
	};
} ());