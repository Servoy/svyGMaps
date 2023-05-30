/**
 * Remove all google markers
 * @example %%prefix%%%%elementName%%.removeAllMarkers();
 * @returns {Boolean}
 */
function removeAllMarkers() {
}

/**
 * Remove google marker at given index
 * @example %%prefix%%%%elementName%%.removeMarker(index);
 * @param {Number} index
 * @returns {Boolean}
 */
function removeMarker(index) {
}

/**
 * Creates a new, empty marker with the given marker ID and position
 * @param {Object} markerId
 * @param {String|googlemaps-svy-G-Maps.latLng} addressOrLatLng
 * @param {String} [title]
 * @return {googlemaps-svy-G-Maps.marker}
 */
function createMarker(markerId, addressOrLatLng, title) {
}

/**
 * Returns the marker with the given index
 * @param {Number} index
 * @return {googlemaps-svy-G-Maps.marker}
 */
function getMarker(index) {
}

/**
 * Returns the marker with the given markerId
 * @param {Object} markerId
 * @return {googlemaps-svy-G-Maps.marker}
 */
function getMarkerById(markerId) {
}

/**
 * Returns all markers
 * @return {Array<googlemaps-svy-G-Maps.marker>}
 */
function getMarkers() {
}

/**
 * Adds the given marker
 * @param {googlemaps-svy-G-Maps.marker} marker
 * @param {Number} [index] optional starting point where to add the marker (useful to add waypoints in routes in a specific order)
 */
function addMarker(marker, index) {
}

/**
 * Adds the given markers
 * @param {Array<googlemaps-svy-G-Maps.marker>} markers
 * @param {Number} [index] optional starting point where to add the markers (useful to add waypoints in routes in a specific order)
 */
function addMarkers(markers, index) {
}

/**
 * Add a new google marker to the map
 * @example %%prefix%%%%elementName%%.newMarkers([{addressString: 'Fred. Roeskestraat 97, Amsterdam, NL'}]);
 * @deprecated please use <code>addMarkers(markers, index)</code> instead
 * @param {Array<googlemaps-svy-G-Maps.marker>} newMarkers
 * @param {Number} [index] optional starting point where to add the markers
 */
function newMarkers(newMarkers, index) {
}

/**
 * Set Google Maps options. See here: https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions
 * the list of available options.
 * @param {Object} options
 */
function setOptions(options) {
}

/**
 * Refresh google maps
 * @example %%prefix%%%%elementName%%.refresh();
 * @returns {Boolean}
 */
function refresh() {
}

/**
 * Center google maps at the given address
 * @example %%prefix%%%%elementName%%.centerAtAddress(address);
 * @returns {Boolean}
 */
function centerAtAddress(address) {
}

 /**
 * Center google maps at LatLng
 * @example %%prefix%%%%elementName%%.centerAtLatLng(lat, lng);
 * @returns {Boolean}
 */
function centerAtLatLng(lat, lng) {
}

/**
 * Returns the lat/lng bounds of the current viewport. If more than one copy of the world is visible, the<br>
 * bounds range in longitude from -180 to 180 degrees inclusive. If the map is not yet initialized (i.e.<br>
 * the mapType is still null), or center and zoom have not been set then the result is <code>null</code> or <code>undefined</code>.
 * @return {CustomType<googlemaps-svy-G-Maps.latLngBounds>}
 */
function getBounds() {
} 

/**
 * Returns the position displayed at the center of the map
 * @return {CustomType<googlemaps-svy-G-Maps.latLng>}
 */
function getCenter() {
}  

/**
 * Sets the viewport to contain the given bounds.
 * @return {CustomType<googlemaps-svy-G-Maps.latLngBounds>}
 */
function fitBounds(bounds) {
}            
