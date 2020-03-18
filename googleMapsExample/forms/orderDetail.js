/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"954CE5D7-3AE3-4353-AE1F-2BEF56FDF29D"}
 */
var routeDetails = null;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"8BBAD926-14A3-4A24-99ED-5981823BFF6D",variableType:4}
 */
var zoomLevel = 7;

/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"CF3D747F-652E-445E-A738-7E5B83A05406"}
 */
var apiKey = '';

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"E9DC7CF8-14F8-4C8C-8697-FB78B56883F3"}
 */
function onShow(firstShow, event) {
	if(!apiKey){
		var input = plugins.dialogs.showInputDialog('API Key Required','Google Maps now requires an API key to submit for every request. Please put your API key here:');
		if(input){
			apiKey = input;
			elements.map.refresh();
		}
	}
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"F4CF8FC5-3F73-454F-A064-7E226A2568C1"}
 */
function singleMarkerAPI(event) {
	elements.map.removeAllMarkers()
	/**@type {Array<CustomType<googlemaps-svy-G-Maps.googleMarkers>>} */
	var marker = [{addressString: "Fred. Roeskestraat 97, Amsterdam, NL"}];
	elements.map.newMarkers(marker)
}


/**
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"46A16B75-8A0F-4EC5-939F-2D7886A73656"}
 */
function multiMarkerAPI(event) {
	elements.map.removeAllMarkers()
	var arrayMarkers = [];
	/**@type {CustomType<googlemaps-svy-G-Maps.googleMarkers>} */
	var marker = {addressString: "Fred. Roeskestraat 97, Amsterdam, NL"};
	arrayMarkers.push(marker);
	marker.tooltip = 'Servoy Amsterdam'
	marker.iconUrl = 'http://maps.google.com/mapfiles/ms/icons/orange.png'
	marker.infoWindowString = '<strong>Servoy Amsterdam</strong><br>Software company at Amsterdam'
	
	marker = {addressString: "Machlaan 14A, Eelde, NL"};
	marker.tooltip = 'Airport Eelde NL'
	marker.iconLabel = 'G'
	marker.drawRadius = true
	marker.radiusMeters = 1000
	marker.radiusColor = '#ffa500'
	arrayMarkers.push(marker);
	
	marker = {addressString: "Luchthavenweg 25, Eindhoven, NL"};
	marker.tooltip = 'Airport Eindhoven NL'
	marker.iconLabel = 'E'
	arrayMarkers.push(marker);
	
	marker = {addressString: "Evert van de Beekstraat 202, Schiphol, NL"};
	marker.tooltip = 'Airport Schiphol NL'
	marker.iconUrl = 'http://maps.google.com/mapfiles/ms/icons/blue.png'

	arrayMarkers.push(marker);
	elements.map.newMarkers(arrayMarkers)
}

/**
 * @properties={typeid:24,uuid:"CDE560C2-4EB6-4145-B649-E92B0CF5F1C4"}
 */
function enableRouteMode() {
	elements.map.useGoogleMapCluster = false;
	elements.map.useGoogleMapDirections = true;
	routeDetails = null;
	elements.map.refresh();
}

/**
 * @properties={typeid:24,uuid:"C752CCF4-07F6-45FF-8025-9E9DA1F6CB70"}
 */
function disableRouteMode() {
	elements.map.useGoogleMapCluster = false;
	elements.map.useGoogleMapDirections = false;
	routeDetails = null;
	elements.map.refresh();
}

/**
 * @properties={typeid:24,uuid:"6EF3FDB2-1EA4-4142-8A0C-29F70F0FB81D"}
 */
function enableClusterMode() {
	elements.map.useGoogleMapCluster = true;
	elements.map.useGoogleMapDirections = false;
	elements.map.refresh();
}

/**
 * @properties={typeid:24,uuid:"613665B7-E5C3-4A49-B09B-2DFD7EABB1E3"}
 */
function disableClusterMode() {
	elements.map.useGoogleMapCluster = false;
	elements.map.useGoogleMapDirections = false;
	elements.map.refresh();
}

/**
 * @param {{
	    legs: Array<{
	        start_address: String,
	        end_address: String,
	        distance: String,
	        distance_meters: Number,
	        duration: String,
	        duration_seconds: Number,
	    }>,
	    total_distance: Number,
	    total_duration: Number
	}} route
 *
 * @private
 *
 * @properties={typeid:24,uuid:"1162BE1C-9833-4717-B179-F589CDE762E5"}
 */
function onRouteChanged(route) {
	if(route) {
		routeDetails = 'Total distance: ' + route.total_distance + ' meters\nTotal duration:' + route.total_duration + ' seconds' 
	} else {
		routeDetails = null;
	}

}
