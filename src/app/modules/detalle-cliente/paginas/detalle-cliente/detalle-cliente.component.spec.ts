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
import { CarritoComprasService } from '../../servicios/carrito-compras.service';
import { Storage } from '@ionic/storage-angular';
import { DetalleClienteService } from '../../servicios/detalle-cliente.service';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { Sales } from '../../interfaces/ventas.interface';
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
  onLangChange = of({ lang: 'es' });
  onTranslationChange = of({});
  onDefaultLangChange = of({});
}

// Mock para Storage
class MockStorage {
  create() {
    return Promise.resolve();
  }
  get(key: string) {
    return Promise.resolve(null);
  }
  set(key: string, value: any) {
    return Promise.resolve();
  }
  remove(key: string) {
    return Promise.resolve();
  }
  clear() {
    return Promise.resolve();
  }
}

// Mock para CarritoComprasService
class MockCarritoComprasService {
  setCurrentClient(clientId: string) {}
  getCartItemCount() {
    return of('0');
  }
}

// Mock para DetalleClienteService
class MockDetalleClienteService {
  obtenerVentasPorCliente(clientId: string) {
    const mockSales: Sales[] = [
      {
        id: '001',
        order_number: 'ORD-001',
        total: 1500,
        date: new Date('2025-01-01'),
        status: 'completed',
        client: {
          id: 'client-001',
          full_name: 'Juan Pérez',
          email: 'juan@example.com',
          username: 'juanperez',
          phone: '1234567890',
          id_type: 'CC',
          identification: '123456789',
          role: 'client',
        },
        seller: {
          id: 'seller-001',
          full_name: 'Vendedor Test',
          email: 'vendedor@example.com',
          username: 'vendedor',
          phone: '9876543210',
          id_type: 'CC',
          identification: '987654321',
          role: 'seller',
        },
        items: [],
        deliveries: [],
      },
    ];
    return of(mockSales);
  }
}

// Mock para LocalizationService
class MockLocalizationService {
  initializeLanguage() {
    return Promise.resolve();
  }

  getLanguage() {
    return 'es';
  }

  setLanguage(lang: string) {
    return Promise.resolve();
  }

  getTranslatedLabel(label: string) {
    return label;
  }

  formatDate(date: Date) {
    return date.toLocaleDateString('es');
  }

  onLanguageChange() {
    return of({ lang: 'es' });
  }
}

describe('DetalleClienteComponent', () => {
  let component: DetalleClienteComponent;
  let fixture: ComponentFixture<DetalleClienteComponent>;
  let clientesService: jasmine.SpyObj<ClientesService>;
  let router: jasmine.SpyObj<Router>;
  let carritoComprasService: MockCarritoComprasService;
  let detalleClienteService: MockDetalleClienteService;

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
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        provideHttpClient(),
        { provide: ClientesService, useValue: clientesServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: CarritoComprasService, useClass: MockCarritoComprasService },
        { provide: DetalleClienteService, useClass: MockDetalleClienteService },
        { provide: Storage, useClass: MockStorage },
        { provide: LocalizationService, useClass: MockLocalizationService },
        TranslateStore,
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    // Instead of creating the component directly, we'll create a simple test wrapper component
    TestBed.overrideComponent(DetalleClienteComponent, {
      set: {
        template: '<div>Test component</div>', // Replace the template to avoid using LocalDatePipe
      },
    });

    // Creamos el componente y obtenemos las instancias de los servicios
    fixture = TestBed.createComponent(DetalleClienteComponent);
    component = fixture.componentInstance;
    clientesService = TestBed.inject(ClientesService) as jasmine.SpyObj<ClientesService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    carritoComprasService = TestBed.inject(
      CarritoComprasService,
    ) as unknown as MockCarritoComprasService;
    detalleClienteService = TestBed.inject(
      DetalleClienteService,
    ) as unknown as MockDetalleClienteService;

    // Espiamos los métodos del carritoComprasService
    spyOn(carritoComprasService, 'setCurrentClient').and.callThrough();
    spyOn(carritoComprasService, 'getCartItemCount').and.callThrough();

    // Espiamos el método del detalleClienteService
    spyOn(detalleClienteService, 'obtenerVentasPorCliente').and.callThrough();

    // Detectamos cambios - esto ahora usará nuestra plantilla simplificada
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

  it('should set current client, get cart count, and fetch sales when obtaining client info', () => {
    // Espiamos el método obtenerPedidosCliente
    spyOn(component, 'obtenerPedidosCliente').and.callThrough();
    // Llamamos al método
    component.obtenerInfoCliente();
    // Verificamos que se llama a obtenerPedidosCliente
    expect(component.obtenerPedidosCliente).toHaveBeenCalled();
    // Verificamos que se llama a setCurrentClient con el ID correcto
    expect(carritoComprasService.setCurrentClient).toHaveBeenCalledWith(mockCliente.customer_id);
    // Verificamos que se obtiene el contador del carrito
    expect(carritoComprasService.getCartItemCount).toHaveBeenCalled();
    expect(component.carritoCount).toBeDefined();
  });

  it('should fetch client orders using detalleClienteService', () => {
    // Llamamos al método
    component.obtenerPedidosCliente();
    // Verificamos que se llama al servicio con el ID correcto
    expect(detalleClienteService.obtenerVentasPorCliente).toHaveBeenCalledWith(
      mockCliente.customer_id,
    );
    // Verificamos que se asigna la respuesta al componente
    expect(component.pedidosCliente).toBeDefined();
    expect(component.pedidosCliente?.length).toBe(1);
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

  it('should navigate to videos when navegarAVideoDetalle is called', () => {
    // Aseguramos que hay un cliente seleccionado
    component.clienteSeleccionado = mockCliente;
    // Llamamos al método
    component.navegarAVideoDetalle();
    // Verificamos la navegación
    expect(router.navigate).toHaveBeenCalledWith([
      `/detalle-cliente/${mockCliente.customer_id}/videos`,
    ]);
  });

  it('should navigate to order detail when navegarADetallePedido is called', () => {
    // Aseguramos que hay un cliente seleccionado
    component.clienteSeleccionado = mockCliente;
    const orderId = '123';
    // Llamamos al método
    component.navegarADetallePedido(orderId);
    // Verificamos la navegación
    expect(router.navigate).toHaveBeenCalledWith([
      `/detalle-cliente/${mockCliente.customer_id}/pedido/${orderId}`,
    ]);
  });
});
