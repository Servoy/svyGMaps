/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"CEE2A920-00D6-40D6-9945-3B3EAF0885AB"}
 */
var KmlLayerURL = null;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"9F45DF66-7451-4CD5-88C0-B98DF76F1F95",variableType:4}
 */
var enablePrivacy = 0;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"E2E05F6C-445F-4384-AF36-5437DCCFFF9C",variableType:4}
 */
var enableRoute = 0;

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"81D4239D-6BC5-4510-BF31-E01CDD087B32",variableType:4}
 */
var enableClusterMode = 0;

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
 * @public
 * 
 * @param {JSEvent} event the event that triggered the action
 * @param {Array<JSRecord<db:/example_data/orders>>} records
 * @properties={typeid:24,uuid:"46A16B75-8A0F-4EC5-939F-2D7886A73656"}
 */
function multiMarkerAPI(event, records) {
	elements.map.removeAllMarkers()
	var arrayMarkers = [];
	
	for each(var record in records) {
		/**@type {CustomType<googlemaps-svy-G-Maps.googleMarkers>} */
		var marker = {
			addressString: record.shipaddress + ' ' + record.shipcity + ' ' + record.shipcountry,
			tooltip: record.orders_to_customers.companyname,
			iconUrl: 'http://maps.google.com/mapfiles/ms/icons/orange.png'
		}
		
		if(enablePrivacy) {
			marker.iconUrl = null;
			marker.iconLabel = record.orders_to_customers.companyname.charAt(0).toUpperCase();
			marker.drawRadius = true;
			marker.radiusMeters = 1000;
			marker.radiusColor = '#ffa500'
		}
		arrayMarkers.push(marker);
	}
	
	elements.map.newMarkers(arrayMarkers)
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

/**
 * Handle changed data, return false if the value should not be accepted. In NGClient you can return also a (i18n) string, instead of false, which will be shown as a tooltip.
 *
 * @param {Number} oldValue old value
 * @param {Number} newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"2B39570E-A2E5-4F47-863F-5BBC8B1D71C2"}
 */
function onDataChangeRoute(oldValue, newValue, event) {
	if(enableRoute) {
		enableClusterMode = 0;
		elements.map.useGoogleMapCluster = false;
		elements.map.useGoogleMapDirections = true;
	} else {
		routeDetails = null;
		elements.map.useGoogleMapDirections = false;
	}
	elements.map.refresh();
	return true
}

/**
 * Handle changed data, return false if the value should not be accepted. In NGClient you can return also a (i18n) string, instead of false, which will be shown as a tooltip.
 *
 * @param {Number} oldValue old value
 * @param {Number} newValue new value
 * @param {JSEvent} event the event that triggered the action
 *
 * @return {Boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"7F69F525-AD63-430E-BDA6-48C1E4358223"}
 */
function onDataChangeCluster(oldValue, newValue, event) {
	if(enableClusterMode) {
		enableRoute = 0;
		routeDetails = null;
		elements.map.useGoogleMapCluster = true;
		elements.map.useGoogleMapDirections = false;
	} else {
		elements.map.useGoogleMapCluster = false;
	}
	elements.map.refresh();
	return true
}

/**
 * Perform the element onclick action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"6914FAA1-EA79-4865-A249-740EE6551BA6"}
 */
function enableSwissKML(event) {
	if(elements.enableKML.text == 'Enable Chicago KML') {
		KmlLayerURL = 'https://googlearchive.github.io/js-v2-samples/ggeoxml/cta.kml';
		elements.enableKML.text = "Disable Chicago KML";
	} else {
		KmlLayerURL = null;
		elements.enableKML.text = "Enable Chicago KML";
	}
}

/**
 * Perform the element onclick action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"07A118DF-55C8-491D-8DFC-BBE868506F72"}
 */
function applyCenter(event) {
	if(event.getElementName() == 'centerAddress') {
		elements.map.centerAtAddress(shipaddress + ' ' + shipcity + ' ' + shipcountry);
	} else {
		elements.map.centerAtLatLng(33,-111);
	}
}
