angular.module('googlemapsSvyGMaps', ['servoy', 'ngMap']).directive('googlemapsSvyGMaps', ['NgMap', '$log', '$q', '$window', function(NgMap, $log, $q, $window) {
		return {
			restrict: 'E',
			scope: {
				model: '=svyModel',
				api: "=svyApi",
				handlers: "=svyHandlers",
				svyServoyapi: "="
			},
			link: function($scope, $element, $attrs) {
				
				//init scope vars
				
				//ID of this map
				$scope.mapId = 'map-' + $scope.model.svyMarkupId;
				//used by events fired
				$scope.elementName = null;
				
				//initialize the map
				if (!$scope.map) {
					NgMap.getMap($scope.mapId).then(
						function(ngmap) {
							$scope.map = ngmap;
							if ($log.debugEnabled) $log.debug('svy gmaps * map initialized');
							if ($scope.model.address) {
								if ($scope.model.destinationAddress) {
									$scope.model.route = {
										origin: $scope.model.address,
										destination: $scope.model.destinationAddress
									}
								} else {
									$scope.api.addMarker({ address: $scope.model.address });
								}
							}
						},
						function(error) {
							if ($log.debugEnabled) $log.debug('svy gmaps * ' + error);
							if (!$scope.model.apiKey) {
								$element.find('.gm-err-title').html('No API key?');
								$element.find('.gm-err-message').html('You have not assigned an API key to the map.');
							}
						});
				}
				
				// API

				/**
				 * Adds the given marker and shows it on the map
				 * 
				 * When the marker contains no lat/lng but only an address property
				 * the component will try to geocode the given address
				 * 
				 * @param {googlemaps-svy-G-Maps.Marker} marker with either an address or lat/lng properties
				 */
				$scope.api.addMarker = function(marker) {
					if ($scope.model.markers == null) {
						$scope.model.markers = [];
					}
					
					if (marker.id && !(marker.id instanceof String)) {
						marker.id = marker.id + '';
					}
					
					if (!marker.address && !(marker.lat && marker.lng)) {
						$log.warn('svyGmaps gmaps: Marker without address or lat/lng provided');
					} else if (!(marker.lat && marker.lng)) {
						$scope.geoCodeAndAddMarker(marker);
					} else {
						$scope.addMarker(marker);
					}
				}
				
				/**
				 * Removes the marker with the given index (int) or id (string)
				 * 
				 * @param {String|Number} markerIndexOrId
				 */
				$scope.api.removeMarker = function(markerIndexOrId) {
					if (markerIndexOrId instanceof Number) {
						$scope.model.markers.splice(markerIndexOrId, 1);
					} else {
						for (var i = 0; i < $scope.model.markers.length; i++) {
							if ($scope.model.markers[i].id == markerIndexOrId) {
								$scope.model.markers.splice(i, 1);
								break;
							}
						}
					}
				}
				
				$scope.api.removeMarkers = function(keepAddress) {
					if (keepAddress && $scope.model.address) {
						$scope.model.markers.splice(1, $scope.model.markers.length - 1);
					} else {
						$scope.model.markers = [];						
					}
				}
				
				/**
				 * Geocodes the given address and returns a google GeocoderResult object
				 * @see https://developers.google.com/maps/documentation/javascript/3.exp/reference#GeocoderResult
				 * 
				 * @param {String} address Address to geocode - can be left null when the options parameter has one of these properties: address, location or placeId
				 * @param {Function} successCallback method to call when geocoding was successful
				 * @param {Function} errorCallback method to call when geocoding failed
				 * @param {Object} options optional options, see https://developers.google.com/maps/documentation/javascript/3.exp/reference#GeocoderRequest
				 * 
				 * @return {Object} GeocoderResult
				 */
				$scope.api.geocodeAddress = function(address, successCallback, errorCallback, options) {
					var promise = $scope.geocodeAddress(address, options);
					promise.then(
						function(geocodeResult) {
							$window.executeInlineScript(successCallback.formname, successCallback.script, [geocodeResult]);
						}, function(reason) {
							$window.executeInlineScript(errorCallback.formname, errorCallback.script, [reason]);
						});
				}	

				/**
				 * Sets the viewport to contain all markers or the given bounds
				 * 
				 * @param {googlemaps-svy-G-Maps.LatLng} [bounds] bounds to fit
				 */
				$scope.api.fitBounds = function(bounds) {
					$scope.fitBounds(bounds, true);
				}
				
				//data binding
				
				$scope.zoomChanged = function() {
					if ($scope.map && $scope.model.zoom != $scope.map.getZoom()) {
						$scope.model.zoom = $scope.map.getZoom()
						$scope.svyServoyapi.apply('zoom');
						if ($log.debugEnabled) if ($log.debugEnabled) $log.debug('svy gmaps * Zoom level changed to ' + $scope.model.zoom);
					}
				}				
				
				//handlers
				
				$scope.onDragEnd = function() {
					var marker = $scope.model.markers[this.markerIndex];
					var jsEvent = createJSEvent('onDragEnd');
					
					var latLng = {};
					latLng.lat = this.getPosition().lat();
					latLng.lng = this.getPosition().lng();
					
					jsEvent.data = latLng;
					
					if ($log.debugEnabled) $log.debug('svy gmaps * marker ' + this.markerId + ' dragged to ' + latLng.lat + ',' + latLng.lng);
					$scope.handlers.onMarkerDragged(jsEvent, marker, latLng);
				}
				
				$scope.onMarkerClicked = function() {
					var marker = $scope.model.markers[this.markerIndex];
					var jsEvent = createJSEvent('onAction');
					
					if ($log.debugEnabled) $log.debug('svy gmaps * marker ' + this.markerId + ' clicked');
					$scope.handlers.onMarkerClicked(jsEvent, marker);
				}
				
				$scope.onMapClicked = function(mouseEvent) {
					var jsEvent = createJSEvent('onMapClicked');
					if ($log.debugEnabled) $log.debug('svy gmaps * map clicked on at ' + mouseEvent.latLng.lat() + ',' + mouseEvent.latLng.lng());
					$scope.handlers.onMapClicked(jsEvent, { lat: mouseEvent.latLng.lat(), lng: mouseEvent.latLng.lng() });
				}
				
				//local
				
				/**
				 * Adds the given marker and centers the map to that
				 */
				$scope.addMarker = function(marker) {
					if ($scope.model.route) {
						//clear route
						$scope.model.route = null;
					}
					$scope.model.markers.push(marker);
					$scope.svyServoyapi.apply('markers');
					if ($scope.model.autoFitBounds != false) {
						$scope.fitBounds(null, false);
					} else {
						$scope.model.latitude = marker.lat;
						$scope.model.longitude = marker.lng;
					}
					if ($log.debugEnabled) $log.debug('svy gmaps * Marker added at ' + marker.lat + ',' + marker.lng);
				}
				
				/**
				 * fits the bounds to the given bounds or calculates the bounds from the current markes if no bounds given
				 * 
				 * @param latLngBounds 
				 * @param {Boolean} ignoreAutoBounds if not true the map will zoom to model.maxAutoFitBoundsZoom if the zoom after fitting is smaller than that
				 */
				$scope.fitBounds = function(bounds, ignoreAutoBounds) {
					if (!bounds) {
						bounds = new google.maps.LatLngBounds();
						for (var i = 0; i < $scope.model.markers.length; i++) {
							if ($scope.model.markers[i].lat != null && $scope.model.markers[i].lng != null) {
								bounds.extend(new google.maps.LatLng($scope.model.markers[i].lat, $scope.model.markers[i].lng));
							}
						}
					}
					if (ignoreAutoBounds !== true && $scope.model.maxAutoFitBoundsZoom) {
						$scope.map.fitBounds(bounds);
						if ($scope.map.getZoom() > $scope.model.maxAutoFitBoundsZoom) {
							$scope.map.setZoom($scope.model.maxAutoFitBoundsZoom);
							$scope.model.zoom = $scope.model.maxAutoFitBoundsZoom;
						}
					} else {
						$scope.map.fitBounds(bounds);
					}
				}			

				$scope.geoCodeAndAddMarker = function(marker) {
					NgMap.getGeoLocation(marker.address).then(
						function(latlng) {
							marker.lat = latlng.lat();
							marker.lng = latlng.lng();
							if ($log.debugEnabled) $log.debug('svy gmaps * Found geolocation for "' + marker.address + '" as ' + marker.lat + ',' + marker.lng);
							$scope.addMarker(marker);
						}, function(error) {
							marker.lat = 0;
							marker.lng = 0;
							marker.iconUrl = '/googlemaps/svyGMaps/images/unknown_48.png'
								//https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png
							$scope.addMarker(marker);
							$log.warn('svy gmaps * geocoding error: ' + error);
						}
					);
				}
				
				$scope.geocodeAddress = function(address, options) {
					var deferred = $q.defer();
					var geocoder = new google.maps.Geocoder();
					
					if (!options) options = {address: address};
					if (!options.address) {
						options.address = address;
					}
				    geocoder.geocode(options, function (results, status) {
				      if (status == google.maps.GeocoderStatus.OK) {
				        deferred.resolve(results);
				      } else {
				        deferred.reject(status);
				      }
				    });
				    return deferred.promise;
				}				

				//Watches
				$scope.$watch('model.address', function(newValue, oldValue) {
						if (newValue != oldValue || ($scope.map && !$scope.model.markers) || ($scope.map && $scope.model.destinationAddress && !$scope.model.route)) {
							//address changed or no markers yet; clear all markers
							$scope.model.markers = [];
							
							//route or markers?
							if ($scope.model.destinationAddress) {
								//TODO: probably need to use google to get directions because an old route will not be cleared when no route could be calculated
								//https://github.com/allenhwkim/angularjs-google-maps/issues/739
								if (!$scope.model.route) {
									$scope.model.route = {
										origin: newValue,
										destination: $scope.model.destinationAddress
									}
								} else {
									$scope.model.route.origin = newValue;
								}
								if ($log.debugEnabled) $log.debug('svy gmaps * New address found: creating route to destination')
							} else {
								if ($scope.model.route) {
									//there was a route before
									$scope.model.route = null;
								}
								$scope.api.addMarker({ address: newValue });
								if ($log.debugEnabled) $log.debug('svy gmaps * New address found: cleared all markers')
							}
						}
					});
				
				$scope.$watch('model.destinationAddress', function(newValue, oldValue) {
					if (newValue != oldValue || ($scope.map && !$scope.model.route)) {
						//destination address changed or no route yet

						//either destination is now set or removed
						//in both cases we need to clear markers
						$scope.model.markers = [];
						if (newValue) {
							//create route
							if ($scope.model.destinationAddress) {
								if (!$scope.model.route) {
									$scope.model.route = {
										origin: $scope.model.address,
										destination: $scope.model.destinationAddress
									}
								} else {
									$scope.model.route.destination = $scope.model.destinationAddress;
								}
								if ($log.debugEnabled) $log.debug('svy gmaps * Destination address now set, creating route')
							}
						} else {
							//destination cleared, remove route and create markers
							$scope.model.route = null;
							$scope.api.addMarker({ address: $scope.model.address });
							if ($log.debugEnabled) $log.debug('svy gmaps * Destination address cleared, removing route and adding markers instead')
						}
					}
				});
				
				/**
				 * Create a JSEvent with the given type
				 */
				function createJSEvent(type) {
					if (!$scope.elementName) {
						var form;
						var parent = $element[0];
						var targetElNameChain = new Array();
						while (parent) {
							form = parent.getAttribute("ng-controller");
							if (form) {
								break;
							}
							if (parent.getAttribute("name")) targetElNameChain.push(parent.getAttribute("name"));
							parent = parent.parentNode;
						}
						var formScope = angular.element(parent).scope();
						for (var i = 0; i < targetElNameChain.length; i++) {
							if (formScope.model[targetElNameChain[i]]) {
								$scope.elementName = targetElNameChain[i];
								break;
							}
						}
					}

					//create JSEvent
					var jsEvent = { svyType: 'JSEvent' };
					
					jsEvent.elementName = $scope.elementName;
					jsEvent.type = type;

					//get modifiers
					var modifiers = (event.altKey ? 8 : 0) | (event.shiftKey ? 1 : 0) | (event.ctrlKey ? 2 : 0) | (event.metaKey ? 4 : 0);
					jsEvent.modifiers = modifiers;

					jsEvent.data = null;
					return jsEvent;
				}


			},
			controller: function($scope, $element, $attrs) { },
			templateUrl: 'googlemaps/svyGMaps/svyGMaps.html'
		};
	}]);
