/**
 * Remove all google markers
 * @example %%prefix%%%%elementName%%.removeAllMarkers();
 * @returns {Boolean}
 */
$scope.api.removeAllMarkers = function() {
	if ($scope.model.markers && $scope.model.markers.length > 0) {
		$scope.model.markers.length = 0;
	}
	return true;
}

/**
 * Remove google marker at given index
 * @example %%prefix%%%%elementName%%.removeMarker(index);
 * @param {Number} index
 * @returns {Boolean}
 */
$scope.api.removeMarker = function(index) {
	if (index != null && $scope.model.markers[index]) {
		$scope.model.markers.splice(index, 1);
		return true;
	}
	return false;
}

/**
 * Creates a new, empty marker with the given marker ID and position
 * @param {Object} markerId
 * @param {String|googlemaps-svy-G-Maps.latLng} addressOrLatLng
 * @param {String} [title]
 * @return {googlemaps-svy-G-Maps.marker}
 */
$scope.api.createMarker = function(markerId, addressOrLatLng, title) {
	var result = {
		markerId: markerId || java.util.UUID.randomUUID().toString()
	};
	if (addressOrLatLng instanceof String) {
		result.addressString = addressOrLatLng;
	} else if (addressOrLatLng && addressOrLatLng.hasOwnProperty('lat') && addressOrLatLng.hasOwnProperty('lng')) {
		result.position = addressOrLatLng;
	}
	if (title) {
		result.title = title;
	}
	return result;
}

/**
 * Returns the marker with the given index
 * @param {Number} index
 * @return {googlemaps-svy-G-Maps.marker}
 */
$scope.api.getMarker = function(index) {
	if (index >= 0 && $scope.model.markers[index]) {
		return $scope.model.markers[index];
	}
	return null;
}

/**
 * Returns the marker with the given markerId
 * @param {Object} markerId
 * @return {googlemaps-svy-G-Maps.marker}
 */
$scope.api.getMarkerById = function(markerId) {
	if (markerId) {
		for (var i = 0; i < $scope.model.markers.length; i++) {
			if ($scope.model.markers[i].markerId == markerId) {
				return $scope.model.markers[i];
			}
		}
	}
	return null;
}

/**
 * Returns all markers
 * @return {Array<googlemaps-svy-G-Maps.marker>}
 */
$scope.api.getMarkers = function() {
	return $scope.model.markers;
}

/**
 * Adds the given marker
 * @param {googlemaps-svy-G-Maps.marker} marker
 * @param {Number} [index] optional starting point where to add the marker (useful to add waypoints in routes in a specific order)
 */
$scope.api.addMarker = function(marker, index) {
	if (!marker.markerId) {
		marker.markerId = java.util.UUID.randomUUID().toString()
	}
	if ($scope.model.markers.length > 0) {
		if (index != null) {
			$scope.model.markers = [].concat($scope.model.markers, markers, $scope.model.markers.splice(index));
		} else {
			$scope.model.markers.splice(index, 0, marker);
		}
	} else {
		$scope.model.markers = [marker]
	}
}

/**
 * Adds the given markers
 * @param {Array<googlemaps-svy-G-Maps.marker>} markers
 * @param {Number} [index] optional starting point where to add the markers (useful to add waypoints in routes in a specific order)
 */
$scope.api.addMarkers = function(markers, index) {
	if (markers && markers.length > 0) {
		for (var m = 0; m < markers.length; m++) {
			if (!markers[m].markerId) {
				markers[m].markerId = java.util.UUID.randomUUID().toString()
			}
		}
		if ($scope.model.markers.length > 0) {
			if (index != null) {
				$scope.model.markers = [].concat($scope.model.markers, markers, $scope.model.markers.splice(index));
			} else {
				$scope.model.markers = $scope.model.markers.concat(markers);
			}
		} else {
			$scope.model.markers = markers;
		}
		return true;
	}
	return false;
}

/**
 * Add a new google marker to the map
 * @example %%prefix%%%%elementName%%.newMarkers([{addressString: 'Fred. Roeskestraat 97, Amsterdam, NL'}]);
 * @deprecated please use <code>addMarkers(markers, index)</code> instead
 * @param {Array<googlemaps-svy-G-Maps.marker>} newMarkers
 * @param {Number} [index] optional starting point where to add the markers
 */
$scope.api.newMarkers = function(newMarkers, index) {
	return $scope.api.addMarkers(newMarkers, index);
}