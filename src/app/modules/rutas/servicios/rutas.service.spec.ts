import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { Ruta, RutaResponse, Stop, Address, Client } from '../interfaces/ruta.interface';
import { RutasService } from './rutas.service';

describe('RutasService', () => {
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let localizationServiceSpy: jasmine.SpyObj<LocalizationService>;
  let localDatePipeMock: any;
  let service: RutasService;

  beforeEach(() => {
    // Spy para HttpClient
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);

    // Spy para LocalizationService con propiedades observables
    localizationServiceSpy = jasmine.createSpyObj('LocalizationService', ['getCurrentLanguage'], {
      currentLocalization$: new BehaviorSubject({
        langCode: 'es',
        localeCode: 'es-CO',
      }).asObservable(),
      currentLocale$: of('es-CO'),
      currentLang$: of('es'),
    });

    localizationServiceSpy.getCurrentLanguage.and.returnValue('es');

    // Mock simple para LocalDatePipe
    localDatePipeMock = {
      transform: jasmine.createSpy('transform').and.callFake((date, format, toDate) => {
        if (format === 'yyyy-MM-dd') {
          return '2025-04-15';
        }
        return '2025-04-15'; // Para simplificar, siempre devuelve la misma fecha
      }),
    };

    // Creamos el servicio directamente y reemplazamos la propiedad LocalDatePipe
    service = new RutasService(httpClientSpy, localizationServiceSpy);
    // Sobreescribimos la propiedad privada para evitar la instanciación de LocalDatePipe
    Object.defineProperty(service, 'localDatePipe', {
      value: localDatePipeMock,
      writable: true,
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve rutas from the API and transform them correctly', () => {
    // Mock de la dirección
    const mockAddress: Address = {
      id: 'address-001',
      line: 'Calle Principal 123',
      neighborhood: 'Centro',
      city: 'Bogotá',
      state: 'Cundinamarca',
      country: 'Colombia',
      latitude: 4.60971,
      longitude: -74.08175,
    };

    // Mock del cliente
    const mockClient: Client = {
      id: 'client-001',
      full_name: 'Juan Pérez',
      email: 'juan@example.com',
      username: 'juanperez',
      phone: '3001234567',
      id_type: null,
      identification: null,
      created_at: new Date('2024-01-01T10:00:00.000Z'),
      updated_at: null,
      address: mockAddress,
    };

    // Mock de una parada
    const mockStop: Stop = {
      id: 'stop-001',
      client: mockClient,
      address: mockAddress,
      created_at: new Date('2024-01-02T10:00:00.000Z'),
      updated_at: new Date('2024-01-02T10:00:00.000Z'),
    };

    // Mock de la respuesta de la API
    const mockApiResponse: RutaResponse = {
      id: 'route-001',
      date: new Date('2025-04-15T00:00:00.000Z'),
      stops: [mockStop],
      created_at: new Date('2025-04-14T10:00:00.000Z'),
      updated_at: new Date('2025-04-14T10:00:00.000Z'),
    };

    // Resultado esperado después de la transformación
    const expectedRutas: Ruta[] = [
      {
        id: 'stop-001',
        customer_address: 'Calle Principal 123',
        customer_name: 'Juan Pérez',
        customer_phone_number: '3001234567',
        latitude: '4.60971',
        longitude: '-74.08175',
        date: '2025-04-15',
      },
    ];

    // Configuramos el spy para devolver la respuesta mockeada
    httpClientSpy.get.and.returnValue(of(mockApiResponse));

    // Llamamos al método a probar
    service.obtenerRuta().subscribe(rutas => {
      expect(rutas).toEqual(expectedRutas);
      expect(rutas.length).toBe(1);

      // Verificamos que la transformación se hizo correctamente
      expect(rutas[0].customer_address).toBe(mockAddress.line);
      expect(rutas[0].customer_name).toBe(mockClient.full_name);
      expect(rutas[0].customer_phone_number).toBe(mockClient.phone);
      expect(rutas[0].latitude).toBe(mockAddress.latitude.toString());
      expect(rutas[0].longitude).toBe(mockAddress.longitude.toString());

      // Verificamos que se llamó al método transform
      expect(localDatePipeMock.transform).toHaveBeenCalled();

      // Verificamos las llamadas por separado, sin comparar objetos Date directamente
      const calls = localDatePipeMock.transform.calls.all();

      // Primera llamada (para la URL)
      expect(calls[0].args[1]).toBe('yyyy-MM-dd');
      expect(calls[0].args[2]).toBeTrue();

      // Segunda llamada (para la fecha de la ruta)
      expect(calls[1].args[1]).toBeUndefined();
      expect(calls[1].args[2]).toBeTrue();
    });

    // Verificamos que se llamó al API con la URL correcta
    expect(httpClientSpy.get).toHaveBeenCalledWith(
      `${environment.apiUrlCCP}/api/v1/sales/routes/2025-04-15`,
    );
  });

  it('should handle empty stops array', () => {
    // Mock de la respuesta de la API sin paradas
    const mockApiResponseNoStops: RutaResponse = {
      id: 'route-001',
      date: new Date('2025-04-15T00:00:00.000Z'),
      stops: [],
      created_at: new Date('2025-04-14T10:00:00.000Z'),
      updated_at: new Date('2025-04-14T10:00:00.000Z'),
    };

    // Configuramos el spy para devolver la respuesta mockeada
    httpClientSpy.get.and.returnValue(of(mockApiResponseNoStops));

    // Llamamos al método a probar
    service.obtenerRuta().subscribe(rutas => {
      expect(rutas).toEqual([]);
      expect(rutas.length).toBe(0);

      // Verificamos que se llamó al método transform al menos una vez
      expect(localDatePipeMock.transform).toHaveBeenCalled();
    });

    // Verificamos que se llamó al API con la URL correcta
    expect(httpClientSpy.get).toHaveBeenCalledWith(
      `${environment.apiUrlCCP}/api/v1/sales/routes/2025-04-15`,
    );
  });
});
