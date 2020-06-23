angular.module('googlemapsSvyGMaps', ['servoy']).directive('googlemapsSvyGMaps', function($log) {
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

            $scope.createMap = function() {
                if (!$scope.googleMapsLoaded == true) {
                    //TODO return error
                    return;
                }

                var location = [];
                for(var i in $scope.model.markers) {
                    var googleMarker = $scope.model.markers[i];
                    if(googleMarker.latitude != null && googleMarker.longitude != null) {
                        location.push(new google.maps.LatLng(googleMarker.latitude, googleMarker.longitude));
                    } else if (googleMarker.addressDataprovider || googleMarker.addressString) {
                    	location.push($scope.getLatLng(googleMarker.addressDataprovider || googleMarker.addressString));
                    }
                }
                Promise.all(location).then(function(returnVals) {
                    for(var i in returnVals) {
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
                        	sleep(2000);
                        	resolve($scope.getLatLng(address));
                        } else {
                           reject(new Error('Couldnt\'t find the location ' + address));
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
                for (var i = 1; i < (location.length -1); i++) {
                      waypts.push({
                        location: new google.maps.LatLng(location[i].lat(), location[i].lng()),
                        stopover: true
                      });
                  }

                directionsService.route({
                    origin: new google.maps.LatLng(location[0].lat(), location[0].lng()),
                    destination: new google.maps.LatLng(location[location.length -1].lat(), location[location.length -1].lng()),
                    waypoints: waypts,
                    travelMode: routeSettings.travelMode.toUpperCase(),
                    optimizeWaypoints: routeSettings.optimize,
                    avoidFerries: routeSettings.avoidFerries,
                    avoidHighways: routeSettings.avoidHighways,
                    avoidTolls: routeSettings.avoidTolls
                  }, function(response, status) {
                    if (status === 'OK') {
                        directionsDisplay.setDirections(response);
                        var calculatedRoute = {};
                        calculatedRoute.legs = [];

                        var totalMeters = 0;
                        var totalSeconds = 0;
                        response.routes[0].legs.forEach(function(routeLeg) {
                            var leg = {
                                start_address: routeLeg.start_address,
                                end_address: routeLeg.end_address,
                                distance: routeLeg.distance.text,
                                distance_meters: routeLeg.distance.value,
                                duration: routeLeg.duration.text,
                                duration_seconds: routeLeg.duration.value,
                            }
                            totalMeters += leg.distance_meters;
                            totalSeconds += leg.duration_seconds;
                            calculatedRoute.legs.push(leg);
                        });
                        
                        calculatedRoute.total_distance = totalMeters;
                        calculatedRoute.total_duration = totalSeconds;

                        if($scope.handlers.onRouteChanged) {
                            $scope.handlers.onRouteChanged(calculatedRoute);
                        }

                    } else {
                      window.alert('Directions request failed due to ' + status);
                    }
                  });
            }

            function createMapAtPoint(location) {
                if ($($element).length == 0) {
                    return;
                }

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
                if($scope.model.useGoogleMapDirections == true) {
                    $log.log('Google Directions enabled, start building route');
                    if(location.length > 1) {
                        var directionsService = new google.maps.DirectionsService;
                        var directionsDisplay = new google.maps.DirectionsRenderer;
    
                        directionsDisplay.setMap(map);
                        calculateAndDisplayRoute(directionsService, directionsDisplay, location);
                    } else {
                        $log.error('Google maps directions needs a minimum of 2 locations')
                    }
                } else {
                    var markers = location.map(function(loc, i) {
                        var markerObj = {
                            position: new google.maps.LatLng(loc.lat(), loc.lng()),
                            map: map,
                            title: $scope.model.markers[i].tooltip,
                            label: $scope.model.markers[i].iconLabel,
							markerIndex: i,
							draggable: $scope.model.markers[i].draggable,
							animation: $scope.model.markers[i].animation ? google.maps.Animation[$scope.model.markers[i].animation.toUpperCase()] : null,
							clickable: $scope.model.markers[i].clickable,
							crossOnDrag: $scope.model.markers[i].crossOnDrag,
							opacity: $scope.model.markers[i].opacity != null ? $scope.model.markers[i].opacity : null,
							visible: $scope.model.markers[i].visible,
							zIndex: $scope.model.markers[i].zIndex != null ? $scope.model.markers[i].zIndex : null
                        }
						
                        if($scope.model.markers[i].iconUrl) {
                            markerObj.icon = $scope.model.markers[i].iconUrl
                        } else if($scope.model.markers[i].drawRadius == true) {
                            markerObj.icon = {
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: 0,
                                fillColor: $scope.model.markers[i].radiusColor||"#AA0000",
                                fillOpacity: 0.4,
                                strokeColor: $scope.model.markers[i].radiusColor||"#AA0000",
                                strokeWeight: 0.4
                            }
                        }

                        var marker = new google.maps.Marker(markerObj)

                        if ($scope.model.markers[i].infoWindowString) {
                        	var infowindow = new google.maps.InfoWindow({
                                content: $scope.model.markers[i].infoWindowString
                              });
                              marker.addListener('click', function() {
                                infowindow.open(map, marker);
                            });
                        }
                        
                        //marker listener closure
                        function attachMarkerListener(markerObj, eventType) {
                        	marker.addListener(eventType, function(evt) {
                                $scope.handlers.onMarkerEvent(eventType, markerObj, getLatLngFromMouseEvent(evt));
                            });
                        }
                        
                        if ($scope.handlers.onMarkerEvent && $scope.model.markerEvents) {
                        	for (var e = 0; e < $scope.model.markerEvents.length; e++) {
								attachMarkerListener($scope.model.markers[i], $scope.model.markerEvents[e]);
                        	}
                        }

                        if($scope.model.markers[i].drawRadius == true) {
                            var circle = new google.maps.Circle({
                                map: map,
                                radius: $scope.model.markers[i].radiusMeters||2000,
                                fillColor: $scope.model.markers[i].radiusColor||"#AA0000",
                                strokeColor: $scope.model.markers[i].radiusColor||"#AA0000"
                              });
                              circle.bindTo('center', marker, 'position');
                        }
                        return marker
                    });

                    if(location.length > 1) {
                        var bounds = new google.maps.LatLngBounds();
                        for(var i in markers) {
                            bounds.extend(markers[i].position);
                        }
                        map.fitBounds(bounds);
                    }
                    
                    //map listener closure
                    function attachMapListener(eventType) {
                    	map.addListener(eventType, function(evt) {
                    		$scope.handlers.onMapEvent(eventType, getLatLngFromMouseEvent(evt));
                    	})
                    }
                    
                    function getLatLngFromMouseEvent(evt) {
                    	if (evt && evt.latLng) {
                			return {
                				lat: evt.latLng.lat(),
                				lng: evt.latLng.lng()
                			}
                		}
                    	return null;
                    }

                    if ($scope.handlers.onMapEvent && $scope.model.mapEvents) {
                    	for (var m = 0; m < $scope.model.mapEvents.length; m++) {
                    		attachMapListener($scope.model.mapEvents[m]);
                    	}
                    }
                    
                    if($scope.model.useGoogleMapCluster == true) {
                        $log.log('Google Map Clusterview enabled');
                        new MarkerClusterer(map, markers, {imagePath: 'googlemaps/svyGMaps/libs/images/m'});
                    } 
                                        
                }

                //when resizing page re-center the map marker
                google.maps.event.addDomListener(window, "resize", function() {
                    var center = map.getCenter();
                    google.maps.event.trigger(map, "resize");
                    map.setCenter(center);
                });

                map.addListener('zoom_changed', function() {
                    if($scope.model.zoomLevel !== null && $scope.model.zoomLevel !== undefined) {
                        $scope.model.zoomLevel = map.getZoom();
                        $scope.svyServoyapi.apply("zoomLevel");
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
	            			sw:  {lat: sw.lat(), lng: sw.lng()},
	            			ne:  {lat: ne.lat(), lng: ne.lng()},
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
            		var center = map.getCenter();
            		if (center) {
	            		return {lat: center.lat(), lng: center.lng()};
            		}
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
                $scope.createMap()
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
            $scope.api.centerAtLatLng= function(lat, lng) {
                if(lat && lng) {
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