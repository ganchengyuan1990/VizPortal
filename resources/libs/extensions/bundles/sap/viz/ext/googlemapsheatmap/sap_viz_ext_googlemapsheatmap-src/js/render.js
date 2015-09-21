/*global window,google*/
define("sap_viz_ext_googlemapsheatmap-src/js/render", [], function() {
	var render = function(data, container) {
		//prepare canvas with width and height of container
		container.selectAll('svg').remove();
		var mset1 = data.meta.measures(0);
		var dset1 = data.meta.dimensions(0),
		ms1 = mset1[0]; // Find name of measure                                                   

		var dimLat, dimLon;

		//Try to understand which dimensions are lattitude and longtitude
		//if dimension names start with Lat or Lon they will be treated accordingly.
		//Otherwise, first row will be lattitude and second will be longtitude.
		if (typeof dset1[1] !== 'undefined') {
			if (dset1[0].toLowerCase().substring(0, 3) === 'lat' & dset1[1].toLowerCase().substring(0, 3) === 'lon') {
				dimLat = dset1[0];
				dimLon = dset1[1];
			} else if (dset1[1].toLowerCase().substring(0, 3) === 'lat' & dset1[0].toLowerCase().substring(0, 3) === 'lon') {
				dimLat = dset1[1];
				dimLon = dset1[0];
			} else {
				dimLat = dset1[0];
				dimLon = dset1[1];
			}
		}
		
		var mapDiv = container;

		//Slice data array that Lumira sends to extension.
		var fdata = data.slice();
		var renderFuncName;

		function initializeHeatMap() {
			var map = new google.maps.Map(mapDiv.node(), {
				mapTypeId: google.maps.MapTypeId.ROADMAP
			});

			var bound = new google.maps.LatLngBounds();
			var heatmapArray = [];

			fdata.forEach(function(d) {

				var latLon = new google.maps.LatLng(+d[dimLat], +d[dimLon]);
				bound.extend(latLon); //Bounds of map for determining center and zoom level.

				//Create an array of points for heatmap	
				heatmapArray.push({
					location: latLon,
					weight: d[ms1]
				});

			});

			//Center map according to boundaries of given coordinates.
			map.setCenter(bound.getCenter());
			map.fitBounds(bound);

			//Create heatmap layer. You can change opacity of points with opacity parameter.
			var heatmap = new google.maps.visualization.HeatmapLayer({
				opacity: 0.70
			});

			//Set map and data for our heatmap
			heatmap.setData(heatmapArray);
			heatmap.setMap(map);
			delete window[renderFuncName];
		}
		//use requirejs to load google maps api if it wasnt loaded before.
		//generate callback function name for each render.
		renderFuncName = $(".v-m-root").parent().attr("id") + "_render";
		window[renderFuncName] = initializeHeatMap;
		if (window.google && google.maps && google.maps.visualization && google.maps.visualization.HeatmapLayer) {
			initializeHeatMap();
		} else {
			require(['https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=visualization&callback=' + renderFuncName],
				function() {});
		}
	};
	return render;
});