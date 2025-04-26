import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { RutasService } from '../../servicios/rutas.service';
import { Address, Client, Ruta, RutaResponse, Stop } from '../../interfaces/ruta.interface';

describe('RutasService', () => {
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let localizationServiceSpy: jasmine.SpyObj<LocalizationService>;
  let localDatePipeMock: any;
  let service: RutasService;

  beforeEach(() => {
    // Mock simple para LocalDatePipe
    localDatePipeMock = {
      transform: jasmine.createSpy('transform').and.callFake((date, format, toDate) => {
        if (format === 'yyyy-MM-dd') {
          return '2025-04-15';
        }
        if (date instanceof Date) {
          return new Date(date).toISOString().split('T')[0];
        }
        return date ? new Date(date).toISOString().split('T')[0] : '';
      }),
    };

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
});
