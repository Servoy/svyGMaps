{
	"name": "googlemaps-svy-G-Maps",
	"displayName": "Google Maps",
    "categoryName": "Visualization",
	"version": 1,
    "icon": "googlemaps/svyGMaps/icon.png",
    "definition": "googlemaps/svyGMaps/svyGMaps.js",
    "serverscript" : "googlemaps/svyGMaps/svyGMaps_server.js",
	"libraries": [
                    {"name":"svyGMaps.css", "version":"1", "url":"googlemaps/svyGMaps/svyGMaps.css", "mimetype":"text/css"},
                    {"name":"markerclustererplus.min.js", "version":"4.0.1", "url":"googlemaps/svyGMaps/libs/markerclustererplus.min.js", "mimetype":"text/javascript", "group":false}
                ],
	"model":
	{
        "markers": {"type":"googleMarkers[]", "pushToServer": "shallow", "default": [], "tags": { "scope" :"design" }},
        "apiKey": "dataprovider",
        "zoomLevel": {"type": "dataprovider", "pushToServer": "allow", "tags": { "scope" :"design" }},
        "mapTypeControl": {"type":"boolean", "default": true, "tags": { "scope" :"design" }},
        "zoomControl": {"type":"boolean", "default": true, "tags": { "scope" :"design" }},
        "streetViewControl": {"type":"boolean", "default": true, "tags": { "scope" :"design" }},
        "fullscreenControl": {"type":"boolean", "default": true, "tags": { "scope" :"design" }},
        "mapType": { "type":"string", "values":["ROADMAP", "SATELLITE","HYBRID","TERRAIN"], "default":"ROADMAP", "tags": { "scope" :"design" }},
        "useGoogleMapCluster": {"type":"boolean", "default": false },
        "useGoogleMapDirections": {"type":"boolean", "default": false },
        "addressTitle": { "type" : "dataprovider" , "tags" : {"scope" : "private"}},
        "styleClass": {"type": "styleclass", "tags": { "scope" :"design" }},
        "gestureHandling": {"type":"string", "values":["auto", "greedy","cooperative","none"], "default":"auto", "tags": { "scope" :"design" }},
        "directionsSettings" : { "type": "routeSettings" },
        "KmlLayerURL": {"type": "dataprovider", "pushToServer": "allow", "tags": { "scope" :"design" }},
        "mapEvents": {"type": "string[]", "elementConfig" : { "values": ["bounds_changed", "center_changed", "click", "dblclick", "drag", "dragend", "dragstart", "heading_changed", "idle", "maptypeid_changed", "mousemove", "mouseout", "mouseover", "projection_changed", "rightclick", "tilesloaded", "tilt_changed", "zoom_changed"], "default": "click" }},
        "markerEvents": {"type": "string[]", "elementConfig" : { "values": ["animation_changed", "click", "clickable_changed", "cursor_changed", "dblclick", "drag", "dragend", "draggable_changed", "dragstart", "flat_changed", "icon_changed", "mousedown", "mouseout", "mouseover", "mouseup", "position_changed", "rightclick", "shape_changed", "title_changed", "visible_changed", "zindex_changed"], "default": "click" }}
	},
	"types": {
		"googleMarkers" : {
			"addressDataprovider": "dataprovider",
			"addressString": "string",
			"latitude": {"type": "double", "default": 0.0},
            "longitude": {"type": "double", "default": 0.0},
            "iconLabel": {"type": "string"},
            "tooltip": {"type": "string"},
            "iconUrl": {"type": "string"},
            "infoWindowString": {"type": "tagstring"},
            "drawRadius": {"type": "boolean", "default": false},
            "radiusMeters": {"type": "int", "default": 2000},
            "radiusColor": {"type": "color", "default": "#AA0000"},
            "draggable": {"type": "boolean", "default": false},
            "animation": {"type": "string", "values": ["BOUNCE", "DROP"], "default": null},
            "clickable": {"type": "boolean", "default": true},
            "crossOnDrag": {"type": "boolean", "default": true},
            "opacity": {"type": "double"},
            "visible": {"type": "boolean", "default": true},
            "zIndex": {"type": "int"},
            "markerId": {"type": "string"},
            "userObject": {"type": "object"}
        }, 
        "routeSettings": {
			"optimize" : { "type": "boolean", "default": true }, 
            "travelMode" : { "type": "string", "values":["driving", "walking","bicycling","transit"], "default":"driving"},
            "avoidFerries" : {"type": "boolean", "default": false},
            "avoidHighways" : {"type": "boolean", "default": false},
            "avoidTolls" : {"type": "boolean", "default": false}
		},
		"latLng": {
			"lat": { "type": "double" },
			"lng": { "type": "double" }
		},
		"latLngBounds": {
			"sw": { "type": "latLng" },
			"ne": { "type": "latLng" }
		}
    },
    "handlers":
	{
        "onRouteChanged" : {
            "parameters" : [
                { "name" : "routeDetails", "type" : "object" }
            ]
        },
        "onMarkerEvent" : {
            "parameters" : [
                { "name" : "event", "type" : "string" },
                { "name" : "marker", "type" : "googleMarkers" },
                { "name" : "latLng", "type" : "latLng", "optional": true }
            ]
        },
        "onMapEvent" : {
            "parameters" : [
                { "name" : "event", "type" : "string" },
                { "name" : "latLng", "type" : "latLng", "optional": true }
            ]
        }
    },
	"api": {
		"newMarkers": {
			"parameters": [{
				"name": "markers",
				"type": "googleMarkers[]"
				},{
				"name": "index",
				"type": "int",
				"optional": true
			}]
		},
		"removeMarker": {
			"parameters": [{
				  "name": "index",
				  "type": "int"
			  }],
			  "returns": "boolean"
	   },
		"removeAllMarkers": {
			"returns": "boolean"
		},
		"refresh": {
			"returns": "boolean"
        },
		"centerAtAddress": {
            "parameters": [{
                "name": "address",
                "type": "string"
            }],
            "delayUntilFormLoads": true,
            "returns": "boolean"
        },
		"centerAtLatLng": {
            "parameters": [{
                "name": "lat",
                "type": "int"
            },{
                "name": "lng",
                "type": "int"
            }],
            "delayUntilFormLoads": true,
            "returns": "boolean"
        },
        "getBounds": {
        	"delayUntilFormLoads": true,
            "returns": "latLngBounds"
        },
        "getCenter": {
        	"delayUntilFormLoads": true,
            "returns": "latLng"
        },
        "fitBounds": {
        	"parameters": [
        		{ "name": "latLngBounds", "type": "object" }
        	],
        	"delayUntilFormLoads": true
        }
	}
}