{
	"name": "googlemaps-svy-G-Maps",
	"displayName": "svyGMaps",
	"version": 1,
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
        "KmlLayerURL": {"type": "dataprovider", "pushToServer": "allow", "tags": { "scope" :"design" }}
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
            "radiusColor": {"type": "color", "default": "AA0000"}
        }, 
        "routeSettings": {
			"optimize" : { "type": "boolean", "default": true }, 
            "travelMode" : { "type": "string", "values":["driving", "walking","bicycling","transit"], "default":"driving"},
            "avoidFerries" : {"type": "boolean", "default": false},
            "avoidHighways" : {"type": "boolean", "default": false},
            "avoidTolls" : {"type": "boolean", "default": false}
		}
    },
    "handlers":
	{
        "onRouteChanged" : {
            "parameters" : [
                { "name" : "routeDetails", "type" : "object" }
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
		"getCalculatedRoute": {
			"returns": "object"
        }
	}
}