{
	"name": "googlemaps-svy-G-Maps",
	"displayName": "svyGMaps",
	"version": 1,
	"definition": "googlemaps/svyGMaps/svyGMaps.js",
	"libraries": [
		{"name":"svyGMaps.css", "version":"1", "url":"googlemaps/svyGMaps/svyGMaps.css", "mimetype":"text/css"},
		{"name":"ng-map.min.js", "version":"1.17.94", "url":"googlemaps/svyGMaps/ngmap/ng-map.min.js", "mimetype":"text/javascript"}
	],
	"model":
	{
		"apiKey"						: { "type": "dataprovider"},
		"latitude"						: { "type": "double", "default": 0.0},
		"longitude"						: { "type": "double", "default": 0.0},
		"center"						: { "type": "LatLng", "pushToServer": "allow" },
		"address"						: { "type": "dataprovider"},
		"destinationAddress"			: { "type": "dataprovider"},
		"zoom"							: { "type": "dataprovider", "pushToServer": "allow" }, 
		"addressTitle"					: { "type" : "dataprovider" , "tags" : {"scope" : "private"} },
		"styleClass"					: { "type": "styleclass", "tags": { "scope" :"design" }	},
		"markers"						: { "type": "Marker[]", "pushToServer": "allow" },
		"autoFitBounds"					: { "type": "boolean", "default": "true" },
		"maxAutoFitBoundsZoom"			: { "type": "int" },
		"size" 							: { "type" :"dimension",  "default" : {"width":600, "height":400} }, 
    	"location" 						: { "type": "point" },
    	"draggable"						: { "type": "boolean", "default": true },
    	"mapType"						: { "type": "string", "values": ["HYBRID", "ROADMAP", "SATELLITE", "TERRAIN"], "default": "ROADMAP" },
    	"route"							: { "type": "googlemaps-svy-G-Maps.Route", "pushToServer": "allow" }
	},
	"api": 
	{
		"addMarker": {
			"parameters": [
				{ "name": "marker", "type": "googlemaps-svy-G-Maps.Marker" }
			]
		},
		"removeMarker": {
			"parameters": [
				{ "name": "markerIndexOrId", "type": "object" }
			]
		},
		"removeMarkers": {
			"parameters": [
				{ "name": "keepAddress", "type": "boolean", "optional": true }
			]
		},
		"geocodeAddress": {
			"parameters": [
				{ "name": "address", "type": "string" },
				{ "name": "successCallback", "type": "function" },
				{ "name": "errorCallback", "type": "function" },
				{ "name": "options", "type": "object", "optional": true }
			]
		},
		"fitBounds": {
			"parameters": [
				{ "name": "bounds", "type": "googlemaps-svy-G-Maps.LatLng", "optional": true }
			]
		}
	},
	"handlers": 
	{
		"onMarkerClicked": {
			"description": "",
			"parameters": [
				{ "name": "event", "type": "JSEvent" },
				{ "name": "marker", "type": "googlemaps-svy-G-Maps.Marker" }
			]
		}, 
		"onMarkerDragged": {
			"description": "",
			"parameters": [
				{ "name": "event", "type": "JSEvent" },
				{ "name": "marker", "type": "googlemaps-svy-G-Maps.Marker" },
				{ "name": "latLng", "type": "googlemaps-svy-G-Maps.LatLng" }
			]
		},
		"onMapClicked": {
			"description": "",
			"parameters": [
				{ "name": "event", "type": "JSEvent" },
				{ "name": "latLng", "type": "googlemaps-svy-G-Maps.LatLng" }
			]
		}
	},
	"types": 
	{
		"Marker": {
			"id"						: { "type": "string" },
			"address"					: { "type": "string" },
			"lat"						: { "type": "double" },
			"lng"						: { "type": "double" },
			"title"						: { "type": "string" },
			"iconUrl"					: { "type": "string" },
			"iconMedia"					: { "type": "media" },
			"animation"					: { "type": "string", "values": ["BOUNCE", "DROP"], "default": "null"},
			"draggable"					: { "type": "boolean" }
		},
		"Route": {
			"draggable"					: { "type": "boolean" },
			"travel-mode"				: { "type": "string" },
			"waypoints"					: { "type": "googlemaps-svy-G-Maps.Waypoint[]" },
			"origin"					: { "type": "string" },
			"destination"				: { "type": "string" }
		},
		"Waypoint": {
			"location"					: { "type": "string" },
			"stopover"					: { "type": "boolean" }
		},
		"LatLng": {
			"lat"						: { "type": "double" },
			"lng"						: { "type": "double" }
		}
	}
}