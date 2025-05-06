import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CarritoComprasComponent } from './carrito-compras.component';
import { ClientesService } from 'src/app/modules/clientes/servicios/clientes.service';
import { Cliente } from 'src/app/modules/clientes/interfaces/cliente.interface';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { CarritoComprasService } from '../../servicios/carrito-compras.service';
import { Storage } from '@ionic/storage-angular';
import { Producto } from '../../interfaces/productos.interface';
import { LocalCurrencyPipe } from 'src/app/shared/pipes/local-currency.pipe';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { LOCALE_ID } from '@angular/core';

// Importamos los datos de localización específicos para colombiano
import localeEsCo from '@angular/common/locales/es-CO';

// Registramos los datos de localización
registerLocaleData(localeEsCo);

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

// Mock para LocalizationService con todos los métodos necesarios
class MockLocalizationService {
  currentLanguage: string = 'es';

  initializeLanguage() {
    // Mock implementation
    return;
  }

  setLocalization(locale: string) {
    this.currentLanguage = locale;
    return;
  }

  getLocalCurrencyFormat(value: number) {
    // Implementación simple sin usar CurrencyPipe
    return `$ ${value.toFixed(2)}`;
  }

  getLocale() {
    return 'es-CO';
  }

  getCurrencyCode() {
    return 'COP';
  }
}

// Mock para LocalCurrencyPipe que no dependa de CurrencyPipe
class MockLocalCurrencyPipe {
  transform(value: number): string {
    return `$ ${value.toFixed(2)}`;
  }
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

// Productos mock para el carrito
const mockProductosCarrito: Producto[] = [
  {
    product_id: 'P001',
    product_name: 'Producto 1',
    product_code: 'PROD-001',
    manufacturer_name: 'Fabricante 1',
    price: 100,
    price_currency: '$ 100.00',
    images: ['imagen1.jpg'],
    quantity: 10,
    quantity_selected: 2,
  },
  {
    product_id: 'P002',
    product_name: 'Producto 2',
    product_code: 'PROD-002',
    manufacturer_name: 'Fabricante 2',
    price: 200,
    price_currency: '$ 200.00',
    images: ['imagen2.jpg'],
    quantity: 5,
    quantity_selected: 1,
  },
];

// Mock para CarritoComprasService - Ahora con productAvailabilityChanged$
class MockCarritoComprasService {
  // Agregar el Subject para simular cambios en el inventario
  productAvailabilityChanged$ = new Subject<string | null>();

  getCurrentCart() {
    return [...mockProductosCarrito];
  }
  removeFromCurrentCart(productId: string) {
    // Simulamos la eliminación, aunque no cambiamos el array original para simplificar
    return true;
  }
  updateProductQuantity(productId: string, quantity: number) {
    // Simulamos la actualización
    return true;
  }
}

describe('CarritoComprasComponent', () => {
  let component: CarritoComprasComponent;
  let fixture: ComponentFixture<CarritoComprasComponent>;
  let clientesService: any;
  let router: jasmine.SpyObj<Router>;
  let carritoComprasService: MockCarritoComprasService;

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
    // Creamos un objeto simple para el servicio
    const clientesServiceMock = {
      clienteSeleccionado: mockCliente,
    };

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Configuramos TestBed
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        CarritoComprasComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: ClientesService, useValue: clientesServiceMock },
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: CarritoComprasService, useClass: MockCarritoComprasService },
        { provide: Storage, useClass: MockStorage },
        { provide: LocalizationService, useClass: MockLocalizationService },
        { provide: LocalCurrencyPipe, useClass: MockLocalCurrencyPipe }, // Usamos un mock para el pipe
        { provide: LOCALE_ID, useValue: 'es-CO' }, // Proporcionamos el LOCALE_ID
        TranslateStore,
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    // Obtenemos instancias
    fixture = TestBed.createComponent(CarritoComprasComponent);
    component = fixture.componentInstance;
    clientesService = TestBed.inject(ClientesService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    carritoComprasService = TestBed.inject(
      CarritoComprasService,
    ) as unknown as MockCarritoComprasService;

    // Espiamos los métodos del carritoComprasService
    spyOn(carritoComprasService, 'getCurrentCart').and.callThrough();
    spyOn(carritoComprasService, 'removeFromCurrentCart').and.callThrough();
    spyOn(carritoComprasService, 'updateProductQuantity').and.callThrough();

    // Para evitar errores con el pipe, creamos un método de formato de moneda para las pruebas
    // Usando 'as any' para evitar el error de propiedad
    (component as any).formatCurrency = (value: number) => `$ ${value.toFixed(2)}`;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load client info on ionViewWillEnter', () => {
    // Espiamos el método del componente
    spyOn(component, 'obtenerInfoCliente').and.callThrough();

    // Llamamos al método del ciclo de vida
    component.ionViewWillEnter();

    // Verificamos que se llamó el método
    expect(component.obtenerInfoCliente).toHaveBeenCalled();
  });

  it('should load client from service', () => {
    // Llamamos al método
    component.obtenerInfoCliente();

    // Verificamos que el cliente se cargó correctamente
    expect(component.clienteSeleccionado).toEqual(mockCliente);
  });

  it('should navigate back to home if no client is selected', () => {
    // Simulamos que no hay cliente seleccionado
    clientesService.clienteSeleccionado = undefined;

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

  it('should load cart products when obtaining client info', () => {
    // Espiamos el método
    spyOn(component, 'obtenerProductosCarritoCompras').and.callThrough();

    // Llamamos al método
    component.obtenerInfoCliente();

    // Verificamos que se llamó obtenerProductosCarritoCompras
    expect(component.obtenerProductosCarritoCompras).toHaveBeenCalled();

    // Verificamos que se cargaron los productos del carrito
    expect(component.productosCarritoCompras.length).toBe(2);
    expect(carritoComprasService.getCurrentCart).toHaveBeenCalled();
  });

  it('should remove product from cart', () => {
    // Establecemos los productos en el carrito
    component.obtenerProductosCarritoCompras();

    // Espiamos el método obtenerProductosCarritoCompras para verificar que se actualiza el carrito
    spyOn(component, 'obtenerProductosCarritoCompras').and.callThrough();

    // Llamamos al método para eliminar un producto
    component.eliminarProducto(mockProductosCarrito[0]);

    // Verificamos que se llamó al método del servicio con el ID correcto
    expect(carritoComprasService.removeFromCurrentCart).toHaveBeenCalledWith('P001');

    // Verificamos que se actualizó el carrito
    expect(component.obtenerProductosCarritoCompras).toHaveBeenCalled();
  });

  it('should update product quantity', () => {
    // Establecemos los productos en el carrito
    component.obtenerProductosCarritoCompras();

    // Espiamos el método obtenerProductosCarritoCompras para verificar que se actualiza el carrito
    spyOn(component, 'obtenerProductosCarritoCompras').and.callThrough();

    // Modificamos la cantidad seleccionada de un producto
    const producto = { ...mockProductosCarrito[0] };
    producto.quantity_selected = 3;

    // Llamamos al método para actualizar la cantidad
    component.onChangeCantidad(producto);

    // Verificamos que se llamó al método del servicio con los parámetros correctos
    expect(carritoComprasService.updateProductQuantity).toHaveBeenCalledWith('P001', 3);

    // Verificamos que se actualizó el carrito
    expect(component.obtenerProductosCarritoCompras).toHaveBeenCalled();
  });

  it('should calculate total cart value correctly', () => {
    // Establecemos los productos en el carrito
    component.obtenerProductosCarritoCompras();

    // El total debería ser (100 * 2) + (200 * 1) = 400
    expect(component.totalCarritoCompras).toBe(400);
  });

  it('should disable order button when products have invalid quantities', () => {
    // Caso 1: Producto con cantidad 0
    component.productosCarritoCompras = [
      {
        ...mockProductosCarrito[0],
        quantity_selected: 0,
      },
      mockProductosCarrito[1],
    ];

    expect(component.disabledPedido).toBe(true);

    // Caso 2: Producto con cantidad mayor a la disponible
    component.productosCarritoCompras = [
      {
        ...mockProductosCarrito[0],
        quantity: 5,
        quantity_selected: 6,
      },
      mockProductosCarrito[1],
    ];

    expect(component.disabledPedido).toBe(true);

    // Caso 3: Todos los productos con cantidades válidas
    component.productosCarritoCompras = [
      {
        ...mockProductosCarrito[0],
        quantity: 5,
        quantity_selected: 3,
      },
      {
        ...mockProductosCarrito[1],
        quantity: 10,
        quantity_selected: 5,
      },
    ];

    expect(component.disabledPedido).toBe(false);
  });

  it('should not throw error when realizarPedido is called', () => {
    // Verificamos que el método existe y no causa errores al llamarse
    expect(() => {
      component.realizarPedido();
    }).not.toThrow();
  });

  // Nueva prueba para verificar la suscripción a cambios de inventario
  it('should update cart when product availability changes', () => {
    // Espiamos el método
    spyOn(component, 'obtenerProductosCarritoCompras').and.callThrough();

    // Iniciamos el componente
    component.obtenerInfoCliente();

    // Verificamos que inicialmente se llamó una vez
    expect(component.obtenerProductosCarritoCompras).toHaveBeenCalledTimes(1);

    // Simulamos un cambio en la disponibilidad
    carritoComprasService.productAvailabilityChanged$.next('P001');

    // Verificamos que se actualizó el carrito
    expect(component.obtenerProductosCarritoCompras).toHaveBeenCalledTimes(2);
  });

  it('should unsubscribe on destroy', () => {
    // Espiamos el método unsubscribe
    const subscriptionSpy = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    component['subscription'] = subscriptionSpy;

    // Llamamos al método ngOnDestroy
    component.ngOnDestroy();

    // Verificamos que se llamó unsubscribe
    expect(subscriptionSpy.unsubscribe).toHaveBeenCalled();
  });
});
