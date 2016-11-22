angular.module('googlemapsSvyGMaps', ['servoy']).directive('googlemapsSvyGMaps', function() {
    return {
        restrict: 'E',
        scope: {
            model: '=svyModel'
        },
        link: function($scope, $element, $attrs, $timeout) {
            var map;
            var marker;

            function createMap() {
                if (!$scope.googleMapsLoaded == true) {
                    //TODO return error
                    return;
                }

                var location = new google.maps.LatLng($scope.model.latitude, $scope.model.longitude)
                if ($scope.model.address) {
                    $scope.geocoder.geocode({
                        address: $scope.model.address
                    }, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            createMapAtPoint(results[0].geometry.location)
                        } else {
                            createMapAtPoint(location)
                        }
                    })
                } else {
                    createMapAtPoint(location)
                }
            }

            function createMapAtPoint(point) {
                if ($($element).length == 0) {
                    return;
                }

                var mapOptions = {
                    center: point,
                    zoom: $scope.model.zoom,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                }
                map = new google.maps.Map($element[0], mapOptions)

                marker = new google.maps.Marker({
                    position: point,
                    title: 'position' 
                })
                marker.setMap(map);

                //when resizing page re-center the map marker
                google.maps.event.addDomListener(window, "resize", function() {
                    var center = map.getCenter();
                    google.maps.event.trigger(map, "resize");
                    map.setCenter(center);
                });

            }

            $scope.$watch('googleMapsLoaded', function(newValue, oldValue) {
                if ($scope.googleMapsLoaded == true) { // gmaps loaded. create geocoder and create map
                    $scope.geocoder = new google.maps.Geocoder()
                    $scope.googleMapsLoaded = true;
                    setTimeout(createMap, 0);
                }
            }, true)

            $scope.$watch('model.address', function() {
                createMap()
            });
          
            $scope.$watch('model.zoom', function(nv) {
            	map.setZoom(nv);
            });
                  
        },
        controller: function($scope, $element, $attrs) {
            var getScriptInt = null;
            //load google api
            var getScript = function() {
                script = document.createElement("script")
                script.id = "googleMapsScript"
                script.type = "text/javascript"
                script.src = "http://maps.googleapis.com/maps/api/js?key=" + $scope.model.apiKey + "&callback=googleMapsLoadedCallback"
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
            
        },
        templateUrl: 'googlemaps/svyGMaps/svyGMaps.html'
    };
})
