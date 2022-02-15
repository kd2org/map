/**
 * Copyright (C) 2011-2012 Pavel Shramov
 * Copyright (C) 2013 Maxime Petazzoni <maxime.petazzoni@bulix.org>
 * All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * Thanks to Pavel Shramov who provided the initial implementation and Leaflet
 * integration. Original code was at https://github.com/shramov/leaflet-plugins.
 *
 * It was then cleaned-up and modified to record and make available more
 * information about the GPX track while it is being parsed so that the result
 * can be used to display additional information about the track that is
 * rendered on the Leaflet map.
 */

var _MAX_POINT_INTERVAL_MS = 15000;
var _SECOND_IN_MILLIS = 1000;
var _MINUTE_IN_MILLIS = 60 * _SECOND_IN_MILLIS;
var _HOUR_IN_MILLIS = 60 * _MINUTE_IN_MILLIS;

var _DEFAULT_MARKER_OPTS = {
  startIconUrl: 'pin-icon-start.png',
  endIconUrl: 'pin-icon-end.png',
  shadowUrl: 'pin-shadow.png',
  iconSize: [33, 50],
  shadowSize: [50, 50],
  iconAnchor: [16, 45],
  shadowAnchor: [16, 47],
  clickable: false
};
var _DEFAULT_POLYLINE_OPTS = {
	color:'blue'
};
L.GPX = L.FeatureGroup.extend({
  initialize: function(gpx, options) {
    options.max_point_interval = options.max_point_interval || _MAX_POINT_INTERVAL_MS;
    options.marker_options = this._merge_objs(
      _DEFAULT_MARKER_OPTS,
      options.marker_options || {});
    options.polyline_options = this._merge_objs(
      _DEFAULT_POLYLINE_OPTS,
      options.polyline_options || {});

    L.Util.setOptions(this, options);

    // Base icon class for track pins.
    L.GPXTrackIcon = L.Icon.extend({ options: options.marker_options });

    this._gpx = gpx;
    this._layers = {};
    this._info = {
      length: 0.0,
      elevation: {gain: 0.0, loss: 0.0, _points: []},
    };

    if (gpx) {
      this._parse(gpx, options, this.options.async);
    }
  },

  // Public methods
  to_miles:            function(v) { return v / 1.60934; },
  to_ft:               function(v) { return v * 3.28084; },
  m_to_km:             function(v) { return v / 1000; },
  m_to_mi:             function(v) { return v / 1609.34; },

  get_distance:        function() { return this._info.length; },

  get_point_at_km:      function(km) {
    var m = km*1000;
    for (var i = 0; i < this._info.elevation._points.length; i++) {
      var p = this._info.elevation._points[i];
      if (p[0] >= m)
      {
        return p;
      }
    }
    return false;
  },

  get_elevation_gain:     function() { return this._info.elevation.gain; },
  get_elevation_loss:     function() { return this._info.elevation.loss; },
  get_elevation_data:     function() {
    var _this = this;
    return this._info.elevation._points;
  },
  get_elevation_data_imp: function() {
    var _this = this;
    return this._info.elevation._points.map(
      function(p) { return _this._prepare_data_point(p, _this.m_to_mi, _this.to_ft,
        function(a, b) { return a.toFixed(2) + ' mi, ' + b.toFixed(0) + ' ft'; });
      });
  },

  reload: function() {
    this.clearLayers();
    this._parse(this._gpx, this.options, this.options.async);
  },

  // Private methods
  _merge_objs: function(a, b) {
    var _ = {};
    for (var attr in a) { _[attr] = a[attr]; }
    for (var attr in b) { _[attr] = b[attr]; }
    return _;
  },

  _prepare_data_point: function(p, trans1, trans2, trans_tooltip) {
    var r = [trans1 && trans1(p[0]) || p[0], trans2 && trans2(p[1]) || p[1]];
    r.push(trans_tooltip && trans_tooltip(r[0], r[1]) || (r[0] + ': ' + r[1]));
    return r;
  },

  _load_xml: function(url, cb, options, async) {
    if (async == undefined) async = this.options.async;
    if (options == undefined) options = this.options;

    var req = new window.XMLHttpRequest();
    req.open('GET', url, async);
    try {
      req.overrideMimeType('text/xml'); // unsupported by IE
    } catch(e) {}
    req.onreadystatechange = function() {
      if (req.readyState != 4) return;
      if(req.status == 200) cb(req.responseXML, options);
    };
    req.send(null);
  },

  _parse: function(input, options, async) {
    var _this = this;
    var cb = function(gpx, options) {
      var layers = _this._parse_gpx_data(gpx, options);
      if (!layers) return;
      _this.addLayer(layers);
      _this.fire('loaded');
    }
    if (input.substr(0,1)==='<') { // direct XML has to start with a <
      var parser = new DOMParser();
      setTimeout(function() {
        cb(parser.parseFromString(input, "text/xml"), options);
      });
    } else if (input.match(/^(https?:|\/)/)) {
      this._load_xml(input, cb, options, async);
    }
    else {
      return false;
    }
  },

  _parse_gpx_data: function(xml, options) {
    var j, i, el, layers = [];
    var tags = [['rte','rtept'], ['trkseg','trkpt']];


    for (j = 0; j < tags.length; j++) {
      el = xml.getElementsByTagName(tags[j][0]);
      for (i = 0; i < el.length; i++) {
        var coords = this._parse_trkseg(el[i], xml, options, tags[j][1]);
        if (coords.length === 0) continue;

        // add track
        var l = new L.Polyline(coords, {clickable: false, className: 'gpxTrace1'});
        this.fire('addline', { line: l })
        layers.push(l);

        var l = new L.Polyline(coords, {clickable: false, className: 'gpxTrace2'});
        this.fire('addline', { line: l })
        layers.push(l);

        var l = new L.Polyline(coords, {clickable: false, className: 'gpxTrace3'});
        this.fire('addline', { line: l })
        layers.push(l);

        // Only add end marker if startmarker is more than 25 meters away
        if (options.marker_options.endIconUrl 
          && (!options.marker_options.startIconUrl || coords[0].distanceTo(coords[coords.length-1]) > 25))
        {
          // add end pin
          p = new L.Marker(coords[coords.length-1], {
            clickable: false,
            icon: new L.GPXTrackIcon({iconUrl: options.marker_options.endIconUrl})
          });
          this.fire('addpoint', { point: p });
          layers.push(p);
        }

        if (options.marker_options.startIconUrl) {
          // add start pin
          var p = new L.Marker(coords[0], {
            clickable: false,
              icon: new L.GPXTrackIcon({iconUrl: options.marker_options.startIconUrl})
          });
          this.fire('addpoint', { point: p });
          layers.push(p);
        }

      }
    }

    if (!layers.length) return;
    var layer = layers[0];
    if (layers.length > 1)
      layer = new L.FeatureGroup(layers);
    return layer;
  },

  _parse_trkseg: function(line, xml, options, tag) {
    var el = line.getElementsByTagName(tag);
    if (!el.length) return [];
    var coords = [];
    var last = null;

    for (var i = 0; i < el.length; i++) {
      var _, ll = new L.LatLng(
        el[i].getAttribute('lat'),
        el[i].getAttribute('lon'));
      ll.meta = { time: null, ele: null };

      _ = el[i].getElementsByTagName('time');
      if (_.length > 0) {
        ll.meta.time = new Date(Date.parse(_[0].textContent));
      }

      _ = el[i].getElementsByTagName('ele');
      if (_.length > 0) {
        ll.meta.ele = parseFloat(_[0].textContent);
      }


      this._info.elevation._points.push([this._info.length, ll.meta.ele, ll]);

      if (last != null) {
        this._info.length += this._dist3d(last, ll);

        var t = ll.meta.ele - last.meta.ele;
        if (t > 0) this._info.elevation.gain += t;
        else this._info.elevation.loss += Math.abs(t);

      }

      last = ll;
      coords.push(ll);
    }

    return coords;
  },

  _dist2d: function(a, b) {
    var R = 6371000;
    var dLat = this._deg2rad(b.lat - a.lat);
    var dLon = this._deg2rad(b.lng - a.lng);
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
    var height = Math.abs(b.meta.ele - a.meta.ele);
    return Math.sqrt(Math.pow(planar, 2) + Math.pow(height, 2));
  },

  _deg2rad: function(deg) {
    return deg * Math.PI / 180;
  }
});
