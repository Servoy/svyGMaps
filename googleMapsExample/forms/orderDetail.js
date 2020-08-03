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
 * @private 
 *
 * @properties={typeid:35,uuid:"22536E35-B972-4B7D-B562-7A1A14499C46"}
 */
var CREATED_FROM_RECORD = 'createdFromRecord'

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
 * @param {Array<JSRecord<db:/example_data/orders>>} records
 * @properties={typeid:24,uuid:"46A16B75-8A0F-4EC5-939F-2D7886A73656"}
 */
function setMarkers(records) {
	var arrayMarkers = [],
		record;
	
	//check for markers to remove
	var mapMarkers = elements.map.getMarkers();
	if (mapMarkers && mapMarkers.length > 0) {
		for (var m = mapMarkers.length - 1 ; m >= 0 ; m-- ) {
			if (mapMarkers[m].userObject != CREATED_FROM_RECORD) {
				//when not created from record, no need to remove
				continue;
			}
			var recFound = false;
			for each (record in records) {	
				if (mapMarkers[m].markerId == record.orderid) {
					recFound = true;
					break;
				}
			}
			if (!recFound) {
				elements.map.removeMarker(m);
			}
		}
	}
	
	for each (record in records) {	
		if (elements.map.getMarkerById(record.orderid)) {
			//we already have this marker
			continue;
		}
		
		//create marker
		var marker = elements.map.createMarker(
			record.orderid,
			record.shipaddress + ' ' + record.shipcity + ' ' + record.shipcountry,
			record.orders_to_customers.companyname
		);
		
//		marker.iconUrl = 'http://maps.google.com/mapfiles/ms/icons/orange.png';
//		marker.iconUrl = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
		marker.iconMedia = "media:///servoy_marker.png";

		marker.infoWindowString = record.orders_to_customers.companyname;
		marker.draggable = true;
		marker.animation = 'drop';
		//add a flag to recognize markers created from records
		marker.userObject = CREATED_FROM_RECORD;

		if (enablePrivacy) {
			marker.iconUrl = null;
			marker.iconLabel = record.orders_to_customers.companyname.charAt(0).toUpperCase();
			marker.drawRadius = true;
			marker.radiusMeters = 1000;
			marker.radiusColor = '#ffa500'
		}
		
		//add to markers to add
		arrayMarkers.push(marker);
	}
	
	elements.map.addMarkers(arrayMarkers);
}

/**
 * @param {CustomType<googlemaps-svy-G-Maps.routeResult>} route
 *
 * @private
 *
 * @properties={typeid:24,uuid:"1162BE1C-9833-4717-B179-F589CDE762E5"}
 */
function onRouteChanged(route) {
	var routeDetailsArray = [];
	if (route) {
		routeDetailsArray.push('Total distance: ' + utils.numberFormat(Math.ceil(route.total_distance / 1000), i18n.getDefaultNumberFormat()) + ' km');
		routeDetailsArray.push('Total duration: ' + Math.ceil(route.total_duration / 60) + ' minutes');
		routeDetailsArray.push('');
		var legs = route.legs;
		for (var l = 0; l < legs.length; l++) {
			routeDetailsArray.push('Leg ' + (l + 1) + ' distance: ' + utils.numberFormat(Math.ceil(legs[l].distance_meters / 1000), i18n.getDefaultNumberFormat()) + ' km');
			routeDetailsArray.push('Leg ' + (l + 1) + ' duration: ' + legs[l].duration);
		}
		routeDetails = routeDetailsArray.join('<br>');
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
	if (enableRoute) {
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
	if (enableClusterMode) {
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
function onAction_btnEnableKML(event) {
	if (elements.btnEnableKML.text == 'Enable Chicago KML') {
		KmlLayerURL = 'https://googlearchive.github.io/js-v2-samples/ggeoxml/cta.kml';
		elements.btnEnableKML.text = "Disable Chicago KML";
	} else {
		KmlLayerURL = null;
		elements.btnEnableKML.text = "Enable Chicago KML";
	}
}

/**
 * @param {JSEvent} event
 * @param {Number} markerIndex
 * @param {CustomType<googlemaps-svy-G-Maps.latLng>} [latLng]
 *
 * @private
 *
 * @properties={typeid:24,uuid:"59D528EA-4132-4E24-BD1B-369945E5B123"}
 */
function onMarkerEvent(event, markerIndex, latLng) {
	if (!(markerIndex >= 0)) {
		return;
	}
	
	var marker = elements.map.getMarker(markerIndex);
	
	application.output('Marker event "' + event.getType() + '" detected for marker with markerId "' + marker.markerId + '"' + (latLng ? ' at ' + latLng.lat + ', ' + latLng.lng : ''));
	application.output('Marker is ' + JSON.stringify(marker, null, 4));
	
	if (event.getType() === 'dblclick') {
		if (marker.markerId && marker.userObject == CREATED_FROM_RECORD) {
			//record
			var selectedIndexes = foundset.getSelectedIndexes();
			if (selectedIndexes.length > 1) {
				selectedIndexes.splice(markerIndex, 1);
				foundset.setSelectedIndexes(selectedIndexes);
			}
		} else {
			//manually added
			elements.map.removeMarker(markerIndex);
		}
	} else if (event.getType() === 'rightclick') {
		var popup = plugins.window.createPopupMenu();
		popup.addMenu(marker.title);
		popup.addSeparator();
		popup.addMenu('Foo');
		popup.addMenu('Bar');
		popup.show(event.getX(), event.getY());
	}
}

/**
 * @param {JSEvent} event
 * @param {CustomType<googlemaps-svy-G-Maps.latLng>} [latLng]
 *
 * @private
 *
 * @properties={typeid:24,uuid:"3B40ECC0-B12A-4C9E-95F4-ED46496AB8F1"}
 */
function onMapEvent(event, latLng) {
	application.output('Map event "' + event.getType() + '" detected ' + (latLng ? ' at ' + latLng.lat + ', ' + latLng.lng : ''));
	
	if (event.getType() === 'click') {
		var markerToAdd = elements.map.createMarker(application.getUUID(), latLng);
		markerToAdd.title = 'Added by click';
		elements.map.addMarker(markerToAdd);
	} else if (event.getType() === 'rightclick') {
		var popup = plugins.window.createPopupMenu();
		popup.addMenu('Hello');
		popup.addMenu('World');
		popup.show(event.getX(), event.getY());
	}
}

/**
 * @properties={typeid:24,uuid:"62DB2D11-78E2-43E1-AE3B-8D3F99D18088"}
 */
function getBounds() {
	application.output(elements.map.getBounds());
}

/**
 * @properties={typeid:24,uuid:"E7DE6A38-3DF1-47E1-AE7D-3E9331BFF26D"}
 */
function getCenter() {
	application.output(elements.map.getCenter());
}

/**
 * @properties={typeid:24,uuid:"4BB36E1B-0AA9-460A-8E42-2C20F6360627"}
 */
function fitBounds() {
	var latLngBounds = {
		sw: 	{ lng: 0.5480615944616041, lat: 49.64885696873385 },
		ne:		{ lng: 11.951870188211604, lat: 52.95102524260337 }
	}
	elements.map.fitBounds(latLngBounds);
}

/**
* Perform the element onclick action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @properties={typeid:24,uuid:"4EFC7CEB-335B-40A6-AAFB-734FEB7605A6"}
 */
function onAction_btnClearMarkers(event) {
	elements.map.removeAllMarkers();
	elements.map.centerAtLatLng(0, 0);
	zoomLevel = 4;
}

/**
 * Perform the element onclick action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"51EBAB8A-7DE0-454F-A595-3FC5EBEDF3CF"}
 */
function onAction_btnAddServoy(event) {
	var servoyMarker = elements.map.createMarker('svyMarker', 'Fred. Roeskestraat 97, 1076 EC Amsterdam', 'Servoy B.V.');
	servoyMarker.iconMedia = 'media:///servoy_marker.png';
	elements.map.addMarker(servoyMarker);
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
 * @properties={typeid:24,uuid:"B1CD9FFD-41B0-43E6-8975-6DBC33C9F38C"}
 */
function onDataChange_enabledPrivacy(oldValue, newValue, event) {
	elements.map.removeAllMarkers();
	setMarkers(foundset.getSelectedRecords());
	elements.map.refresh();
	return true
}

/**
 * @param {CustomType<googlemaps-svy-G-Maps.marker>} marker
 * @param {CustomType<googlemaps-svy-G-Maps.latLng>} latLng
 *
 * @private
 *
 * @properties={typeid:24,uuid:"024BF291-125D-4DB0-AE36-CD5F17F2D0BF"}
 */
function onMarkerGeocoded(marker, latLng) {
	application.output('Marker ' + marker.markerId + ' geocoded as [' + latLng.lat + ', ' + latLng.lng + ']');
}

/**
 * @param {JSEvent} event
 *
 * @private
 *
 * @properties={typeid:24,uuid:"9B935D3F-6D16-43B6-9162-18F4AE2A88D9"}
 */
function onAction_btnCenterAddress(event) {
	elements.map.centerAtAddress(shipaddress + ' ' + shipcity + ' ' + shipcountry);
}

/**
 * @param {JSEvent} event
 *
 * @private
 *
 * @properties={typeid:24,uuid:"31809AA2-A97C-4A71-A501-1FC318AF7128"}
 */
function onAction_btnCenterLatLng(event) {
	elements.map.centerAtLatLng(33, -111);
}

/**
 * Called when the selected rows have changed.
 *
 * @private
 *
 * @properties={typeid:24,uuid:"862EF850-E97D-466A-ABDA-1682909B757F"}
 */
function onSelectedRowsChanged() {
	/** @type {Array<JSRecord<db:/example_data/orders>>} */
	var selectedRecords
	if (elements.ordersTable.getGroupedSelection()) {
		selectedRecords = elements.ordersTable.getGroupedSelection();
	} else {
		selectedRecords = elements.ordersTable.myFoundset.foundset.getSelectedRecords();
	}
	setMarkers(selectedRecords);
}
