angular.module('googlemapsSvyGMaps', ['servoy']).directive('googlemapsSvyGMaps', function($log) {
    return {
        restrict: 'E',
        scope: {
            model: '=svyModel',
            svyServoyapi: '=',
            api: "=svyApi"
        },
        link: function($scope, $element, $attrs, $timeout) {
            var map;

            $scope.createMap = function() {
                if (!$scope.googleMapsLoaded == true) {
                    //TODO return error
                    return;
                }

                var location = [];
                for(var i in $scope.model.markers) {
                    var googleMarker = $scope.model.markers[i];
                    location[i] = new google.maps.LatLng(googleMarker.latitude, googleMarker.longitude);
                    if (googleMarker.addressDataprovider || googleMarker.addressString) {
                        location[i] = getLatLng(googleMarker.addressDataprovider || googleMarker.addressString);
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

            function getLatLng(address) {
                return new Promise(function(resolve, reject) {
                    $scope.geocoder.geocode({
                        address: address
                    }, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            resolve(results[0].geometry.location);
                        } else if(status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT){
                        	sleep(2000);
                        	resolve(getLatLng(address));
                        } else {
                           reject(new Error('Couldnt\'t find the location ' + address));
                        }
                    });
                })
            }

            function calculateAndDisplayRoute(directionsService, directionsDisplay, location) {
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
                    optimizeWaypoints: true,
                    travelMode: 'DRIVING'
                  }, function(response, status) {
                    if (status === 'OK') {
                      directionsDisplay.setDirections(response);
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
                    center: (location.length == 1 ? new google.maps.LatLng(location[0].lat(), location[0].lng()) : null),
                    zoom: $scope.model.zoom === null || $scope.model.zoom === undefined ? 7 : $scope.model.zoom,
                    zoomControl: $scope.model.zoomControl,
                    mapTypeControl: $scope.model.mapTypeControl,
                    streetViewControl: $scope.model.streetViewControl,
                    fullscreenControl: $scope.model.fullscreenControl,
                    mapTypeId: google.maps.MapTypeId[$scope.model.mapType]
                }

                map = new google.maps.Map($element[0], mapOptions)
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
                        var mark = new google.maps.Marker({
                            position: new google.maps.LatLng(loc.lat(), loc.lng()),
                            map: map,
                            title: $scope.model.markers[i].tooltip,
							label: $scope.model.markers[i].iconLabel,
                            icon : {
                                url: $scope.model.markers[i].iconUrl
                            }
                        })
                        
                        if ($scope.model.markers[i].infoWindowString) {
                        	var infowindow = new google.maps.InfoWindow({
                                content: $scope.model.markers[i].infoWindowString
                              });
                        	mark.addListener('click', function() {
                                infowindow.open(map, mark);
                            });
                        }
                        return mark
                    });

                    if(location.length > 1) {
                        var bounds = new google.maps.LatLngBounds();
                        for(var i in markers) {
                            bounds.extend(markers[i].position);
                        }
                        map.fitBounds(bounds);
                    }


                    
                    if($scope.model.useGoogleMapCluster == true) {
                        $log.log('Google Map Clusterview enabled');
                        new MarkerClusterer(map, markers, {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
                    } 
                                        
                }

                //when resizing page re-center the map marker
                google.maps.event.addDomListener(window, "resize", function() {
                    var center = map.getCenter();
                    google.maps.event.trigger(map, "resize");
                    map.setCenter(center);
                });

            }

            $scope.$watch('googleMapsLoaded', function(newValue, oldValue) {
                if ($scope.googleMapsLoaded == true) { // gmaps loaded. create geocoder and create map
                    $log.log('Google maps loaded, create geocoder & map');
                    $scope.geocoder = new google.maps.Geocoder()
                    $scope.googleMapsLoaded = true;
                    $scope.createMap();
                }
            }, true)

            //var markerWatches = [];
            var markerKeysToWatch =['addressDataprovider',
                                    'addressString',
                                    'latitude',
                                    'longitude'
                                    ];
            
            $scope.watchArray = [];
            $scope.$watchCollection('model.markers', function(newValue, oldValue) {
                $log.log('Remove existing watchers to fix array unwatch error');
                for(var i in $scope.watchArray) {
                    $scope.watchArray[i]();
                }

                $log.log('Google Maps Markers changed');
                for(var i = 0; i < $scope.model.markers.length; i++) {
                    for( var j = 0; j < markerKeysToWatch.length; j++) {
                        var watch = $scope.$watch("model.markers[" + i + "]['" + markerKeysToWatch[j] + "']",
                            function(newValue, oldValue) {
                                if(newValue != oldValue) {
                                    $log.log('Marker property changed');
                                    $scope.createMap()
                                }
                            });
                            $scope.watchArray.push(watch)
                    }
                }
                $scope.createMap()
            })

            $scope.$watch('model.zoom', function(nv) {
                try {
                    map.setZoom(nv);
                } catch (e) {}
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
             * Add a new google marker to the map
             * @example %%prefix%%%%elementName%%.newMarkers([{addressString: 'Fred. Roeskestraat 97, Amsterdam, NL'}]);
             * @param {Array<{addressString: String, latitude: Number, longitude: Number}>} markers
             * @param {Number} [index] optional starting point where to add the markers
             */
            $scope.api.newMarkers = function(markers, index) {
                if(markers) {
                    if($scope.model.markers.length > 0) {
                        if(index != null) {
                            $scope.model.markers.splice(index, 0, markers);
                        } else {
                            $scope.model.markers.concat(markers);
                        }
                    } else {
                        $scope.model.markers = markers;
                    }
                    $scope.svyServoyapi.apply("markers");
                    return true;
                }
                return false;
            }

            /**
             * Remove google marker at given index
             * @example %%prefix%%%%elementName%%.removeMarker(index);
             * @param {Number} index
             */
            $scope.api.removeMarker = function(index) {
                if(index != null && $scope.model.markers[index]) {
                    $scope.model.markers.splice(index, 1);
                    $scope.svyServoyapi.apply("markers");
                    return true;
                }
                return false;
            }
            /**
             * Remove all google markers
             * @example %%prefix%%%%elementName%%.removeAllMarkers();
             */
            $scope.api.removeAllMarkers = function() {
                if($scope.model.markers && $scope.model.markers.length > 0) {
                    for(var i in $scope.watchArray) {
                        $scope.watchArray[i]();
                    }
                    //$scope.model.markers = [];
                    $scope.model.markers.length = 0;
                    $scope.svyServoyapi.apply("markers");
                }
                return true;
            }

            $scope.api.refresh = function() {
                $scope.createMap()
                return true;
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