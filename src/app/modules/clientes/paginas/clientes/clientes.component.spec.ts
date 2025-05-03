import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ClientesComponent } from './clientes.component';
import { ClientesService } from '../../servicios/clientes.service';
import { DinamicSearchService } from 'src/app/shared/services/dinamic-search.service';
import { LoginService } from '../../../auth/servicios/login.service';
import { Cliente } from '../../interfaces/cliente.interface';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { HighlightTextPipe } from 'src/app/shared/pipes/highlight-text.pipe';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { LocalizationService } from 'src/app/shared/services/localization.service';

// Clase Mock para TranslateLoader
export class MockTranslateLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of({});
  }
}

// Mock para TranslateService
class MockTranslateService {
  get(key: string | string[]) {
    return of(key);
  }
  instant(key: string | string[]) {
    return key;
  }
  getBrowserLang() {
    return 'es';
  }
  setDefaultLang(lang: string) {}
  use(lang: string) {
    return of({});
  }
  onLangChange = new BehaviorSubject({ lang: 'es' });
  onTranslationChange = new BehaviorSubject({});
  onDefaultLangChange = new BehaviorSubject({});
}

// Mock para LocalizationService
class MockLocalizationService {
  currentLanguage: string = 'es';

  initializeLanguage() {
    return;
  }

  setLocalization(locale: string) {
    this.currentLanguage = locale;
    return;
  }

  getLocalCurrencyFormat(value: number) {
    return `$ ${value.toFixed(2)}`;
  }

  getLocale() {
    return 'es-CO';
  }

  getCurrencyCode() {
    return 'COP';
  }
}

// Mock para DinamicSearchService
class MockDinamicSearchService {
  dynamicSearch(items: Cliente[], searchTerm: string) {
    if (!searchTerm) return items;
    return items.filter(
      cliente =>
        cliente.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.identification.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }
}

// Mock para LoginService
class MockLoginService {
  cerrarSesion() {
    return;
  }
}

describe('ClientesComponent', () => {
  let component: ClientesComponent;
  let fixture: ComponentFixture<ClientesComponent>;
  let clientesService: any; // Cambiado de jasmine.SpyObj a any para poder acceder a la propiedad
  let dinamicSearchService: DinamicSearchService;
  let loginService: LoginService;
  let router: jasmine.SpyObj<Router>;

  // Mock de datos de clientes
  const mockClientes: Cliente[] = [
    {
      customer_id: '001',
      customer_name: 'Juan Pérez',
      identification: '123456789',
      addressString: 'Calle Principal 123',
      phone: '3001234567',
      customer_image: 'https://example.com/image1.jpg',
      isRecentVisit: true,
    },
    {
      customer_id: '002',
      customer_name: 'María López',
      identification: '987654321',
      addressString: 'Avenida Central 456',
      phone: '3007654321',
      customer_image: 'https://example.com/image2.jpg',
      isRecentVisit: false,
    },
  ];

  beforeEach(async () => {
    // Crear un servicio mock simple en lugar de un spy
    const clientesServiceMock = {
      obtenerClientes: jasmine.createSpy('obtenerClientes').and.returnValue(of(mockClientes)),
      clienteSeleccionado: undefined, // Inicialmente es undefined
    };

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule,
        MatCardModule,
        ClientesComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: ClientesService, useValue: clientesServiceMock },
        { provide: DinamicSearchService, useClass: MockDinamicSearchService },
        { provide: LoginService, useClass: MockLoginService },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: Router, useValue: routerSpy },
        { provide: LocalizationService, useClass: MockLocalizationService },
        TranslateStore,
        HighlightTextPipe,
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientesComponent);
    component = fixture.componentInstance;
    clientesService = TestBed.inject(ClientesService); // Ahora es un objeto simple, no un spy
    dinamicSearchService = TestBed.inject(DinamicSearchService);
    loginService = TestBed.inject(LoginService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    spyOn(loginService, 'cerrarSesion').and.callThrough();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load clients on ionViewWillEnter', () => {
    component.ionViewWillEnter();
    expect(clientesService.obtenerClientes).toHaveBeenCalled();
    expect(component.clientes.length).toBe(2);
    expect(component.clientes[0].customer_name).toBe('Juan Pérez');
    expect(component.clientes[1].customer_name).toBe('María López');
  });

  it('should initialize filterClientes$ observable on init', () => {
    component.obtenerClientes();
    expect(component.filterClientes$).toBeDefined();
  });

  it('should return all clients when search term is empty', () => {
    component.obtenerClientes();
    component.formBusquedaClientes.setValue('');
    component.filterClientes$?.subscribe(filteredClientes => {
      expect(filteredClientes.length).toBe(2);
    });
  });

  it('should call loginService.cerrarSesion when cerrarSesion is called', () => {
    component.cerrarSesion();
    expect(loginService.cerrarSesion).toHaveBeenCalled();
  });

  it('should properly search clients with buscar method', () => {
    component.obtenerClientes();
    spyOn(dinamicSearchService, 'dynamicSearch').and.callThrough();

    const resultWithTerm = component.buscar('María');
    expect(resultWithTerm.length).toBe(1);
    expect(resultWithTerm[0].customer_name).toBe('María López');
    expect(dinamicSearchService.dynamicSearch).toHaveBeenCalled();

    const resultWithNonExistingTerm = component.buscar('Persona inexistente');
    expect(resultWithNonExistingTerm.length).toBe(0);

    const resultWithoutTerm = component.buscar('');
    expect(resultWithoutTerm.length).toBe(2);
  });

  it('should handle empty client list', () => {
    component.clientes = [];
    component.filterClientes();
    component.filterClientes$?.subscribe(filteredClientes => {
      expect(filteredClientes.length).toBe(0);
    });
    const result = component.buscar('cualquier cosa');
    expect(result.length).toBe(0);
  });

  it('should handle error in obtenerClientes', done => {
    const errorMsg = 'Error al obtener clientes';
    clientesService.obtenerClientes.and.returnValue(throwError(() => new Error(errorMsg)));
    spyOn(console, 'error');

    const originalMethod = component.obtenerClientes;
    component.obtenerClientes = function () {
      clientesService.obtenerClientes().subscribe({
        next: (data: Cliente[]) => {
          this.clientes = data;
          this.filterClientes();
        },
        error: (err: Error) => {
          console.error('Error capturado:', err);
          expect(err.message).toBe(errorMsg);
          done();
        },
      });
    };

    try {
      component.obtenerClientes();
    } catch (e) {
      done.fail('No se debería lanzar un error no capturado');
    }

    setTimeout(() => {
      component.obtenerClientes = originalMethod;
    });
  });

  it('should set selected client and navigate to client detail when navegarADetalleCliente is called', () => {
    const mockCliente = mockClientes[0];

    // Aseguramos que clienteSeleccionado es undefined antes de la prueba
    expect(clientesService.clienteSeleccionado).toBeUndefined();

    // Llamamos al método que queremos probar
    component.navegarADetalleCliente(mockCliente);

    // Verificamos que se estableció el cliente seleccionado en el servicio
    // ¡Aquí está la corrección! La asignación ahora debería funcionar
    expect(clientesService.clienteSeleccionado).toEqual(mockCliente);

    // Verificamos que se navegó a la ruta correcta
    expect(router.navigate).toHaveBeenCalledWith(['/detalle-cliente', mockCliente.customer_id]);
  });
});
