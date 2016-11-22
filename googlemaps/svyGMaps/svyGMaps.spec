{
	"name": "googlemaps-svy-G-Maps",
	"displayName": "svyGMaps",
	"version": 1,
	"definition": "googlemaps/svyGMaps/svyGMaps.js",
	"libraries": [{"name":"svyGMaps.css", "version":"1", "url":"googlemaps/svyGMaps/svyGMaps.css", "mimetype":"text/css"}],
	"model":
	{
	"apiKey": "dataprovider",
	"latitude": {"type": "double", "default": 0.0},
	"longitude": {"type": "double", "default": 0.0},
	"address": "dataprovider",
	"zoom": "dataprovider",
	"addressTitle": { "type" : "dataprovider" , "tags" : {"scope" : "private"}},
	"styleClass": {
		"type": "styleclass", 
		"tags": { "scope" :"design" }	
	}}
	
}