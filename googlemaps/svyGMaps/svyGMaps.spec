{
	"name": "googlemaps-svy-G-Maps",
	"displayName": "svyGMaps",
	"version": 1,
	"definition": "googlemaps/svyGMaps/svyGMaps.js",
	"libraries": [{"name":"svyGMaps.css", "version":"1", "url":"googlemaps/svyGMaps/svyGMaps.css", "mimetype":"text/css"},
				 {"name":"svyMarkerCluster.js", "version":"1", "url":"https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js", "mimetype":"text/javascript", "group":false}],
	"model":
	{
	"markers": {"type":"googleMarkers[]", "pushToServer": "allow", "default": [], "tags": { "scope" :"design" }},
	"apiKey": "dataprovider",
	"zoom": "dataprovider",
	
	"mapTypeControl": {"type":"boolean", "default": "true", "tags": { "scope" :"design" }},
	"zoomControl": {"type":"boolean", "default": "true", "tags": { "scope" :"design" }},
	"streetViewControl": {"type":"boolean", "default": "true", "tags": { "scope" :"design" }},
	"fullscreenControl": {"type":"boolean", "default": "true", "tags": { "scope" :"design" }},
	"mapType": { "type":"string", "values":["ROADMAP", "SATELLITE","HYBRID","TERRAIN"], "default":"ROADMAP", "tags": { "scope" :"design" }},
	
	"useGoogleMapCluster": {"type":"boolean", "default": "false", "tags": { "scope" :"runtime" }},
	"useGoogleMapDirections": {"type":"boolean", "default": "false", "tags": { "scope" :"runtime" }},
	
	"addressTitle": { "type" : "dataprovider" , "tags" : {"scope" : "private"}},
	"styleClass": {"type": "styleclass", "tags": { "scope" :"design" }
	}},
	"types": {
		"googleMarkers" : {
			"addressDataprovider": "dataprovider",
			"addressString": "string",
			"latitude": {"type": "double", "default": 0.0},
            "longitude": {"type": "double", "default": 0.0},
            "iconLabel": {"type": "string"},
            "tooltip": {"type": "string"},
            "iconUrl": {"type": "string"},
            "infoWindowString": {"type": "tagstring"}
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
		}
	}
	
}