/**
 * A Servoy Extra Component that wraps Google Maps functionality.
 */

/**
 * Array of marker objects displayed on the map.
 */
var markers;

/**
 * API key for accessing Google Maps services.
 */
var apiKey;


/**
 * A map ID is a unique identifier that represents Google Map styling and configuration settings that are stored in Google Cloud
 */
var mapID;

/**
 * Data provider for setting the initial zoom level of the map.
 */
var zoomLevel;

/**
 * Flag indicating whether the map type control is displayed.
 */
var mapTypeControl;

/**
 * Flag indicating whether the zoom control is displayed.
 */
var zoomControl;

/**
 * Flag indicating whether the street view control is displayed.
 */
var streetViewControl;

/**
 * Flag indicating whether the fullscreen control is displayed.
 */
var fullscreenControl;

/**
 * The map type to display. Possible values include "ROADMAP", "SATELLITE", "HYBRID", and "TERRAIN".
 */
var mapType;

/**
 * Flag indicating whether Google Map clustering is enabled.
 */
var useGoogleMapCluster;

/**
 * Flag indicating whether Google Map directions are enabled.
 */
var useGoogleMapDirections;

/**
 * CSS style classes applied to the Google Maps component.
 */
var styleClass;

/**
 * Specifies how gesture handling is configured for the map.
 */
var gestureHandling;

/**
 * Configuration settings for directions functionality.
 */
var directionsSettings;

/**
 * URL of a KML Layer to overlay on the map.
 */
var KmlLayerURL;

/**
 * Configuration for map events.
 */
var mapEvents;

/**
 * Configuration for marker events.
 */
var markerEvents;

/**
 * Flag indicating whether the Google Maps component is visible.
 */
var visible;

/**
 * GMaps height to be set in a responsive form. When responsiveHeight is set to 0, the component will use 100% height of the parent container
 */
var responsiveHeight;


var handlers = {
    /**
     * Called when the route on the map changes.
     *
     * @param {CustomType<googlemaps-svy-G-Maps.routeResult>} routeDetails The route result details.
     */
    onRouteChanged: function() {},

    /**
     * Called when a marker event occurs.
     *
     * @param {JSEvent} event The event object associated with the marker event.
     * @param {Number} markerIndex The index of the marker for which the event occurred.
     * @param {CustomType<googlemaps-svy-G-Maps.latLng>} [latLng] The latitude/longitude coordinates associated with the event (optional).
     */
    onMarkerEvent: function() {},

    /**
     * Called when a map event occurs.
     *
     * @param {JSEvent} event The event object associated with the map event.
     * @param {CustomType<googlemaps-svy-G-Maps.latLng>} [latLng] The latitude/longitude coordinates associated with the event (optional).
     */
    onMapEvent: function() {},

    /**
     * Called when a marker is geocoded.
     *
     * @param {CustomType<googlemaps-svy-G-Maps.marker>} marker The marker that was geocoded.
     * @param {CustomType<googlemaps-svy-G-Maps.latLng>} latLng The latitude/longitude coordinates of the geocoded marker.
     */
    onMarkerGeocoded: function() {}
};

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


var svy_types = {

    /**
     * Represents a marker on the Google Map.
     */
    marker: {
        /**
         * Data provider for the marker's address.
         */
        addressDataprovider: null,
        /**
         * The address string of the marker.
         */
        addressString: null,
        /**
         * Cursor style when hovering over the marker.
         */
        cursor: null,
        /**
         * Latitude of the marker (deprecated; use position instead).
         */
        latitude: null,
        /**
         * Longitude of the marker (deprecated; use position instead).
         */
        longitude: null,
        /**
         * The position of the marker as a latLng object.
         */
        position: null,
        /**
         * Label text for the marker's icon.
         */
        iconLabel: null,
        /**
         * Tooltip text for the marker (deprecated; use title instead).
         */
        tooltip: null,
        /**
         * Title of the marker.
         */
        title: null,
        /**
         * URL for the marker's icon image.
         */
        iconUrl: null,
        /**
         * Media object for the marker's icon.
         */
        iconMedia: null,
        /**
         * HTML content for the marker's info window.
         */
        infoWindowString: null,
        /**
         * Flag indicating whether to draw a radius around the marker.
         */
        drawRadius: null,
        /**
         * The radius in meters for drawing around the marker.
         */
        radiusMeters: null,
        /**
         * The color of the radius drawn around the marker.
         */
        radiusColor: null,
        /**
         * Flag indicating whether the marker is draggable.
         */
        draggable: null,
        /**
         * The animation applied to the marker (e.g. BOUNCE or DROP).
         */
        animation: null,
        /**
         * Flag indicating whether the marker is clickable.
         */
        clickable: null,
        /**
         * Flag indicating whether a cross is shown while dragging.
         */
        crossOnDrag: null,
        /**
         * The opacity of the marker.
         */
        opacity: null,
        /**
         * Flag indicating whether the marker is visible.
         */
        visible: null,
        /**
         * The z-index of the marker.
         */
        zIndex: null,
        /**
         * Unique identifier for the marker.
         */
        markerId: null,
        /**
         * User-defined object associated with the marker.
         */
        userObject: null,
    },

    /**
     * Represents settings for routing and directions on the map.
     */
    routeSettings: {
        /**
         * Flag indicating whether route optimization is enabled.
         */
        optimize: null,
        /**
         * The travel mode for the route (e.g. driving, walking, bicycling, transit).
         */
        travelMode: null,
        /**
         * Flag indicating whether to avoid ferries in route calculations.
         */
        avoidFerries: null,
        /**
         * Flag indicating whether to avoid highways in route calculations.
         */
        avoidHighways: null,
        /**
         * Flag indicating whether to avoid tolls in route calculations.
         */
        avoidTolls: null,
    },

    /**
     * Represents a latitude/longitude coordinate.
     */
    latLng: {
        /**
         * The latitude value.
         */
        lat: null,
        /**
         * The longitude value.
         */
        lng: null,
    },

    /**
     * Represents the bounds of the map as a rectangle defined by southwest and northeast coordinates.
     */
    latLngBounds: {
        /**
         * The southwest coordinate.
         */
        sw: null,
        /**
         * The northeast coordinate.
         */
        ne: null,
    },

    /**
     * Represents the result of a route calculation.
     */
    routeResult: {
        /**
         * An array of legs representing segments of the route.
         */
        legs: null,
        /**
         * The total distance of the route.
         */
        total_distance: null,
        /**
         * The total duration of the route.
         */
        total_duration: null,
    },

    /**
     * Represents a segment (leg) of a route.
     */
    leg: {
        /**
         * The starting address of the leg.
         */
        start_address: null,
        /**
         * The markerId of the starting marker.
         */
        start_markerId: null,
        /**
         * The ending address of the leg.
         */
        end_address: null,
        /**
         * The markerId of the ending marker.
         */
        end_markerId: null,
        /**
         * The distance of the leg as a formatted string.
         */
        distance: null,
        /**
         * The distance of the leg in meters.
         */
        distance_meters: null,
        /**
         * The duration of the leg as a formatted string.
         */
        duration: null,
        /**
         * The duration of the leg in seconds.
         */
        duration_seconds: null,
    }
}
