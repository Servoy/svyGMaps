angular.module('googlemapsSvyGMaps', ['servoy']).directive('googlemapsSvyGMaps', function($log, $utils) {
    return {
        restrict: 'E',
        scope: {
            model: "=svyModel",
            api: "=svyApi",
            svyServoyapi: "=",
            handlers: "=svyHandlers"
        },
        link: function($scope, $element, $attrs) {
            var map;
            var mapMarkers;
            var directionsDisplay;
            var markersGeocoded = false;

			$scope.createMap = function() {
				if (!$scope.googleMapsLoaded == true) {
					//TODO return error
					return;
				}
				//clear markers from map
				if (mapMarkers) {
					for ( var m in mapMarkers ) {
						mapMarkers[m].setMap(null);
					}
				}
				mapMarkers = {};

				var location = [];
				for (var i in $scope.model.markers) {
					var googleMarker = $scope.model.markers[i];
					if (googleMarker.position != null) {
						location.push(new google.maps.LatLng(googleMarker.position.lat, googleMarker.position.lng));
					} else if (googleMarker.latitude != null && googleMarker.longitude != null) {
						//to support deprecated latitude/longitude properties
						location.push(new google.maps.LatLng(googleMarker.latitude, googleMarker.longitude));
					} else if (googleMarker.addressDataprovider || googleMarker.addressString) {
						location.push($scope.getLatLng(googleMarker.addressDataprovider || googleMarker.addressString));
					}
				}
				Promise.all(location).then(function(returnVals) {
					for (var i in returnVals) {
						location[i] = returnVals[i]
					}
				}).then(function() {
					createMapAtPoint(location)
				})
			}

            $scope.getLatLng = function(address) {
                return new Promise(function(resolve, reject) {
                    $scope.geocoder.geocode({
                        address: address
                    }, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            resolve(results[0].geometry.location);
                        } else if(status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT){
                        	console.warn('Google maps Geocoder query limit reached, geocoding pauses for 2 seconds');
                        	sleep(2000);
                        	resolve($scope.getLatLng(address));
                        } else {
                        	$log.error('Could not geocode location ' + address);
                        	resolve(null);
                        }
                    });
                })
            }

            function calculateAndDisplayRoute(directionsService, directionsDisplay, location) {
                /** @type {{optimize: boolean, travelMode: String, showAlternativesRoute: boolean}} */
                var routeSettings = $scope.model.directionsSettings;
                //When not set go for defaults
                if(!routeSettings) {
                    routeSettings = {
                        "optimize": true,
                        "travelMode": "driving",
                        "avoidFerries": false,
                        "avoidHighways": false,
                        "avoidTolls": false
                    }
                }

                var waypts = [];
				for (var i = 1; i < (location.length - 1); i++) {
					waypts.push({
						location: new google.maps.LatLng(location[i].lat(), location[i].lng()),
						stopover: true
					});
				}

				directionsService.route({
						origin: new google.maps.LatLng(location[0].lat(), location[0].lng()),
						destination: new google.maps.LatLng(location[location.length - 1].lat(), location[location.length - 1].lng()),
						waypoints: waypts,
						travelMode: routeSettings.travelMode.toUpperCase(),
						optimizeWaypoints: routeSettings.optimize,
						avoidFerries: routeSettings.avoidFerries,
						avoidHighways: routeSettings.avoidHighways,
						avoidTolls: routeSettings.avoidTolls
					}, function(response, status) {
						if (status === 'OK') {
							directionsDisplay.setDirections(response);
							var calculatedRoute = { };
							calculatedRoute.legs = [];

							var totalMeters = 0;
							var totalSeconds = 0;
							
							for (var l = 0; l < response.routes[0].legs.length; l++) {
								var routeLeg = response.routes[0].legs[l];
								var startMarkerIndex;
								if (l == 0) {
									//first leg starts at start marker
									startMarkerIndex = 0;
								} else {
									//subsequent legs start at marker (waypoint + 1)
									startMarkerIndex = response.routes[0].waypoint_order[l-1] + 1;
								}
								var endMarkerIndex;
								if (l == (response.routes[0].legs.length - 1)) {
									//last leg ends at end marker
									endMarkerIndex = $scope.model.markers.length - 1;
								} else {
									//prior markers end at marker (waypoint + 1)
									endMarkerIndex = response.routes[0].waypoint_order[l] + 1;
								}
								var leg = {
									start_address: routeLeg.start_address,
									start_markerId: $scope.model.markers[startMarkerIndex].markerId,
									end_address: routeLeg.end_address,
									end_markerId: $scope.model.markers[endMarkerIndex].markerId,
									distance: routeLeg.distance.text,
									distance_meters: routeLeg.distance.value,
									duration: routeLeg.duration.text,
									duration_seconds: routeLeg.duration.value,
								}
								totalMeters += leg.distance_meters;
								totalSeconds += leg.duration_seconds;
								calculatedRoute.legs.push(leg);
							}

							calculatedRoute.total_distance = totalMeters;
							calculatedRoute.total_duration = totalSeconds;

							if ($scope.handlers.onRouteChanged) {
								$scope.handlers.onRouteChanged(calculatedRoute);
							}

						} else {
//							window.alert('Directions request failed due to ' + status);
							console.warn('Directions request failed due to ' + status);
						}
					});
            }
            
            function createMarker(location, markerIndex) {
            	if (!location) {
            		return null;
            	}
            	
            	var marker = $scope.model.markers[markerIndex];
            	
            	var markerObj = {
                    position: new google.maps.LatLng(location.lat(), location.lng()),
                    map: map,
                    title: marker.title || marker.tooltip, //TODO remove tooltip (deprecated)
					draggable: marker.draggable,
					animation: marker.animation ? google.maps.Animation[marker.animation.toUpperCase()] : null,
					clickable: marker.clickable,
					crossOnDrag: marker.crossOnDrag,
					opacity: marker.opacity != null ? marker.opacity : null,
					visible: marker.visible,
					zIndex: marker.zIndex != null ? marker.zIndex : null,
					markerId: marker.markerId || ('marker-' + markerIndex),
					markerIndex: markerIndex,
					icon: marker.iconUrl || marker.iconMedia,
					label: marker.iconLabel,
					cursor: marker.cursor
                }

                var gMarker = new google.maps.Marker(markerObj)
                mapMarkers[marker.markerId || ('marker-' + markerIndex)] = gMarker;
				
                if (marker.infoWindowString) {
                	var infowindow = new google.maps.InfoWindow({
                        content: marker.infoWindowString
                      });
                	gMarker.addListener('click', function() {
                        infowindow.open(map, gMarker);
                    });
                }
                
                //marker listener closure
                function attachMarkerListener(markerObj, eventType) {
                	gMarker.addListener(eventType, function(evt) {
                		var jsEvent = createJSEvent(evt, eventType);
            			jsEvent.data.marker = markerObj;
            			var index = -1;
            			for (var i = 0; i < $scope.model.markers.length; i++) {
            				if ($scope.model.markers[i].markerId == this.markerId) {
            					index = i;
            					break;
            				}
            			}
                        $scope.handlers.onMarkerEvent(jsEvent, index, jsEvent.data && jsEvent.data.latLng ? jsEvent.data.latLng : null);
                    });
                }
                
                if ($scope.handlers.onMarkerEvent && $scope.model.markerEvents) {
                	for (var e = 0; e < $scope.model.markerEvents.length; e++) {
						attachMarkerListener(marker, $scope.model.markerEvents[e]);
                	}
                }

                if(marker.drawRadius == true) {
                    var circle = new google.maps.Circle({
                        map: map,
                        radius: marker.radiusMeters || 2000,
                        fillColor: marker.radiusColor || "#AA0000",
                        strokeColor: marker.radiusColor || "#AA0000"
                      });
                      circle.bindTo('center', gMarker, 'position');
                }
                return gMarker
            }
            
            function createLatLngObj(latLng) {
            	var result = null;
            	if (latLng) {
            		result = {
            			lat: latLng.lat(),
        				lng: latLng.lng()
            		}
            	}
            	return result;
            }
            
            function createJSEvent(evt, eventType) {
            	var mouseEvent = null;
            	for ( var p in evt ) {
            		if (evt[p] instanceof MouseEvent) {
            			mouseEvent = evt[p];
            			break;
            		}
            	}
        		if (!mouseEvent || !mouseEvent.target) {
        			//create fake event
        			var me = {};
        			me.target = $element[0];
        			if (mouseEvent) {
	        			me.altKey = mouseEvent.altKey;
        				me.shiftKey = mouseEvent.shiftKey;
        				me.ctrlKey = mouseEvent.ctrlKey;
        				me.metaKey = mouseEvent.metaKey;
        				me.pageX = mouseEvent.pageX;
        				me.pageY = mouseEvent.pageY;
        			}
        			mouseEvent = me;
        		}
        		
    			var jsEvent = $utils.createJSEvent(mouseEvent, eventType);
    			if (evt && evt.latLng) {
	    			jsEvent.data = {
	    				latLng: createLatLngObj(evt.latLng)
	    			}
    			}
    			
    			if (jsEvent.x === undefined) {
    				jsEvent.x = -1;
    			}
    			if (jsEvent.y === undefined) {
    				jsEvent.y = -1;
    			}
    			
            	return jsEvent;
            }           

            function createMapAtPoint(location) {
                if ($($element).length == 0) {
                    return;
                }
                
                location = location.filter(function removeEmpty(loc) {
                	return loc != null;
                })

                var mapOptions = {
                    center: (location.length == 1 ? new google.maps.LatLng(location[0].lat(), location[0].lng()) : new google.maps.LatLng(0, 0)),
                    zoom: $scope.model.zoomLevel === null || $scope.model.zoomLevel === undefined ? 7 : $scope.model.zoomLevel,
                    zoomControl: $scope.model.zoomControl,
                    mapTypeControl: $scope.model.mapTypeControl,
                    streetViewControl: $scope.model.streetViewControl,
                    fullscreenControl: $scope.model.fullscreenControl,
                    mapTypeId: google.maps.MapTypeId[$scope.model.mapType],
                    gestureHandling: $scope.model.gestureHandling
                }

                map = new google.maps.Map($element[0], mapOptions);
                
                //If google maps directions is enabled, create route map.
                if ($scope.model.useGoogleMapDirections == true) {
                    $log.log('Google Directions enabled, start building route');
                    if (location.length > 1) {
                        var directionsService = new google.maps.DirectionsService;
                        
                        if (directionsDisplay) {
                        	directionsDisplay.setMap(null);
                        }
                        
                        directionsDisplay = new google.maps.DirectionsRenderer;
    
                        directionsDisplay.setMap(map);
                        calculateAndDisplayRoute(directionsService, directionsDisplay, location);
                    } else {
                        $log.error('Google maps directions needs a minimum of 2 locations')
                    }
                } else {
                	mapMarkers = {};
                    var markers = location.map(function(loc, i) {
                        return createMarker(loc, i);
                    });
                    
                    //map listener closure
                    function attachMapListener(eventType) {
                    	map.addListener(eventType, function(evt) {
                    		var jsEvent = createJSEvent(evt, eventType);
                    		$scope.handlers.onMapEvent(jsEvent, jsEvent.data && jsEvent.data.latLng ? jsEvent.data.latLng : null);
                    	})
                    }

                    if ($scope.handlers.onMapEvent && $scope.model.mapEvents) {
                    	for (var m = 0; m < $scope.model.mapEvents.length; m++) {
                    		attachMapListener($scope.model.mapEvents[m]);
                    	}
                    }
                    
					if ($scope.model.useGoogleMapCluster == true) {
						$log.log('Google Map Clusterview enabled');
						new MarkerClusterer(map, markers, { imagePath: 'googlemaps/svyGMaps/libs/images/m' });
					}

					if (location.length > 1) {
						var bounds = new google.maps.LatLngBounds();
						for (var i in markers) {
							bounds.extend(markers[i].position);
						}
						map.fitBounds(bounds);
					}                   
                }

                //when resizing page re-center the map marker
                google.maps.event.addDomListener(window, "resize", function() {
                    var center = map.getCenter();
                    google.maps.event.trigger(map, "resize");
                    map.setCenter(center);
                });

				map.addListener('zoom_changed', function() {
					if ($scope.model.zoomLevel !== null && $scope.model.zoomLevel !== undefined) {
						var currLevel = map.getZoom();
						if ($scope.model.zoomLevel != currLevel) {
							$scope.model.zoomLevel = currLevel;
							$scope.svyServoyapi.apply("zoomLevel");
						}
					}
				});
            }

            $scope.centerMap = function(latlong) {
                map.setCenter(latlong);
            }
            
            $scope.getBounds = function() {
            	if (map) {
            		var latLngBounds = map.getBounds();
            		if (latLngBounds) {
	            		var sw = latLngBounds.getSouthWest();
	            		var ne = latLngBounds.getNorthEast();
	            		return {
	            			sw:  createLatLngObj(sw),
	            			ne:  createLatLngObj(ne),
	            		}
            		}
            	}
            	return null;
            }
            
            $scope.fitBounds = function(boundsToFit) {
            	if (map) {
            		var bounds = new google.maps.LatLngBounds(boundsToFit.sw, boundsToFit.ne);
            		map.fitBounds(bounds)
            	}
            }            
            
            $scope.getCenter = function() {
            	if (map) {
            		return createLatLngObj(map.getCenter());
            	}
            	return null;
            }

            $scope.$watch('googleMapsLoaded', function(newValue, oldValue) {
                if ($scope.googleMapsLoaded == true) { // gmaps loaded. create geocoder and create map
                    $log.debug('Google maps loaded, create geocoder & map');
                    $scope.geocoder = new google.maps.Geocoder()
                    $scope.googleMapsLoaded = true;
                    $scope.createMap();
                }
            }, true)
            
			$scope.$watch('model.markers', function(newValue, oldValue) {
					$log.debug('Google Maps Markers changed');
					if (markersGeocoded) {
						//prevent a full cycle when the watch only fires because markers have been geocoded
						markersGeocoded = false;
						return;
					}
					if ($scope.googleMapsLoaded == true && !angular.equals(newValue, oldValue) && !markersGeocoded) {
						var location = [];
						for (var i in $scope.model.markers) {
							var googleMarker = $scope.model.markers[i];
							if (mapMarkers && googleMarker.markerId && mapMarkers.hasOwnProperty(googleMarker.markerId)) {
								location.push(mapMarkers[googleMarker.markerId].getPosition());
							} else if (googleMarker.position != null) {
								location.push(new google.maps.LatLng(googleMarker.position.lat, googleMarker.position.lng));
							} else if (googleMarker.latitude != null && googleMarker.longitude != null) {
								//support for deprecated properties latitude/longitude
								location.push(new google.maps.LatLng(googleMarker.latitude, googleMarker.longitude));
							} else if (googleMarker.addressDataprovider || googleMarker.addressString) {
								location.push($scope.getLatLng(googleMarker.addressDataprovider || googleMarker.addressString));
							}
						}
						Promise.all(location).then(function(returnVals) {
							for (var i in returnVals) {
								location[i] = returnVals[i];
								var marker = $scope.model.markers[i];
				            	if (!marker.position || marker.position.lat == null || marker.position.lng == null) {
				            		//add geocode result to marker		            		
				            		marker.position = createLatLngObj(location[i]);
				            		if ($scope.handlers.onMarkerGeocoded) {
				            			$scope.handlers.onMarkerGeocoded(marker, marker.position);
				            		}
				            		//to prevent the watch from firing again only because the geocode result has been added
				            		markersGeocoded = true;
				            	}
							}
						}).then(function() {
							//update markers and clear removed markers
							for ( var m in mapMarkers ) {
								var modelMarker = null;
								for (var n = 0; n < newValue.length; n++) {
									if (newValue[n].markerId == m) {
										modelMarker = newValue[n];
										break;
									}
								}
								if (!modelMarker) {
									mapMarkers[m].setMap(null);
									delete mapMarkers[m];
								} else {
									//set changed properties
									var markerOptions = {
										animation: modelMarker.animation ? google.maps.Animation[modelMarker.animation.toUpperCase()] : null,
										clickable: modelMarker.clickable,
										draggable: modelMarker.draggable,
										crossOnDrag: modelMarker.crossOnDrag,
										cursor: modelMarker.cursor,
										icon: modelMarker.iconUrl || modelMarker.iconMedia,
										label: modelMarker.iconLabel,
										opacity: modelMarker.opacity,
										visible: modelMarker.visible,
										zIndex: modelMarker.zIndex,
										title: modelMarker.title || modelMarker.tooltip //TODO remove tooltip (deprecated)
									}
									
									if (modelMarker.position != null) {
										mapMarkers[m].setPosition(modelMarker.position);
									} else if (modelMarker.latitude != null && modelMarker.longitude != null) {
										//TODO remove support for deprecated latitude/longitude properties
										mapMarkers[m].setPosition(new google.maps.LatLng(modelMarker.latitude, modelMarker.longitude));
									}
									
									
									mapMarkers[m].setOptions(markerOptions);
								}
							}
							
							if ($scope.model.useGoogleMapDirections == true) {
								//remove markers
								mapMarkers = {};
								var directionsService = new google.maps.DirectionsService;
								if (directionsDisplay) {
		                        	directionsDisplay.setMap(null);
		                        }
								directionsDisplay = new google.maps.DirectionsRenderer;

								directionsDisplay.setMap(map);
								calculateAndDisplayRoute(directionsService, directionsDisplay, location);
							} else {
								var markers = location.map(function(loc, i) {
									//return existing marker or create new marker
									return mapMarkers[$scope.model.markers[i].markerId] || createMarker(loc, i);
								});

								location = location.filter(function removeEmpty(loc) {
									return loc != null;
								})

								if (location.length > 1) {
									var bounds = new google.maps.LatLngBounds();
									for (var i in markers) {
										bounds.extend(markers[i].position);
									}
									map.fitBounds(bounds);
								} else if (location.length == 1) {
									map.setCenter(markers[0].position);
								}
							}
						});
					} else {						
						$scope.createMap();
					}
				}, true);

            $scope.$watch('model.zoomLevel', function(nv) {
                try {
                    map.setZoom(nv);
                } catch (e) {}
            });

            var kmlLayer;
            $scope.$watch('model.KmlLayerURL', function(newValue) {
                if(newValue) {
                    kmlLayer = new google.maps.KmlLayer({
                        url: newValue,
                        map: map
                    });
                } else {
                    if(kmlLayer) {
                        kmlLayer.setMap(null);
                    }
                }
            });

        },
        controller: function($scope, $element, $attrs) {

            var getScriptInt = null;
            //load google api
            var getScript = function() {
                script = document.createElement("script")
                script.id = "googleMapsScript"
                script.type = "text/javascript"
                script.src = "https://maps.googleapis.com/maps/api/js?key=" + $scope.model.apiKey + "&callback=googleMapsLoadedCallback"
                document.body.appendChild(script);
            }

            //unload google api
            var unloadScript = function() {
                    try {
                        var script = document.getElementById('googleMapsScript');
                        script.parentElement.removeChild(script);
                        var errContainer = document.getElementsByClassName('gm-err-container')[0];
                        errContainer.parentElement.removeChild(errContainer);
                    } catch (e) {

                    }
                }
                //show error message indicating API key not yet loaded.
            var showErrMessage = function() {
                try {
                    document.getElementById($scope.model.svyMarkupId).innerHTML = '<h2> : ( NO API KEY LOADED YET... </h2>'
                } catch (e) {}
            }

            if (window.google && window.google.maps) {
                $scope.googleMapsLoaded = true
            } else {
                //set an interval to wait for apiKey dataprovider to be binded before trying to load google's api.
                getScriptInt = setInterval(function() {
                    if (!$scope.model.apiKey) {
                        showErrMessage();
                        unloadScript();
                    } else {
                        clearInterval(getScriptInt);
                        getScript();
                    }
                });
            }

            // note this method is defined in root scope
            window.googleMapsLoadedCallback = function() {
                // might be better to use a rootScope object for the Geocoder
                $scope.$apply(function() { // use apply to notify angular about change in scope variable
                    $scope.geocoder = new google.maps.Geocoder()
                    $scope.googleMapsLoaded = true;
                })
            }

            /**
             * Refresh google maps
             * @example %%prefix%%%%elementName%%.refresh();
             * @returns {Boolean}
             */
            $scope.api.refresh = function() {
                $scope.createMap()
                return true;
            }

            /**
             * Center google maps at the given address
             * @example %%prefix%%%%elementName%%.centerAtAddress(address);
             * @returns {Boolean}
             */
            $scope.api.centerAtAddress = function(address) {
                if(address) {
                    $scope.getLatLng(address).then(function(location) {
                        $scope.centerMap(location);
                        return true;
                    });
                }
                return false;
            }

             /**
             * Center google maps at LatLng
             * @example %%prefix%%%%elementName%%.centerAtLatLng(lat, lng);
             * @returns {Boolean}
             */
            $scope.api.centerAtLatLng = function(lat, lng) {
                if (lat != null && lng != null) {
                    $scope.centerMap(new google.maps.LatLng(lat, lng))
                    return true;
                }
                return false;
            }
            
            /**
             * Returns the lat/lng bounds of the current viewport. If more than one copy of the world is visible, the<br>
             * bounds range in longitude from -180 to 180 degrees inclusive. If the map is not yet initialized (i.e.<br>
             * the mapType is still null), or center and zoom have not been set then the result is <code>null</code> or <code>undefined</code>.
             * @return {CustomType<googlemaps-svy-G-Maps.latLngBounds>}
             */
            $scope.api.getBounds = function() {
            	return $scope.getBounds();
            } 
            
            /**
             * Returns the position displayed at the center of the map
             * @return {CustomType<googlemaps-svy-G-Maps.latLng>}
             */
            $scope.api.getCenter = function() {
            	return $scope.getCenter();
            }  
            
            /**
             * Sets the viewport to contain the given bounds.
             * @return {CustomType<googlemaps-svy-G-Maps.latLngBounds>}
             */
            $scope.api.fitBounds = function(bounds) {
            	return $scope.fitBounds(bounds);
            }            
        },
        templateUrl: 'googlemaps/svyGMaps/svyGMaps.html'
    };
})

function sleep(ms) {
	var d = new Date();
	d.setTime(d.getTime()+ms);
	while(new Date().getTime() < d){}
}