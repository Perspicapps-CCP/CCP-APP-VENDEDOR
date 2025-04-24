import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DetalleRutaComponent } from './detalle-ruta.component';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable, of } from 'rxjs';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { Ruta } from '../../interfaces/ruta.interface';

// Mock del traductor
export class MockTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({
      RUTA: {
        TITULO: 'Detalle de Ruta',
        DIRECCION: 'Dirección',
        TELEFONO: 'Teléfono',
        SIN_DIRECCION: 'Sin dirección',
        SIN_TELEFONO: 'Sin teléfono',
        PARADA: 'Parada',
        CERRAR: 'Cerrar',
      },
    });
  }
}
class MockGoogleMaps {
  Map = class {
    constructor() {
      // empty constructor
    }
    setCenter() {
      // empty method
    }
    setZoom() {
      // empty method
    }
    fitBounds() {
      // empty method
    }
  };

  Marker = class {
    constructor(options: any) {
      this.options = options;
    }
    options: any;
    setMap() {
      // empty method
    }
    addListener(event: string, callback: () => void) {
      if (event === 'click') {
        this.clickCallback = callback;
      }
    }
    clickCallback: () => void = () => {
      // empty method
    };
  };

  InfoWindow = class {
    constructor(options: any) {
      this.options = options;
    }
    options: any;
    open() {
      // empty method
    }
    close() {
      // empty method
    }
  };

  LatLngBounds = class {
    constructor() {
      // empty constructor
    }
    extend() {
      // empty method
    }
    getCenter() {
      return { lat: () => 39.731456, lng: () => -2.5081526666666667 };
    }
    getNorthEast() {
      return { lat: () => 41.385064, lng: () => 2.173404 };
    }
    getSouthWest() {
      return { lat: () => 37.392529, lng: () => -5.994072 };
    }
  };

  LatLng = class {
    constructor(lat: number, lng: number) {
      this.lat = lat;
      this.lng = lng;
    }
    lat: number;
    lng: number;
  };

  Size = class {
    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
    }
    width: number;
    height: number;
  };

  Point = class {
    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
    x: number;
    y: number;
  };

  DirectionsService = class {
    route(request: any, callback: (result: any, status: string) => void) {
      callback(
        {
          routes: [
            {
              bounds: new new MockGoogleMaps().LatLngBounds(),
              legs: [
                {
                  start_location: {
                    lat: () => 40.416775,
                    lng: () => -3.70379,
                  },
                  end_location: {
                    lat: () => 41.385064,
                    lng: () => 2.173404,
                  },
                },
              ],
            },
          ],
        },
        'OK',
      );
    }
  };

  DirectionsStatus = {
    OK: 'OK',
  };

  TravelMode = {
    DRIVING: 'DRIVING',
    WALKING: 'WALKING',
    BICYCLING: 'BICYCLING',
    TRANSIT: 'TRANSIT',
  };

  event = {
    addListener: (infoWindow: any, event: string, callback: () => void) => {
      // Do nothing
    },
  };

  MapTypeId = {
    ROADMAP: 'roadmap',
  };
}

describe('DetalleRutaComponent', () => {
  let component: DetalleRutaComponent;
  let fixture: ComponentFixture<DetalleRutaComponent>;
  let mockRutas: Ruta[];
  let originalGoogle: any;
  const mockLibraries: any = {};

  beforeEach(async () => {
    // Guardar la referencia original de Google
    originalGoogle = window.google;

    // Setup del mock de Google
    const mockMaps = new MockGoogleMaps();
    (window as any).google = {
      maps: mockMaps,
      // Mock para importLibrary que devuelve una promesa con la biblioteca de marcadores
      importLibrary: (name: string) => {
        if (name === 'marker') {
          if (!mockLibraries.marker) {
            mockLibraries.marker = {
              Marker: mockMaps.Marker,
            };
          }
          return Promise.resolve(mockLibraries.marker);
        }
        return Promise.resolve({});
      },
    };

    // Mock data
    mockRutas = [
      {
        id: '1',
        customer_address: 'Calle Gran Vía, 1, Madrid',
        customer_name: 'Cliente Madrid',
        customer_phone_number: '+34 910123456',
        latitude: '40.416775',
        longitude: '-3.70379',
        date: '2023-01-01',
      },
      {
        id: '2',
        customer_address: 'Plaça de Catalunya, 1, Barcelona',
        customer_name: 'Cliente Barcelona',
        customer_phone_number: '+34 930123456',
        latitude: '41.385064',
        longitude: '2.173404',
        date: '2023-01-02',
      },
      {
        id: '3',
        customer_address: 'Plaza Nueva, 1, Sevilla',
        customer_name: 'Cliente Sevilla',
        customer_phone_number: '+34 950123456',
        latitude: '37.392529',
        longitude: '-5.994072',
        date: '2023-01-03',
      },
    ];

    await TestBed.configureTestingModule({
      imports: [
        DetalleRutaComponent,
        CommonModule,
        GoogleMapsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: MockTranslateLoader,
          },
        }),
        sharedImports,
        IonButton,
        IonButtons,
        IonContent,
        IonHeader,
        IonTitle,
        IonToolbar,
        IonList,
        IonItem,
        IonLabel,
      ],
      providers: [provideIonicAngular()],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleRutaComponent);
    component = fixture.componentInstance;

    // Proporcionar las rutas al componente
    component.rutas = mockRutas;

    // Hacer un spy en los métodos que queremos comprobar
    spyOn(component, 'loadGoogleMapsApi').and.returnValue(Promise.resolve());
    spyOn(component, 'setupMap').and.callThrough();
    spyOn(component, 'createCustomMarkers').and.callThrough();
    spyOn(component, 'calculateRoute').and.callThrough();
    spyOn(component, 'fitBounds').and.callThrough();

    fixture.detectChanges();
  });

  afterEach(() => {
    // Restaurar la referencia original de Google
    window.google = originalGoogle;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct rutas', () => {
    expect(component.rutas).toEqual(mockRutas);
  });

  it('should load Google Maps API on init', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(component.loadGoogleMapsApi).toHaveBeenCalled();
    expect(component.setupMap).toHaveBeenCalled();
  }));

  it('should calculate center coordinates correctly', () => {
    // Use un spy local solo para este test
    spyOn(console, 'error');

    component.setupMap();

    // Verificación del cálculo del centro
    const expectedLat = (40.416775 + 41.385064 + 37.392529) / 3;
    const expectedLng = (-3.70379 + 2.173404 + -5.994072) / 3;

    expect(component.center.lat).toBeCloseTo(expectedLat, 5);
    expect(component.center.lng).toBeCloseTo(expectedLng, 5);
  });

  it('should call calculateRoute when setupMap is called with valid rutas', () => {
    // Use un spy local solo para este test
    spyOn(console, 'error');

    component.setupMap();
    expect(component.calculateRoute).toHaveBeenCalled();
  });

  it('should create markers after route calculation', fakeAsync(() => {
    // Configuración del Map mock
    const mapMock = new (window as any).google.maps.Map();

    // Asegúrese de que markerLibrary ya esté establecido para evitar la llamada a importLibrary
    component.markerLibrary = {
      Marker: (window as any).google.maps.Marker,
    };

    component.onMapInitialized(mapMock);
    component.calculateRoute();
    tick();

    expect(component.createCustomMarkers).toHaveBeenCalled();
  }));

  it('should extract route coordinates correctly after calculating route', fakeAsync(() => {
    // Configuración del Map mock
    const mapMock = new (window as any).google.maps.Map();

    // Asegúrese de que markerLibrary ya esté establecido para evitar la llamada a importLibrary
    component.markerLibrary = {
      Marker: (window as any).google.maps.Marker,
    };

    component.map = mapMock;
    component.calculateRoute();
    tick();

    // Verificar que se extrajeron las coordenadas correctamente
    expect(component.routeCoordinates.length).toBeGreaterThan(0);
  }));

  it('should calculate appropriate zoom level based on coordinate distance', () => {
    // Modificamos el mock para simular distancias grandes
    const originalLatLngBounds = (window as any).google.maps.LatLngBounds;

    // Mock para distancias grandes (zooms pequeños)
    const mockBoundsLarge = new (window as any).google.maps.LatLngBounds();

    spyOn(mockBoundsLarge, 'getNorthEast').and.returnValue({
      lat: () => 50,
      lng: () => 50,
    });

    spyOn(mockBoundsLarge, 'getSouthWest').and.returnValue({
      lat: () => 0,
      lng: () => 0,
    });

    // Reemplazamos temporalmente el constructor
    (window as any).google.maps.LatLngBounds = class {
      constructor() {
        return mockBoundsLarge;
      }
    };

    component.fitBounds();
    expect(component.zoom).toBeLessThan(8); // Un valor de zoom bajo para distancias grandes

    // Restauramos el constructor original
    (window as any).google.maps.LatLngBounds = originalLatLngBounds;

    // Ahora probamos con un bounds para distancias cortas
    const mockBoundsSmall = new (window as any).google.maps.LatLngBounds();

    spyOn(mockBoundsSmall, 'getNorthEast').and.returnValue({
      lat: () => 0.1,
      lng: () => 0.1,
    });

    spyOn(mockBoundsSmall, 'getSouthWest').and.returnValue({
      lat: () => 0,
      lng: () => 0,
    });

    // Reemplazamos nuevamente el constructor
    (window as any).google.maps.LatLngBounds = class {
      constructor() {
        return mockBoundsSmall;
      }
    };

    component.fitBounds();
    expect(component.zoom).toBeGreaterThan(9); // Un valor de zoom alto para distancias cortas

    // Restauramos el constructor original otra vez
    (window as any).google.maps.LatLngBounds = originalLatLngBounds;
  });

  it('should emit closeModal event when close method is called', () => {
    // Espiar el evento de emisión
    spyOn(component.closeModal, 'emit');

    // Llamar al método close
    component.close();

    // Verificar que se emitió el evento con el valor true
    expect(component.closeModal.emit).toHaveBeenCalledWith(true);
  });
});

// Tests separados para los casos especiales que crean nuevas instancias
describe('DetalleRutaComponent - Casos especiales', () => {
  let originalGoogle: any;

  beforeEach(() => {
    // Guardar la referencia original de Google
    originalGoogle = window.google;

    // Setup del mock de Google
    const mockMaps = new MockGoogleMaps();
    (window as any).google = {
      maps: mockMaps,
      importLibrary: (name: string) => {
        if (name === 'marker') {
          return Promise.resolve({
            Marker: mockMaps.Marker,
          });
        }
        return Promise.resolve({});
      },
    };
  });

  afterEach(() => {
    // Restaurar la referencia original de Google
    window.google = originalGoogle;
  });

  it('should handle empty rutas array', () => {
    TestBed.configureTestingModule({
      imports: [
        DetalleRutaComponent,
        CommonModule,
        GoogleMapsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: MockTranslateLoader,
          },
        }),
        sharedImports,
        IonButton,
        IonButtons,
        IonContent,
        IonHeader,
        IonTitle,
        IonToolbar,
        IonList,
        IonItem,
        IonLabel,
      ],
      providers: [provideIonicAngular()],
    });

    const emptyFixture = TestBed.createComponent(DetalleRutaComponent);
    const emptyComponent = emptyFixture.componentInstance;

    // Establecer un array vacío de rutas
    emptyComponent.rutas = [];

    // Spy localizado solo para este test
    const warnSpy = spyOn(console, 'warn');

    emptyComponent.setupMap();
    expect(warnSpy).toHaveBeenCalledWith('No hay rutas para mostrar');
  });

  it('should handle invalid coordinates', () => {
    TestBed.configureTestingModule({
      imports: [
        DetalleRutaComponent,
        CommonModule,
        GoogleMapsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: MockTranslateLoader,
          },
        }),
        sharedImports,
        IonButton,
        IonButtons,
        IonContent,
        IonHeader,
        IonTitle,
        IonToolbar,
        IonList,
        IonItem,
        IonLabel,
      ],
      providers: [provideIonicAngular()],
    });

    const invalidFixture = TestBed.createComponent(DetalleRutaComponent);
    const invalidComponent = invalidFixture.componentInstance;

    // Establecer rutas con coordenadas inválidas
    invalidComponent.rutas = [
      {
        id: '1',
        customer_address: 'Dirección inválida',
        customer_name: 'Cliente inválido',
        customer_phone_number: '+34 910123456',
        latitude: 'NaN',
        longitude: '-3.70379',
        date: '2023-01-01',
      },
    ];

    // Spy localizado solo para este test
    const errorSpy = spyOn(console, 'error');

    invalidComponent.setupMap();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('should warn when calculating route with less than 2 points', () => {
    TestBed.configureTestingModule({
      imports: [
        DetalleRutaComponent,
        CommonModule,
        GoogleMapsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: MockTranslateLoader,
          },
        }),
        sharedImports,
        IonButton,
        IonButtons,
        IonContent,
        IonHeader,
        IonTitle,
        IonToolbar,
        IonList,
        IonItem,
        IonLabel,
      ],
      providers: [provideIonicAngular()],
    });

    const singlePointFixture = TestBed.createComponent(DetalleRutaComponent);
    const singlePointComponent = singlePointFixture.componentInstance;

    // Establecer una única ruta
    singlePointComponent.rutas = [
      {
        id: '1',
        customer_address: 'Calle Gran Vía, 1, Madrid',
        customer_name: 'Cliente Madrid',
        customer_phone_number: '+34 910123456',
        latitude: '40.416775',
        longitude: '-3.70379',
        date: '2023-01-01',
      },
    ];

    // Spy localizado solo para este test
    const warnSpy = spyOn(console, 'warn');

    singlePointComponent.calculateRoute();
    expect(warnSpy).toHaveBeenCalledWith('Se necesitan al menos 2 puntos para calcular una ruta');
  });
});
