import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DetalleClienteComponent } from './detalle-cliente.component';
import { ClientesService } from 'src/app/modules/clientes/servicios/clientes.service';
import { Cliente } from 'src/app/modules/clientes/interfaces/cliente.interface';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

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
  onLangChange = of({ lang: 'es' });
  onTranslationChange = of({});
  onDefaultLangChange = of({});
}

describe('DetalleClienteComponent', () => {
  let component: DetalleClienteComponent;
  let fixture: ComponentFixture<DetalleClienteComponent>;
  let clientesService: jasmine.SpyObj<ClientesService>;
  let router: jasmine.SpyObj<Router>;

  // Mock de cliente
  const mockCliente: Cliente = {
    customer_id: '001',
    customer_name: 'Juan Pérez',
    identification: '123456789',
    addressString: 'Calle Principal 123',
    phone: '3001234567',
    customer_image: 'https://example.com/image1.jpg',
    isRecentVisit: true,
  };

  beforeEach(async () => {
    // Creamos spies para los servicios
    const clientesServiceSpy = jasmine.createSpyObj('ClientesService', [], {
      clienteSeleccionado: mockCliente,
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Configuramos el TestBed con los módulos necesarios
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        CommonModule,
        MatCardModule,
        DetalleClienteComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: ClientesService, useValue: clientesServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useClass: MockTranslateService },
        TranslateStore,
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA], // Para manejar elementos personalizados y errores no críticos
    }).compileComponents();

    // Creamos el componente y obtenemos las instancias de los servicios
    fixture = TestBed.createComponent(DetalleClienteComponent);
    component = fixture.componentInstance;
    clientesService = TestBed.inject(ClientesService) as jasmine.SpyObj<ClientesService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Detectamos cambios
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load client info from service on init', () => {
    // Verificamos que obtenerInfoCliente se llama en ngOnInit
    spyOn(component, 'obtenerInfoCliente').and.callThrough();
    component.ngOnInit();
    expect(component.obtenerInfoCliente).toHaveBeenCalled();

    // Verificamos que el cliente se ha cargado correctamente
    expect(component.clienteSeleccionado).toEqual(mockCliente);
  });

  it('should navigate back to home if no client is selected', () => {
    // Simulamos que no hay cliente seleccionado
    Object.defineProperty(clientesService, 'clienteSeleccionado', {
      get: () => undefined,
    });

    // Llamamos al método
    component.obtenerInfoCliente();

    // Verificamos que se navega a home
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should call window.history.back when back method is called', () => {
    // Espiamos window.history.back
    spyOn(window.history, 'back');

    // Llamamos al método
    component.back();

    // Verificamos que se llamó window.history.back
    expect(window.history.back).toHaveBeenCalled();
  });

  it('should navigate to catalogoProductos when catalogoArticulos is called', () => {
    // Aseguramos que hay un cliente seleccionado
    component.clienteSeleccionado = mockCliente;

    // Llamamos al método
    component.catalogoArticulos();

    // Verificamos la navegación
    expect(router.navigate).toHaveBeenCalledWith([
      `/detalle-cliente/${mockCliente.customer_id}/catalogoProductos`,
    ]);
  });

  it('should navigate to carritoCompras when irCarritoCompras is called', () => {
    // Aseguramos que hay un cliente seleccionado
    component.clienteSeleccionado = mockCliente;

    // Llamamos al método
    component.irCarritoCompras();

    // Verificamos la navegación
    expect(router.navigate).toHaveBeenCalledWith([
      `/detalle-cliente/${mockCliente.customer_id}/carritoCompras`,
    ]);
  });

  it('should not throw error when navegarAVideoDetalle is called', () => {
    // Verificamos que el método existe y no causa errores al llamarse
    expect(() => {
      component.navegarAVideoDetalle();
    }).not.toThrow();
  });
});
