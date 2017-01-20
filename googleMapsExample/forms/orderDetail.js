/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"0A2D0D89-152E-4DC0-BF02-1ABD5A990C5B"}
 */
var mapRouteDestination = 'Fred. Roeskestraat 97, 1076 EC Amsterdam, Netherlands';

/**
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"B1E52B0A-2B1C-448C-8A2F-A6FE18B47B6F",variableType:4}
 */
var zoomLevel = 10;

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
//	if(!apiKey){
//		var input = plugins.dialogs.showInputDialog('API Key Required','Google Maps now requires an API key to submit for every request. Please put your API key here:');
//		if(input){
//			apiKey = input;
//			elements.map.refresh();
//		}
//	}
}

/**
 * @properties={typeid:24,uuid:"B5FABFC7-C2FE-40D8-9D63-AF54C43BF3F4"}
 */
function geocodeAddress() {
	elements.map.geocodeAddress('Servoy BV Amsterdam',geocodeAddress_success,geocodeAddress_error)
	elements.map.geocodeAddress('Richter Supermarkt Starenweg 5 Genève Switzerland',geocodeAddress_success,geocodeAddress_error)
}

/**
 * @properties={typeid:24,uuid:"288FDCFD-51DE-4A24-9D99-0ECDF3D5A55F"}
 */
function geocodeAddress_success(geocodeResult) {
	application.output(JSON.stringify(arguments[0]))
}

/**
 * @properties={typeid:24,uuid:"85F21D09-0A3E-4D3D-8B05-F5C397CB4E38"}
 */
function geocodeAddress_error() {
	application.output(arguments[0]);
}
/**
 *
 * @param {JSEvent} event
 * @param {googlemaps-svy-G-Maps.LatLng} latLng
 *
 * @private
 *
 * @properties={typeid:24,uuid:"6850E8B7-AB67-4881-A9A3-7F9770D6583B"}
 */
function onMapClicked(event, latLng) {
	elements.lblEvent.text = ('Map ' + event.getElementName() + ' was clicked at ' + latLng.lat + ',' + latLng.lng);
}

/**
 *
 * @param {JSEvent} event
 * @param {googlemaps-svy-G-Maps.Marker} marker
 *
 * @private
 *
 * @properties={typeid:24,uuid:"79295DDD-BEBA-4B9E-BC2E-95F5E2208F5C"}
 */
function onMarkerClicked(event, marker) {
	elements.lblEvent.text = ('Marker with address \'' + marker.address + '\' was clicked on map \'' + event.getElementName() + '\'');
}

/**
 *
 * @param {JSEvent} event
 * @param {googlemaps-svy-G-Maps.Marker} marker
 * @param {googlemaps-svy-G-Maps.LatLng} latLng
 *
 * @private
 *
 * @properties={typeid:24,uuid:"EFD019C5-8168-4B1C-A899-EA9816FB845B"}
 */
function onMarkerDragged(event, marker, latLng) {
	elements.lblEvent.text = ('Marker with address \'' + marker.address + '\' on map \'' + event.getElementName() + '\' was dragged from + ' + marker.lat + ',' + marker.lng + ' to ' + latLng.lat + ',' + latLng.lng);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"7408EEA6-D5DD-4B81-BDA3-A5C156C7E4DB"}
 */
function onAction_btnAddMarkers(event) {
	//clear destination address, so we are out of "route" mode
	mapRouteDestination = null;
	
	//remove all previous markers except address
	elements.map.removeMarkers(true);
	
	//add markers
	elements.map.addMarker({
		address: 'Servoy BV Fred. Roeskestraat 97c 1076 EC Amsterdam', 
		title: 'Servoy',
		iconUrl: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
		animation: 'BOUNCE'
	});
	elements.map.addMarker({
		address: 'Tour Eiffel Paris France', 
		title: 'Tour Eiffel',
		iconUrl: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
		animation: 'DROP',
		draggable: true
	});
}
/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"56F6F44D-0463-4AB8-97BE-8B8C7A338FFB"}
 */
function onAction_btnCreateRoute(event) {
	//clear destination address, so a custom route can be provided
	mapRouteDestination = null;
	
	//setup route
	var route = {
		origin: foundset.displayAddressMap,
		destination: 'Servoy BV Fred. Roeskestraat 97c 1076 EC Amsterdam',
		waypoints: [
			{location: 'Munich Germany', stopover: true},
			{location: 'Strasbourg France', stopover: true},
			{location: 'Brussels Belgium', stopover: true}
		]
	}
	elements.map.route = route;
}
