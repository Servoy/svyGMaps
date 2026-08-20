import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { ServoyApiTesting, ServoyPublicTestingModule } from '@servoy/public';
import { SvyGMaps, Marker, RouteSettings } from './svygmaps';

describe('SvyGMaps', () => {
    let fixture: ComponentFixture<SvyGMaps>;
    let component: SvyGMaps;

    async function createComponent(overrides: Record<string, any> = {}) {
        fixture = TestBed.createComponent(SvyGMaps);
        component = fixture.componentInstance;

        const defaults: Record<string, any> = {
            servoyApi: new ServoyApiTesting(),
            apiKey: 'TEST_KEY',
            mapID: 'DEMO_MAP_ID',
            gestureHandling: 'auto',
            fullscreenControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            zoomControl: true,
            zoomLevel: 7,
            useGoogleMapCluster: false,
            useGoogleMapDirections: false,
            markers: [],
            mapEvents: ['click', 'rightclick'],
            markerEvents: ['dblclick', 'dragend', 'rightclick'],
            styleClass: '',
            responsiveHeight: 300,
            mapType: 'roadmap',
            ...overrides
        };

        for (const [key, value] of Object.entries(defaults)) {
            if (value !== undefined) {
                fixture.componentRef.setInput(key, value);
            }
        }

        fixture.detectChanges();
        await fixture.whenStable();
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ServoyPublicTestingModule, SvyGMaps],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        await createComponent();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should render the host div with svy-google-maps class', () => {
        const el = fixture.nativeElement.querySelector('.svy-google-maps') as HTMLElement;
        expect(el).not.toBeNull();
    });

    it('should accept markers input', async () => {
        const markers: Marker[] = [Object.assign(new Marker(), {
            markerId: 'test1',
            latitude: 51.5,
            longitude: -0.1,
            title: 'London'
        })];
        await createComponent({ markers });
        expect(component.markers()).toEqual(markers);
    });

    it('should accept zoomLevel as model input', async () => {
        await createComponent({ zoomLevel: 12 });
        expect(component.zoomLevel()).toBe(12);
    });

    it('should accept directionsSettings input', async () => {
        const settings = Object.assign(new RouteSettings(), {
            optimize: true,
            travelMode: 'DRIVING',
            avoidFerries: false,
            avoidHighways: false,
            avoidTolls: false
        });
        await createComponent({ directionsSettings: settings });
        expect(component.directionsSettings()).toEqual(settings);
    });

    it('should have OnPush change detection', () => {
        const metadata = (SvyGMaps as any).__annotations__?.[0] ??
            (SvyGMaps as any).ɵcmp;
        expect(metadata.onPush ?? metadata.changeDetection).toBeTruthy();
    });

    it('should be standalone', () => {
        const cmp = (SvyGMaps as any).ɵcmp;
        expect(cmp.standalone).toBe(true);
    });
});
