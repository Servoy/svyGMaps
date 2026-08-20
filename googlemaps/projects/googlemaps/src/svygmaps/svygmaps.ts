import { Component, SimpleChanges, ChangeDetectionStrategy, inject, input, model } from '@angular/core';
import { MarkerClusterer} from "@googlemaps/markerclusterer";
import { ServoyBaseComponent, ServoyPublicService, LoggerFactory, JSEvent, EventLike, WindowRefService } from '@servoy/public';
import { DOCUMENT } from '@angular/common';



@Component({
    selector: 'googlemaps-svy-G-Maps',
    templateUrl: './svygmaps.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true
})
export class SvyGMaps extends ServoyBaseComponent<HTMLDivElement> {
    readonly addressTitle = input<any>(undefined as any);
    readonly apiKey = input<any>(undefined as any);
    readonly mapID = input<any>(undefined as any);
    readonly directionsSettings = input<RouteSettings>(undefined as any);
    readonly fullscreenControl = input<boolean>(undefined as any);
    readonly gestureHandling = input<string>(undefined as any);
    readonly KmlLayerURL = input<any>(undefined as any);
    readonly mapEvents = input<Array<string>>(undefined as any);
    readonly mapType = input<string>(undefined as any);
    readonly mapTypeControl = input<boolean>(undefined as any);
    readonly markerEvents = input<Array<string>>(undefined as any);
    readonly options = input<any>(undefined as any);
    readonly responsiveHeight = input<number>(undefined as any);

    readonly markers = model<Array<Marker>>([] as any);

    readonly streetViewControl = input<boolean>(undefined as any);
    readonly styleClass = input<string>(undefined as any);
    readonly useGoogleMapCluster = input<boolean>(undefined as any);
    readonly useGoogleMapDirections = input<boolean>(undefined as any);
    readonly zoomControl = input<boolean>(undefined as any);
    readonly zoomLevel = model<any>(undefined as any);

    readonly onMapEvent = input<(e: JSEvent, latlng: any) => void>(undefined as any);
    readonly onMarkerEvent = input<(e: JSEvent, index: number, latlng: any) => void>(undefined as any);
    readonly onMarkerGeocoded = input<(marker: Marker, ltdlng: LatitudeLongitude) => void>(undefined as any);
    readonly onRouteChanged = input<(route: RouteResult) => void>(undefined as any);

    map!: google.maps.Map;
    mapMarkers!: Map<string, google.maps.marker.AdvancedMarkerElement>;
    directionsDisplay!: google.maps.DirectionsRenderer;
    geocoder!: google.maps.Geocoder;
    kmlLayer!: google.maps.KmlLayer;
    getScriptInt: any;

    private AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement | undefined;

    private servoyService = inject(ServoyPublicService);
    private windowRefService = inject(WindowRefService);
    private document = inject(DOCUMENT);
    private log = inject(LoggerFactory).getLogger('svy-google-maps');

    svyOnInit() {
        super.svyOnInit();
        (this.windowRefService.nativeWindow as any)['googleMapsLoadedCallback'] = () => {
            this.initMap();
        }

        if ((this.windowRefService.nativeWindow as any)['google'] && (this.windowRefService.nativeWindow as any)['google'].maps) {
            this.initMap();
        } else {
            this.getScriptInt = this.windowRefService.nativeWindow.setInterval(() => {
                if (!this.apiKey() && this.servoyApi().isInDesigner()) {
                    this.showErrMessage(true);
                } else if (!this.apiKey()) {
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
                const location: Array<any> = [];
                for (const googleMarker of this.markers()) {
                    if (this.mapMarkers && googleMarker.markerId && this.mapMarkers.has(googleMarker.markerId)) {
                        location.push(this.mapMarkers.get(googleMarker.markerId)!.position);
                    } else if (googleMarker.position != null) {
                        location.push(new google.maps.LatLng(googleMarker.position.lat, googleMarker.position.lng));
                    }
                    else if (googleMarker.addressDataprovider || googleMarker.addressString) {
                        location.push(this.getLatLng(googleMarker.addressDataprovider || googleMarker.addressString));
                    }
                }
                Promise.all(location).then((returnVals: any[]) => {
                    for (let i = 0; i < returnVals.length; i++) {
                        location[i] = returnVals[i];
                        const marker = this.markers()[i];
                        if (!marker.position || marker.position.lat == null || marker.position.lng == null) {
                            marker.position = this.createLatLngObj(location[i]);
                            if (this.onMarkerGeocoded()) {
                                this.onMarkerGeocoded()(marker, marker.position);
                            }
                        }
                    }
                }).then(() => {
                    this.mapMarkers.forEach((_value, m) => {
                        let modelMarker: Marker | null = null;
                        for (let n = 0; n < this.markers().length; n++) {
                            if (this.markers()[n].markerId == m) {
                                modelMarker = this.markers()[n];
                                break;
                            }
                        }
                        if (!modelMarker) {
                            const existing = this.mapMarkers.get(m);
                            if (existing) existing.map = null;
                            this.mapMarkers.delete(m);
                        } else {
                            const existing = this.mapMarkers.get(m)!;
                            (existing as any).animation = modelMarker.animation ? (google.maps.Animation as any)[modelMarker.animation.toUpperCase()] : null;
                            (existing as any).clickable = modelMarker.clickable;
                            existing.gmpDraggable = modelMarker.draggable;
                            (existing as any).crossOnDrag = modelMarker.crossOnDrag;
                            (existing as any).cursor = modelMarker.cursor;
                            (existing as any).icon = modelMarker.iconUrl || modelMarker.iconMedia;
                            (existing as any).label = modelMarker.iconLabel;
                            (existing as any).opacity = modelMarker.opacity;
                            (existing as any).visible = modelMarker.visible;
                            existing.zIndex = modelMarker.zIndex;
                            existing.title = modelMarker.title || modelMarker.tooltip;


                            if (modelMarker.position != null) {
                                existing.position = new google.maps.LatLng(modelMarker.position.lat, modelMarker.position.lng);
                            } else if (modelMarker.latitude != null && modelMarker.longitude != null) {
                                existing.position = new google.maps.LatLng(modelMarker.latitude, modelMarker.longitude);
                            }
                        }
                    });

                    if (this.useGoogleMapDirections() == true) {
                        this.mapMarkers = new Map()
                        const directionsService = new google.maps.DirectionsService;
                        if (this.directionsDisplay) {
                            this.directionsDisplay.setMap(null);
                        }
                        this.directionsDisplay = new google.maps.DirectionsRenderer;

                        this.directionsDisplay.setMap(this.map);
                        this.calculateAndDisplayRoute(directionsService, location as Array<google.maps.LatLng>);
                    } else {
                        const markers = location.map((loc: any, i: number) => {
                            return this.mapMarkers.get(this.markers()[i].markerId) || this.createMarker(loc, i);
                        });

                        const filteredLocation = location.filter((loc: any) => {
                            return loc != null;
                        });

                        if (filteredLocation.length > 1) {
                            const bounds = new google.maps.LatLngBounds();
                            for (let i = 0; i < markers.length; i++) {
                                if (markers[i]) bounds.extend(markers[i]!.position!);
                            }
                            this.map.fitBounds(bounds);
                        } else if (filteredLocation.length == 1) {
                            if (markers[0]) this.map.setCenter(markers[0]!.position!);
                        }
                    }
                });
            } else {
                this.createMap();
            }
        }
        if (changes['zoomLevel'] && this.map) {
            try {
                this.map.setZoom(this.zoomLevel());
            } catch (_e) { /* ignored */ }
        }
        if (changes['KmlLayerURL'] && this.map) {
            if (this.KmlLayerURL()) {
                this.kmlLayer = new google.maps.KmlLayer({
                    url: this.KmlLayerURL(),
                    map: this.map
                });
            } else {
                if (this.kmlLayer) {
                    this.kmlLayer.setMap(null);
                }
            }
        }
        if (changes['options'] && this.map) {
            this.map.setOptions(this.options());
        }
		if (changes['responsiveHeight']) {
			this.setHeight();
		}
    }

    async createMap() {
        
        if (!this.geocoder) {
            return;
        }
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

        this.AdvancedMarkerElement = AdvancedMarkerElement;

        this.log.debug('Google Maps API loaded, creating map...');

        if (this.mapMarkers && this.mapMarkers.size > 0) {
            this.mapMarkers.forEach((marker) => {
                marker.map = null;
            });
        }
        this.mapMarkers = new Map();

        const location: Array<any> = [];
        for (const googleMarker of this.markers()) {
            if (googleMarker.position != null) {
                location.push(new google.maps.LatLng(googleMarker.position.lat, googleMarker.position.lng));
            } else if (googleMarker.addressDataprovider || googleMarker.addressString) {
                location.push(this.getLatLng(googleMarker.addressDataprovider || googleMarker.addressString));
            }
        }

        try {
            const resolvedLocations = await Promise.all(location) as Array<google.maps.LatLng>;
            this.createMapAtPoint(resolvedLocations);
        } catch (error) {
            this.log.error("Error resolving locations:", error);
        }
    }

    getLatLng(address: any): Promise<google.maps.LatLng | null> {
        return new Promise((resolve) => {
            this.geocoder.geocode({
                address: address
            }, (results, status) => {
                if (status == google.maps.GeocoderStatus.OK) {
                    resolve(results![0].geometry.location);
                } else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                    this.log.warn('Google maps Geocoder query limit reached, geocoding pauses for 2 seconds');
                    this.sleep(2000);
                    resolve(this.getLatLng(address) as any);
                } else {
                    this.log.error('Could not geocode location ' + address);
                    resolve(null);
                }
            });
        });
    }

    calculateAndDisplayRoute(directionsService: google.maps.DirectionsService, location: Array<google.maps.LatLng>) {
        let routeSettings = this.directionsSettings();
        if (!routeSettings) {
            routeSettings = {
                optimize: true,
                travelMode: "driving",
                avoidFerries: false,
                avoidHighways: false,
                avoidTolls: false
            } as RouteSettings;
        }

        const waypts: google.maps.DirectionsWaypoint[] = [];
        for (let i = 1; i < (location.length - 1); i++) {
            waypts.push({
                location: new google.maps.LatLng(location[i].lat(), location[i].lng()),
                stopover: true
            });
        }

        directionsService.route({
            origin: new google.maps.LatLng(location[0].lat(), location[0].lng()),
            destination: new google.maps.LatLng(location[location.length - 1].lat(), location[location.length - 1].lng()),
            waypoints: waypts,
            travelMode: google.maps.TravelMode[routeSettings.travelMode.toUpperCase() as keyof typeof google.maps.TravelMode],
            optimizeWaypoints: routeSettings.optimize,
            avoidFerries: routeSettings.avoidFerries,
            avoidHighways: routeSettings.avoidHighways,
            avoidTolls: routeSettings.avoidTolls
        }, (response, status) => {
            if (status === 'OK' && response) {
                this.directionsDisplay.setDirections(response);
                const calculatedRoute: RouteResult = {};
                calculatedRoute.legs = [];

                let totalMeters = 0;
                let totalSeconds = 0;

                for (let l = 0; l < response.routes[0].legs.length; l++) {
                    const routeLeg = response.routes[0].legs[l];
                    let startMarkerIndex: number;
                    if (l == 0) {
                        startMarkerIndex = 0;
                    } else {
                        startMarkerIndex = response.routes[0].waypoint_order[l - 1] + 1;
                    }
                    let endMarkerIndex: number;
                    if (l == (response.routes[0].legs.length - 1)) {
                        endMarkerIndex = this.markers().length - 1;
                    } else {
                        endMarkerIndex = response.routes[0].waypoint_order[l] + 1;
                    }
                    const leg = {
                        start_address: routeLeg.start_address,
                        start_markerId: this.markers()[startMarkerIndex].markerId,
                        end_address: routeLeg.end_address,
                        end_markerId: this.markers()[endMarkerIndex].markerId,
                        distance: routeLeg.distance!.text,
                        distance_meters: routeLeg.distance!.value,
                        duration: routeLeg.duration!.text,
                        duration_seconds: routeLeg.duration!.value,
                    }
                    totalMeters += leg.distance_meters;
                    totalSeconds += leg.duration_seconds;
                    calculatedRoute.legs.push(leg);
                }

                calculatedRoute.total_distance = totalMeters;
                calculatedRoute.total_duration = totalSeconds;

                if (this.onRouteChanged()) {
                    this.onRouteChanged()(calculatedRoute);
                }

            } else {
                this.log.warn('Directions request failed due to ' + status);
            }
        });
    }

    createCustomMarkerContent(markerData: Marker): HTMLElement {
        const container = document.createElement("div");
        container.style.flexDirection = "column";
        container.style.alignItems = "center";

        if (!markerData.visible) {
            container.style.display = "none";
        }

        if (markerData.opacity !== undefined && markerData.opacity >= 0 && markerData.opacity <= 1) {
            container.style.opacity = markerData.opacity.toString();
        }

        if (markerData.cursor) {
            container.style.cursor = markerData.cursor;
        }

        if (markerData.clickable === false) {
            container.style.setProperty("pointerEvents", "none", "important");
                 
            container.addEventListener("click", (event) => {
                event.stopPropagation();
            });
        }

        if (markerData.animation) {
            if (markerData.animation === "DROP" || markerData.animation === "drop") {
                container.classList.add("drop-animation");
            } else if (markerData.animation === "BOUNCE" || markerData.animation === "bounce") {
                container.classList.add("bounce-animation");
            }
        }
        if (markerData.iconUrl || markerData.iconMedia) {
            const img = document.createElement("img");
            img.src = markerData.iconUrl || markerData.iconMedia;
            img.style.width = "25px";
            img.style.height = "23px";
			
			container.style.display = "flex";

            container.appendChild(img);
        } else {
            const img = document.createElement("img");
            img.src = "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
            img.style.width = "40px";
            img.style.height = "40px";
            container.style.display = "flex";
            container.appendChild(img);
        }

        if (markerData.iconLabel) {
            const label = document.createElement("span");
            label.innerText = markerData.iconLabel;
            label.style.fontSize = "12px";
            label.style.color = "black";
            container.appendChild(label);
        }
    
        return container;
    }

    createMarker(location: any, markerIndex: number): google.maps.marker.AdvancedMarkerElement | null {
        if (!location) {
            return null;
        }

        const marker = this.markers()[markerIndex];

        const markerObj: google.maps.marker.AdvancedMarkerElementOptions = {
            position: new google.maps.LatLng(location.lat(), location.lng()),
            map: this.map,
            title: marker.title,
            gmpDraggable: marker.draggable,
            zIndex: marker.zIndex != null ? marker.zIndex : undefined,
        }


        let gMarker: google.maps.marker.AdvancedMarkerElement | undefined;
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
        this.mapMarkers.set(marker.markerId || ('marker-' + markerIndex), gMarker!);

        if (marker.infoWindowString) {
            const infowindow = new google.maps.InfoWindow({
                content: marker.infoWindowString
            });

            gMarker!.addListener("click", () => {
                infowindow.open(this.map, gMarker);
            });
        }

        if (this.onMarkerEvent() && this.markerEvents()) {
            for (let e = 0; e < this.markerEvents().length; e++) {
                const eventType = this.markerEvents()[e];
                ((eventType: string) => {
                    gMarker!.addListener(eventType, (evt: any) => {
                        const jsEvent = this.createJSEvent(evt, eventType);
                        const data = jsEvent.data as { marker: Marker, latLng: LatitudeLongitude}
                        data.marker = marker;
                        let index = -1;
                        for (let i = 0; i < this.markers().length; i++) {
                            if (this.markers()[i].markerId == marker.markerId) {
                                index = i;
                                break;
                            }
                        }
                        if (eventType == 'dragend' && data.latLng) {
                            this.markers()[index].position = data.latLng;
                            this.markers.set([...this.markers()]);
                        }

                        this.onMarkerEvent()(jsEvent, index, data && data.latLng ? data.latLng : null);
                    });
                })(eventType);
            }
        }

        if (marker.drawRadius == true) {
            const circle = new google.maps.Circle({
                center: gMarker!.position!,
                map: this.map,
                radius: marker.radiusMeters || 2000,
                fillColor: marker.radiusColor || "#AA0000",
                strokeColor: marker.radiusColor || "#AA0000"
            });
            gMarker!.addEventListener("position_changed", () => {
                circle.setCenter(gMarker!.position!);
            });
        }
        return gMarker!;
    }

    createLatLngObj(latLng: google.maps.LatLng | null | undefined): any {
        let result: any = null;
        if (latLng) {
            result = {
                lat: latLng.lat(),
                lng: latLng.lng()
            }
        }
        return result;
    }

    createJSEvent(evt: any, eventType: string) {
        let mouseEvent: any = null;
        for (const p in evt) {
            if (evt[p] instanceof MouseEvent) {
                mouseEvent = evt[p];
                break;
            }
        }
        if (!mouseEvent || !mouseEvent.target) {
            const me: EventLike = { target: this.getNativeElement() };
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

        const jsEvent = this.servoyService.createJSEvent(mouseEvent as EventLike, eventType);
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

        const mapOptions: any = {};
        if (this.options()) {
            Object.assign(mapOptions, this.options());
        }

        const centerLocation = (location.length === 1)
            ? new google.maps.LatLng(location[0].lat(), location[0].lng())
            : new google.maps.LatLng(0, 0);

        let mapTypeId = google.maps.MapTypeId.ROADMAP;
        if (this.mapType() === "SATELLITE") {
            mapTypeId = google.maps.MapTypeId.SATELLITE;
        } else if (this.mapType() === "HYBRID") {
            mapTypeId = google.maps.MapTypeId.HYBRID;
        } else if (this.mapType() === "TERRAIN") {
            mapTypeId = google.maps.MapTypeId.TERRAIN;
        }
        Object.assign(mapOptions, {
            center: centerLocation,
            zoom: this.zoomLevel() ?? 7,
            zoomControl: this.zoomControl(),
            mapTypeControl: this.mapTypeControl(),
            streetViewControl: this.streetViewControl(),
            fullscreenControl: this.fullscreenControl(),
            mapTypeId: mapTypeId,
            gestureHandling: this.gestureHandling(),
            mapId: !this.mapID() ? 'DEMO_MAP_ID': this.mapID()
        });

        const nativeElement = this.getNativeElement();
        if (nativeElement) {
            this.map = new google.maps.Map(nativeElement, mapOptions);
        } else {
            this.log.error("The map container element is invalid.");
        }

        if (this.useGoogleMapDirections() == true) {
            this.log.info('Google Directions enabled, start building route');
            if (location.length > 1) {
                const directionsService = new google.maps.DirectionsService;

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
            const markers = location.map((loc, i) => {
                return this.createMarker(loc, i);
            });

            if (this.onMapEvent() && this.mapEvents()) {
                for (let m = 0; m < this.mapEvents().length; m++) {
                    const eventType = this.mapEvents()[m];
                    ((eventType: string) => {
                        this.map.addListener(eventType, (evt: any) => {
                            const jsEvent = this.createJSEvent(evt, eventType);
                            const data = jsEvent.data as { latLng: LatitudeLongitude};
                            this.onMapEvent()(jsEvent, jsEvent.data && data.latLng ? data.latLng : null);
                        })
                    })(eventType)
                }
            }

            if (this.useGoogleMapCluster() == true) {
                this.log.info('Google Map Clusterview enabled');
                
                new MarkerClusterer({ map: this.map, markers: markers as any[]});
            }

            if (location.length > 1) {
                const bounds = new google.maps.LatLngBounds();
                for (let i = 0; i < markers.length; i++) {
                    if (markers[i]) bounds.extend(markers[i]!.position!);
                }
                this.map.fitBounds(bounds);
            }
        }

        this.windowRefService.nativeWindow.addEventListener("resize", () => {
            const center = this.map.getCenter();
            google.maps.event.trigger(this.map, "resize");
            if (center) this.map.setCenter(center);
        });

        this.map.addListener('zoom_changed', () => {
            if (this.zoomLevel() !== null && this.zoomLevel() !== undefined) {
                const currLevel = this.map.getZoom();
                if (this.zoomLevel() != currLevel) {
                    this.zoomLevel.set(currLevel);
                }
            }
        });
    }

    loadScript() {
        const script = this.document.createElement("script")
        script.id = "googleMapsScript"
        script.type = "text/javascript"
        script.async = true;
        script.defer = true;

        script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey()}&libraries=geocoding,marker&callback=googleMapsLoadedCallback&loading=async`;  

        this.document.body.appendChild(script);
    }

    unloadScript() {
        try {
            const script = this.document.getElementById('googleMapsScript');
            if (script?.parentElement) script.parentElement.removeChild(script);
            const errContainer = this.document.getElementsByClassName('gm-err-container')[0];
            if (errContainer?.parentElement) errContainer.parentElement.removeChild(errContainer);
        } catch (_e) { /* ignored */ }
    }

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

    centerMap(latlong: any) {
        this.map.setCenter(latlong);
    }

    getBounds() {
        if (this.map) {
            const latLngBounds = this.map.getBounds();
            if (latLngBounds) {
                const sw = latLngBounds.getSouthWest();
                const ne = latLngBounds.getNorthEast();
                return {
                    sw: this.createLatLngObj(sw),
                    ne: this.createLatLngObj(ne),
                }
            }
        }
        return null;
    }

    fitBounds(boundsToFit: any) {
        if (this.map) {
            const bounds = new google.maps.LatLngBounds(boundsToFit.sw, boundsToFit.ne);
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
    centerAtAddress(address: any) {
        if (address) {
            this.getLatLng(address).then((location) => {
                this.centerMap(location);
                return true;
            });
        }
        return false;
    }

    centerAtLatLng(lat: any, lng: any) {
        if (lat != null && lng != null) {
            this.centerMap(new google.maps.LatLng(lat, lng))
            return true;
        }
        return false;
    }



    sleep(ms: number) {
        const d = new Date();
        d.setTime(d.getTime() + ms);
        while (new Date().getTime() < d.getTime()) { /* busy wait */ }
    }
	
	setHeight() {
		if (!this.servoyApi().isInAbsoluteLayout()) {
			if (this.responsiveHeight()) {
				this.getNativeElement().style.height = this.responsiveHeight() + 'px';
			} else {
				this.getNativeElement().style.height = '100%';
			}
		}
	}


}

export class Marker {
    addressDataprovider!: any;
    addressString!: string;
    cursor!: string;
    position!: LatitudeLongitude;
    iconLabel!: string;
    title!: string;
    tooltip!: string;
    iconUrl!: string;
    iconMedia!: string;
    infoWindowString!: string;
    drawRadius!: boolean;
    radiusMeters!: number;
    radiusColor!: string;
    draggable!: boolean;
    latitude!: number;
    longitude!: number;
    opacity!: number;
    zIndex!: number;
    markerId!: any;
    userObject!: any;
    animation!: string;
    clickable!: boolean;
    crossOnDrag!: boolean;
    visible!: boolean;
}

export class RouteSettings {
    optimize!: boolean;
    travelMode!: string;
    avoidFerries!: boolean;
    avoidHighways!: boolean;
    avoidTolls!: boolean;
}

export class LatitudeLongitude {
    lat!: number;
    lng!: number;
}

export class RouteResult {
    legs?: Array<Leg>;
    total_distance?: number;
    total_duration?: number;
}

export class Leg {
    start_address!: string;
    start_markerId!: any;
    end_address!: string;
    end_markerId!: any;
    distance!: string;
    distance_meters!: number;
    duration!: string;
    duration_seconds!: number;
}
