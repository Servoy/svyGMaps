/**
 * Remove all google markers
 * @example %%prefix%%%%elementName%%.removeAllMarkers();
 * @return {Boolean} True if all markers were successfully removed; otherwise, false.
 */
function removeAllMarkers() {
}

/**
 * Remove google marker at given index
 * @example %%prefix%%%%elementName%%.removeMarker(index);
 * @param {Number} index The index of the marker to remove.
 * @return {Boolean} True if the marker was successfully removed; otherwise, false.
 */
function removeMarker(index) {
}

/**
 * Creates a new, empty marker with the given marker ID and position
 * @param {Object} markerId The unique identifier for the marker.
 * @param {String|CustomType<googlemaps-svy-G-Maps.latLng} addressOrLatLng The address string or latitude/longitude coordinates for the marker position.
 * @param {String} [title] Optional title for the marker.
 * @return {CustomType<googlemaps-svy-G-Maps.marker>}  The created marker object.
 */
function createMarker(markerId, addressOrLatLng, title) {
}

/**
 * Returns the marker with the given index
 * @param {Number} index The index of the marker to retrieve.
 * @return {CustomType<googlemaps-svy-G-Maps.marker>} The marker object at the specified index.
 */
function getMarker(index) {
}

/**
 * Returns the marker with the given markerId
 * @param {Object} markerId The unique identifier of the marker.
 * @return {CustomType<googlemaps-svy-G-Maps.marker>} The marker object with the specified ID.
 */
function getMarkerById(markerId) {
}

/**
 * Returns all markers
 * @return {Array<CustomType<googlemaps-svy-G-Maps.marker>>}An array containing all marker objects currently displayed on the map.
 */
function getMarkers() {
}

/**
 * Adds the given marker
 * @param {CustomType<googlemaps-svy-G-Maps.marker>} marker The marker object to add.
 * @param {Number} [index] Starting point where to add the marker (useful to add waypoints in routes in a specific order)
 */
function addMarker(marker, index) {
}

/**
 * Adds the given markers
 * @param {Array<CustomType<googlemaps-svy-G-Maps.marker>>} markers An array of marker objects to add.
 * @param {Number} [index] Starting point where to add the markers (useful to add waypoints in routes in a specific order)
 */
function addMarkers(markers, index) {
}

/**
 * Add a new google marker to the map
 * @example %%prefix%%%%elementName%%.newMarkers([{addressString: 'Fred. Roeskestraat 97, Amsterdam, NL'}]);
 * @deprecated please use <code>addMarkers(markers, index)</code> instead
 * @param {Array<googlemaps-svy-G-Maps.marker>} newMarkers An array of marker objects to add.
 * @param {Number} [index] Starting point where to add the markers
 */
function newMarkers(newMarkers, index) {
}

/**
 * Set Google Maps options. See here: <a href="https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions">https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions</a>
 * the list of available options.
 * @param {Object} options The configuration options for customizing the map.
 */
function setOptions(options) {
}

/**
 * Refresh google maps
 * @example %%prefix%%%%elementName%%.refresh();
 * @return {Boolean} True if the map was successfully refreshed; otherwise, false.
 */
function refresh() {
}

/**
 * Center google maps at the given address
 * 
 * @param {String} address The address to center the map on.
 * @example %%prefix%%%%elementName%%.centerAtAddress(address);
 * @return {Boolean} True if the map was successfully centered; otherwise, false.
 */
function centerAtAddress(address) {
}

 /**
 * Center google maps at LatLng
 * @example %%prefix%%%%elementName%%.centerAtLatLng(lat, lng);
 * @param {Number} lat The latitude coordinate.
 * @param {Number} lng The longitude coordinate.
 * @return {Boolean} True if the map was successfully centered; otherwise, false.
 */
function centerAtLatLng(lat, lng) {
}

/**
 * Returns the lat/lng bounds of the current viewport. If more than one copy of the world is visible, the<br>
 * bounds range in longitude from -180 to 180 degrees inclusive. If the map is not yet initialized (i.e.<br>
 * the mapType is still null), or center and zoom have not been set then the result is <code>null</code> or <code>undefined</code>.
 * @return {CustomType<googlemaps-svy-G-Maps.latLngBounds>} The latitude/longitude boundaries of the current viewport.
 */
function getBounds() {
} 

/**
 * Returns the position displayed at the center of the map
 * @return {CustomType<googlemaps-svy-G-Maps.latLng>} The latitude/longitude position at the center of the map.
 */
function getCenter() {
}  

/**
 * Sets the viewport to contain the given bounds.
 * 
 * @param {Object} latLngBounds The bounds to fit within the viewport.
 */
function fitBounds(bounds) {
}            
