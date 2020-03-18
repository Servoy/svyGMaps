/**
 * Remove all google markers
 * @example %%prefix%%%%elementName%%.removeAllMarkers();
 * @returns {Boolean}
 */
$scope.api.removeAllMarkers = function() {
    if($scope.model.markers && $scope.model.markers.length > 0) {
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
    if(index != null && $scope.model.markers[index]) {
        $scope.model.markers.splice(index, 1);
        return true;
    }
    return false;
}

/**
 * Add a new google marker to the map
 * @example %%prefix%%%%elementName%%.newMarkers([{addressString: 'Fred. Roeskestraat 97, Amsterdam, NL'}]);
 * @param {Array<googlemaps-svy-G-Maps.googleMarkers>} newMarkers
 * @param {Number} [index] optional starting point where to add the markers
 */
$scope.api.newMarkers = function(newMarkers, index) {
    if(newMarkers) {
        if($scope.model.markers.length > 0) {
            if(index != null) {
                $scope.model.markers.splice(index, 0, markers);
            } else {
                $scope.model.markers.concat(newMarkers);
            }
        } else {
            $scope.model.markers = newMarkers;
        }
        return true;
    }
    return false;
}