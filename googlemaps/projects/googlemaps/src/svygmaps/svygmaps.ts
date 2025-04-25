import { Component, SimpleChanges, Input, Renderer2, ChangeDetectorRef, Output, EventEmitter, Inject } from '@angular/core';
import { MarkerClusterer} from "@googlemaps/markerclusterer";
import { ServoyBaseComponent, ServoyPublicService, LoggerFactory, LoggerService, JSEvent, EventLike, WindowRefService } from '@servoy/public';
import { DOCUMENT } from '@angular/common';


@Component({
    selector: 'googlemaps-svy-G-Maps',
    templateUrl: './svygmaps.html',
    standalone: false
})
export class SvyGMaps extends ServoyBaseComponent<HTMLDivElement> {
    @Input() addressTitle: any;
    @Input() apiKey: any;
    @Input() mapID: any;
    @Input() directionsSettings: RouteSettings;
    @Input() fullscreenControl: boolean;
    @Input() gestureHandling: string;
    @Input() KmlLayerURL: any;
    @Input() mapEvents: Array<string>;
    @Input() mapType: string;
    @Input() mapTypeControl: boolean;
    @Input() markerEvents: Array<string>;
    @Input() options: any;
	@Input() responsiveHeight: number;

    @Input() markers: Array<Marker>;
    @Output() markersChange = new EventEmitter();

    @Input() streetViewControl: boolean;
    @Input() styleClass: string;
    @Input() useGoogleMapCluster: boolean;
    @Input() useGoogleMapDirections: boolean;
    @Input() zoomControl: boolean;
    @Input() zoomLevel: any;
    @Output() zoomLevelChange = new EventEmitter();

    @Input() onMapEvent: (e: JSEvent, latlng: any) => void;
    @Input() onMarkerEvent: (e: JSEvent, index: number, latlng: any) => void;
    @Input() onMarkerGeocoded: (marker: Marker, ltdlng: LatitudeLongitude) => void;
    @Input() onRouteChanged: (route: RouteResult) => void;

    map: google.maps.Map;
    mapMarkers: Map<string, google.maps.Marker>;
    directionsDisplay: google.maps.DirectionsRenderer;
    geocoder: google.maps.Geocoder;
    kmlLayer: google.maps.KmlLayer;
    getScriptInt: any;

    private log: LoggerService;

    private AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement | undefined;

    constructor(renderer: Renderer2, cdRef: ChangeDetectorRef, logFactory: LoggerFactory,
        private servoyService: ServoyPublicService, private windowRefService: WindowRefService, @Inject(DOCUMENT) private document: Document) {
        super(renderer, cdRef);
        this.log = logFactory.getLogger('svy-google-maps');
    }

    svyOnInit() {
        super.svyOnInit();
        this.windowRefService.nativeWindow['googleMapsLoadedCallback'] = () => {
            this.initMap();
        }

        if (this.windowRefService.nativeWindow['google'] && this.windowRefService.nativeWindow['google'].maps) {
            this.initMap();
        } else {
            //set an interval to wait for apiKey dataprovider to be binded before trying to load google's api.
            this.getScriptInt = this.windowRefService.nativeWindow.setInterval(() => {
                if (!this.apiKey && this.servoyApi.isInDesigner()) {
                    this.showErrMessage(true);
                } else if (!this.apiKey) {
                    this.showErrMessage();
                    this.unloadScript();
                } else {
                    this.windowRefService.nativeWindow.clearInterval(this.getScriptInt);
                    this.loadScript();
                }
            });
        }
		this.setHeight();
    }


    svyOnChanges(changes: SimpleChanges) {
        super.svyOnChanges(changes);
        if (changes['markers']) {
            if (this.geocoder) {
                let location = [];
                for (const googleMarker of this.markers) {
                    if (this.mapMarkers && googleMarker.markerId && this.mapMarkers.has(googleMarker.markerId)) {
                        location.push(this.mapMarkers[googleMarker.markerId].getPosition());
                    } else if (googleMarker.position != null) {
                        location.push(new google.maps.LatLng(googleMarker.position.lat, googleMarker.position.lng));
                    }
                    else if (googleMarker.addressDataprovider || googleMarker.addressString) {
                        location.push(this.getLatLng(googleMarker.addressDataprovider || googleMarker.addressString));
                    }
                }
                Promise.all(location).then((returnVals) => {
                    for (var i in returnVals) {
                        location[i] = returnVals[i];
                        var marker = this.markers[i];
                        if (!marker.position || marker.position.lat == null || marker.position.lng == null) {
                            //add geocode result to marker                          
                            marker.position = this.createLatLngObj(location[i]);
                            if (this.onMarkerGeocoded) {
                                this.onMarkerGeocoded(marker, marker.position);
                            }
                        }
                    }
                }).then(() => {
                    //update markers and clear removed markers
                    for (var m in this.mapMarkers) {
                        var modelMarker = null;
                        for (var n = 0; n < this.markers.length; n++) {
                            if (this.markers[n].markerId == m) {
                                modelMarker = this.markers[n];
                                break;
                            }
                        }
                        if (!modelMarker) {
                            this.mapMarkers[m].setMap(null);
                            this.mapMarkers.delete(m);
                        } else {
                            //set changed properties
                            this.mapMarkers[m].animation = modelMarker.animation ? google.maps.Animation[modelMarker.animation.toUpperCase()] : null;
                            this.mapMarkers[m].clickable = modelMarker.clickable;
                            this.mapMarkers[m].draggable = modelMarker.draggable;
                            this.mapMarkers[m].crossOnDrag = modelMarker.crossOnDrag;
                            this.mapMarkers[m].cursor = modelMarker.cursor;
                            this.mapMarkers[m].icon = modelMarker.iconUrl || modelMarker.iconMedia;
                            this.mapMarkers[m].label = modelMarker.iconLabel;
                            this.mapMarkers[m].opacity = modelMarker.opacity;
                            this.mapMarkers[m].visible = modelMarker.visible;
                            this.mapMarkers[m].zIndex = modelMarker.zIndex;
                            this.mapMarkers[m].title = modelMarker.title || modelMarker.tooltip; //TODO remove tooltip (deprecated)


                            if (modelMarker.position != null) {
                                this.mapMarkers[m].position = modelMarker.position;
                            } else if (modelMarker.latitude != null && modelMarker.longitude != null) {
                                this.mapMarkers[m].position = new google.maps.LatLng(modelMarker.latitude, modelMarker.longitude);
                            }
                        }
                    }

                    if (this.useGoogleMapDirections == true) {
                        //remove markers
                        this.mapMarkers = new Map()
                        var directionsService = new google.maps.DirectionsService;
                        if (this.directionsDisplay) {
                            this.directionsDisplay.setMap(null);
                        }
                        this.directionsDisplay = new google.maps.DirectionsRenderer;

                        this.directionsDisplay.setMap(this.map);
                        this.calculateAndDisplayRoute(directionsService, location);
                    } else {
                        var markers = location.map((loc, i) => {
                            //return existing marker or create new marker
                            return this.mapMarkers[this.markers[i].markerId] || this.createMarker(loc, i);
                        });

                        location = location.filter((loc) => {
                            return loc != null;
                        })

                        if (location.length > 1) {
                            var bounds = new google.maps.LatLngBounds();
                            for (var i in markers) {
                                bounds.extend(markers[i].position);
                            }
                            this.map.fitBounds(bounds);
                        } else if (location.length == 1) {
                            this.map.setCenter(markers[0].position);
                        }
                    }
                });
            } else {
                this.createMap();
            }
        }
        if (changes['zoomLevel'] && this.map) {
            try {
                this.map.setZoom(this.zoomLevel);
            } catch (e) { }
        }
        if (changes['KmlLayerURL'] && this.map) {
            if (this.KmlLayerURL) {
                this.kmlLayer = new google.maps.KmlLayer({
                    url: this.KmlLayerURL,
                    map: this.map
                });
            } else {
                if (this.kmlLayer) {
                    this.kmlLayer.setMap(null);
                }
            }
        }
        if (changes['options'] && this.map) {
            this.map.setOptions(this.options);
        }
		if (changes['responsiveHeight']) {
			this.setHeight();
		}
    }

    async createMap() {
        
        if (!this.geocoder) {
            //TODO return error
            return;
        }
        // Import the required "marker" library
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

        // Store it as a class property
        this.AdvancedMarkerElement = AdvancedMarkerElement;

        this.log.debug('Google Maps API loaded, creating map...');

        //clear markers from map
        if (this.mapMarkers  && this.mapMarkers.size > 0) {
            for (let m in this.mapMarkers) {
                this.mapMarkers[m].setMap(null);
            }
        }
        this.mapMarkers = new Map();

        var location = [];
        for (let googleMarker of this.markers) {
            if (googleMarker.position != null) {
                location.push(new google.maps.LatLng(googleMarker.position.lat, googleMarker.position.lng));
            } else if (googleMarker.addressDataprovider || googleMarker.addressString) {
                location.push(this.getLatLng(googleMarker.addressDataprovider || googleMarker.addressString));
            }
        }

        try {
            const resolvedLocations = await Promise.all(location);
            this.createMapAtPoint(resolvedLocations);
        } catch (error) {
            this.log.error("Error resolving locations:", error);
        }
    }

    getLatLng(address) {
        return new Promise((resolve, reject) => {
            this.geocoder.geocode({
                address: address
            }, (results, status) => {
                if (status == google.maps.GeocoderStatus.OK) {
                    resolve(results[0].geometry.location);
                } else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                    this.log.warn('Google maps Geocoder query limit reached, geocoding pauses for 2 seconds');
                    this.sleep(2000);
                    resolve(this.getLatLng(address));
                } else {
                    this.log.error('Could not geocode location ' + address);
                    resolve(null);
                }
            });
        });
    }

    calculateAndDisplayRoute(directionsService: google.maps.DirectionsService, location: Array<google.maps.LatLng>) {
        let routeSettings = this.directionsSettings;
        //When not set go for defaults
        if (!routeSettings) {
            routeSettings = {
                "optimize": true,
                "travelMode": "driving",
                "avoidFerries": false,
                "avoidHighways": false,
                "avoidTolls": false
            }
        }

        let waypts = [];
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
            travelMode: google.maps.TravelMode[routeSettings.travelMode.toUpperCase()],
            optimizeWaypoints: routeSettings.optimize,
            avoidFerries: routeSettings.avoidFerries,
            avoidHighways: routeSettings.avoidHighways,
            avoidTolls: routeSettings.avoidTolls
        }, (response, status) => {
            if (status === 'OK') {
                this.directionsDisplay.setDirections(response);
                let calculatedRoute: RouteResult = {};
                calculatedRoute.legs = [];

                let totalMeters = 0;
                let totalSeconds = 0;

                for (let l = 0; l < response.routes[0].legs.length; l++) {
                    let routeLeg = response.routes[0].legs[l];
                    let startMarkerIndex;
                    if (l == 0) {
                        //first leg starts at start marker
                        startMarkerIndex = 0;
                    } else {
                        //subsequent legs start at marker (waypoint + 1)
                        startMarkerIndex = response.routes[0].waypoint_order[l - 1] + 1;
                    }
                    let endMarkerIndex;
                    if (l == (response.routes[0].legs.length - 1)) {
                        //last leg ends at end marker
                        endMarkerIndex = this.markers.length - 1;
                    } else {
                        //prior markers end at marker (waypoint + 1)
                        endMarkerIndex = response.routes[0].waypoint_order[l] + 1;
                    }
                    var leg = {
                        start_address: routeLeg.start_address,
                        start_markerId: this.markers[startMarkerIndex].markerId,
                        end_address: routeLeg.end_address,
                        end_markerId: this.markers[endMarkerIndex].markerId,
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

                if (this.onRouteChanged) {
                    this.onRouteChanged(calculatedRoute);
                }

            } else {
                this.log.warn('Directions request failed due to ' + status);
            }
        });
    }
    //TODO: handle crossOnDrag functionality
    createCustomMarkerContent(markerData: Marker): HTMLElement {
        const container = document.createElement("div");
        container.style.flexDirection = "column";
        container.style.alignItems = "center";

        if (!markerData.visible) {
            container.style.display = "none"; // Hide marker
        }

        if (markerData.opacity !== undefined && markerData.opacity >= 0 && markerData.opacity <= 1) {
            container.style.opacity = markerData.opacity.toString();
        }

        if (markerData.cursor) {
            container.style.cursor = markerData.cursor;
        }

        if (markerData.clickable === false) {
            // If it's not clickable, disable interaction by setting pointer events to 'none'
            container.style.setProperty("pointerEvents", "none", "important"); // Hide the cross element
                 
            container.addEventListener("click", (event) => {
                event.stopPropagation(); // Prevent clicks from being propagated
            });
        }

        if (markerData.animation) {
            if (markerData.animation === "DROP" || markerData.animation === "drop") {
                container.classList.add("drop-animation");
            } else if (markerData.animation === "BOUNCE" || markerData.animation === "bounce") {
                container.classList.add("bounce-animation");
            }
        }
        // Create an image for the marker icon
        if (markerData.iconUrl || markerData.iconMedia) {
            const img = document.createElement("img");
            img.src = markerData.iconUrl || markerData.iconMedia;
            img.style.width = "25px";
            img.style.height = "23px";
			
			container.style.display = "flex";

            container.appendChild(img);
        } else { /* this gets called when clicking on the map or when one does not set an image for the pin; AdvancedMarkerElement does not have a pin image, it has to be added.*/
            const img = document.createElement("img");
            img.src = "https://maps.google.com/mapfiles/ms/icons/red-dot.png"; // Google Maps default pin
            img.style.width = "40px";
            img.style.height = "40px";
            container.style.display = "flex";
            container.appendChild(img);
        }

        // Add a label below the marker
        if (markerData.iconLabel) {
            const label = document.createElement("span");
            label.innerText = markerData.iconLabel;
            label.style.fontSize = "12px";
            label.style.color = "black";
            container.appendChild(label);
        }
    
        return container;
    }

    createMarker(location, markerIndex: number) {
        if (!location) {
            return null;
        }

        let marker = this.markers[markerIndex];

        let markerObj = {
            position: new google.maps.LatLng(location.lat(), location.lng()),
            map: this.map,
            title: marker.title,
            gmpDraggable: marker.draggable,
            zIndex: marker.zIndex != null ? marker.zIndex : null,
        }


        let gMarker;
        // Now use AdvancedMarkerElement safely
        if (this.AdvancedMarkerElement) {
            gMarker = new this.AdvancedMarkerElement(markerObj);
            this.log.debug("Marker initialized:", gMarker);
            const customContent = this.createCustomMarkerContent(marker);
            if (gMarker.element) {
                gMarker.element.appendChild(customContent);
            }
        } else {
            this.log.error("AdvancedMarkerElement is undefined.");
        }
        this.mapMarkers[marker.markerId || ('marker-' + markerIndex)] = gMarker;

        if (marker.infoWindowString) {
            let infowindow = new google.maps.InfoWindow({
                content: marker.infoWindowString
            });

            gMarker.addListener("click", () => {
                infowindow.open(this.map, gMarker);
            });
        }

        if (this.onMarkerEvent && this.markerEvents) {
            for (var e = 0; e < this.markerEvents.length; e++) {
                let eventType = this.markerEvents[e];
                ((eventType) => {
                    gMarker.addListener(eventType, (evt) => {
                        var jsEvent = this.createJSEvent(evt, eventType);
                        var data = jsEvent.data as { marker: Marker, latLng: LatitudeLongitude}
                        data.marker = marker;
                        var index = -1;
                        for (var i = 0; i < this.markers.length; i++) {
                            if (this.markers[i].markerId == marker.markerId) {
                                index = i;
                                break;
                            }
                        }
                        if (eventType == 'dragend' && data.latLng) {
                            //marker position changed
                            this.markers[index].position = data.latLng;
                            //apply changes before calling the handler
                            this.markersChange.emit(this.markers);
                        }

                        this.onMarkerEvent(jsEvent, index, data && data.latLng ? data.latLng : null);
                    });
                })(eventType);
            }
        }

        if (marker.drawRadius == true) {
            const circle = new google.maps.Circle({
                center: gMarker.position,
                map: this.map,
                radius: marker.radiusMeters || 2000,
                fillColor: marker.radiusColor || "#AA0000",
                strokeColor: marker.radiusColor || "#AA0000"
            });
            // Update the circle center when the marker position changes
            gMarker.addEventListener("position_changed", () => {
                circle.setCenter(gMarker.position);
            });
        }
        return gMarker
    }

    createLatLngObj(latLng: google.maps.LatLng) {
        let result = null;
        if (latLng) {
            result = {
                lat: latLng.lat(),
                lng: latLng.lng()
            }
        }
        return result;
    }

    createJSEvent(evt, eventType) {
        var mouseEvent = null;
        for (let p in evt) {
            if (evt[p] instanceof MouseEvent) {
                mouseEvent = evt[p];
                break;
            }
        }
        if (!mouseEvent || !mouseEvent.target) {
            //create fake event
            let me: EventLike = { target: this.getNativeElement() };
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

        var jsEvent = this.servoyService.createJSEvent(mouseEvent, eventType);
        if (evt && evt.latLng) {
            jsEvent.data = {
                latLng: this.createLatLngObj(evt.latLng)
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

    createMapAtPoint(location: Array<google.maps.LatLng>) {

        location = location.filter((loc) => {
            return loc != null;
        })

        let mapOptions = {};
        if (this.options) {
            Object.assign(mapOptions, this.options);
        }

        // Always ensure location is defined and has valid lat/lng
        const centerLocation = (location.length === 1)
            ? new google.maps.LatLng(location[0].lat(), location[0].lng())
            : new google.maps.LatLng(0, 0); // Default to 0,0 if no location is provided

        let mapTypeId = google.maps.MapTypeId.ROADMAP; // this is the default
        // Check if `this.mapType` is one of the allowed values
        if (this.mapType === "SATELLITE") {
            mapTypeId = google.maps.MapTypeId.SATELLITE;
        } else if (this.mapType === "HYBRID") {
            mapTypeId = google.maps.MapTypeId.HYBRID;
        } else if (this.mapType === "TERRAIN") {
            mapTypeId = google.maps.MapTypeId.TERRAIN;
        }
        // Merge all other map options
        Object.assign(mapOptions, {
            center: centerLocation,
            zoom: this.zoomLevel ?? 7,  // Use nullish coalescing to fallback to 7 if zoomLevel is null/undefined
            zoomControl: this.zoomControl,
            mapTypeControl: this.mapTypeControl,
            streetViewControl: this.streetViewControl,
            fullscreenControl: this.fullscreenControl,
            mapTypeId: mapTypeId,  // Ensure this.mapType is a valid MapTypeId string
            gestureHandling: this.gestureHandling,
            mapId: !this.mapID ? 'DEMO_MAP_ID': this.mapID  // the new Google Maps api requires a new mapId and the default is DEMO_MAP_ID: https://developers.google.com/maps/documentation/javascript/reference/map#MapElement.mapId
        });

        // Make sure getNativeElement() is returning a valid DOM element
        const nativeElement = this.getNativeElement();
        if (nativeElement) {
            // Initialize the map
            this.map = new google.maps.Map(nativeElement, mapOptions);
        } else {
            this.log.error("The map container element is invalid.");
        }

        //If google maps directions is enabled, create route map.
        if (this.useGoogleMapDirections == true) {
            this.log.info('Google Directions enabled, start building route');
            if (location.length > 1) {
                var directionsService = new google.maps.DirectionsService;

                if (this.directionsDisplay) {
                    this.directionsDisplay.setMap(null);
                }

                this.directionsDisplay = new google.maps.DirectionsRenderer();

                this.directionsDisplay.setMap(this.map);
                this.calculateAndDisplayRoute(directionsService, location);
            } else {
                this.log.error('Google maps directions needs a minimum of 2 locations')
            }
        } else {
            this.mapMarkers = new Map();
            let markers = location.map((loc, i) => {
                return this.createMarker(loc, i);
            });

            if (this.onMapEvent && this.mapEvents) {
                for (let m = 0; m < this.mapEvents.length; m++) {
                    let eventType = this.mapEvents[m];
                    ((eventType) => {
                        this.map.addListener(eventType, (evt) => {
                            var jsEvent = this.createJSEvent(evt, eventType);
                            var data = jsEvent.data as { latLng: LatitudeLongitude};
                            this.onMapEvent(jsEvent, jsEvent.data && data.latLng ? data.latLng : null);
                        })
                    })(eventType)
                }
            }

            if (this.useGoogleMapCluster == true) {
                this.log.info('Google Map Clusterview enabled');
                
                const markerClusterer = new MarkerClusterer({ map: this.map, markers}); //  { imagePath: 'googlemaps/svyGMaps/libs/images/m' }
//                markerClusterer.
            }

            if (location.length > 1) {
                var bounds = new google.maps.LatLngBounds();
                for (var i in markers) {
                    bounds.extend(markers[i].position);
                }
                this.map.fitBounds(bounds);
            }
        }

        //when resizing page re-center the map marker
        this.windowRefService.nativeWindow.addEventListener("resize", () => {
            var center = this.map.getCenter();
            google.maps.event.trigger(this.map, "resize");
            this.map.setCenter(center);
        });

        this.map.addListener('zoom_changed', () => {
            if (this.zoomLevel !== null && this.zoomLevel !== undefined) {
                var currLevel = this.map.getZoom();
                if (this.zoomLevel != currLevel) {
                    this.zoomLevel = currLevel;
                    this.zoomLevelChange.emit(this.zoomLevel);
                }
            }
        });
    }

    loadScript() {
        let script = this.document.createElement("script")
        script.id = "googleMapsScript"
        script.type = "text/javascript"
        script.async = true;
        script.defer = true;

        script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=geocoding,marker&callback=googleMapsLoadedCallback&loading=async`;  

        this.document.body.appendChild(script);
    }

    //unload google api
    unloadScript() {
        try {
            var script = this.document.getElementById('googleMapsScript');
            script.parentElement.removeChild(script);
            var errContainer = this.document.getElementsByClassName('gm-err-container')[0];
            errContainer.parentElement.removeChild(errContainer);
        } catch (e) {

        }
    }
    //show error message indicating API key not yet loaded.
    showErrMessage(isDesignerMode?: boolean) {
		let message = '<h2> : ( NO API KEY LOADED YET... </h2>';
        if (isDesignerMode) {
			message = '<h2> Google maps in designer mode. </h2>';
		}
		
		if (this.getNativeElement().innerHTML !== message) {
			this.getNativeElement().innerHTML = message;
		}
    }

    initMap() {
        this.geocoder = new google.maps.Geocoder()
        this.createMap();
    }

    centerMap(latlong) {
        this.map.setCenter(latlong);
    }

    getBounds() {
        if (this.map) {
            var latLngBounds = this.map.getBounds();
            if (latLngBounds) {
                var sw = latLngBounds.getSouthWest();
                var ne = latLngBounds.getNorthEast();
                return {
                    sw: this.createLatLngObj(sw),
                    ne: this.createLatLngObj(ne),
                }
            }
        }
        return null;
    }

    fitBounds(boundsToFit) {
        if (this.map) {
            let bounds = new google.maps.LatLngBounds(boundsToFit.sw, boundsToFit.ne);
            this.map.fitBounds(bounds)
        }
    }

    getCenter() {
        if (this.map) {
            return this.createLatLngObj(this.map.getCenter());
        }
        return null;
    }

    refresh() {
        this.createMap();
        return true;
    }
    centerAtAddress(address) {
        if (address) {
            this.getLatLng(address).then((location) => {
                this.centerMap(location);
                return true;
            });
        }
        return false;
    }

    centerAtLatLng(lat, lng) {
        if (lat != null && lng != null) {
            this.centerMap(new google.maps.LatLng(lat, lng))
            return true;
        }
        return false;
    }



    sleep(ms: number) {
        var d = new Date();
        d.setTime(d.getTime() + ms);
        while (new Date().getTime() < d.getTime()) { }
    }
	
	setHeight() {
		if (!this.servoyApi.isInAbsoluteLayout()) {
			if (this.responsiveHeight) {
				this.getNativeElement().style.height = this.responsiveHeight + 'px';
			} else {
				// when responsive height is 0 or undefined, use 100% of the parent container.
				this.getNativeElement().style.height = '100%';
			}
		}
	}


}

export class Marker {
    addressDataprovider: any;
    addressString: string;
    cursor: string;
    position: LatitudeLongitude;
    iconLabel: string;
    title: string;
    iconUrl: string;
    iconMedia: string;
    infoWindowString: string;
    drawRadius: boolean;
    radiusMeters: number;
    radiusColor: string;
    draggable: boolean;
    opacity: number;
    zIndex: number;
    markerId: any;
    userObject: any;
    animation: string;
    clickable: boolean;
    crossOnDrag: boolean;
    visible: boolean;
}

export class RouteSettings {
    optimize: boolean;
    travelMode: string;
    avoidFerries: boolean;
    avoidHighways: boolean;
    avoidTolls: boolean;
}

export class LatitudeLongitude {
    lat: number;
    lng: number;
}

export class RouteResult {
    legs?: Array<Leg>;
    total_distance?: number;
    total_duration?: number;
}

export class Leg {
    start_address: string;
    start_markerId: any;
    end_address: string;
    end_markerId: any;
    distance: string;
    distance_meters: number;
    duration: string;
    duration_seconds: number;
}