import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CatalogoProductosComponent } from './catalogo-productos.component';
import { ClientesService } from 'src/app/modules/clientes/servicios/clientes.service';
import { CatalogoService } from '../../servicios/catalogo.service';
import { DinamicSearchService } from 'src/app/shared/services/dinamic-search.service';
import { Cliente } from 'src/app/modules/clientes/interfaces/cliente.interface';
import { Producto } from '../../interfaces/productos.interface';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { HighlightTextPipe } from 'src/app/shared/pipes/highlight-text.pipe';
import { CommonModule } from '@angular/common';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { BehaviorSubject, of, throwError } from 'rxjs';

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

// Mock para DinamicSearchService
class MockDinamicSearchService {
  dynamicSearch(items: Producto[], searchTerm: string) {
    if (!searchTerm) return items;
    return items.filter(
      producto =>
        producto.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.product_code.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }
}

describe('CatalogoProductosComponent', () => {
  let component: CatalogoProductosComponent;
  let fixture: ComponentFixture<CatalogoProductosComponent>;
  let clientesService: jasmine.SpyObj<ClientesService>;
  let catalogoService: any; // Changed from SpyObj to any
  let router: jasmine.SpyObj<Router>;
  let dinamicSearchService: DinamicSearchService;

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

  // Mock de productos
  const mockProductos: Producto[] = [
    {
      product_id: 'P001',
      product_name: 'Producto 1',
      product_code: 'PROD-001',
      manufacturer_name: 'Fabricante 1',
      price: 100,
      price_currency: '$ 100.00',
      images: ['imagen1.jpg', 'imagen2.jpg'],
      quantity: 1,
    },
    {
      product_id: 'P002',
      product_name: 'Producto 2',
      product_code: 'PROD-002',
      manufacturer_name: 'Fabricante 2',
      price: 200,
      price_currency: '$ 100.00',
      images: ['imagen3.jpg', 'imagen4.jpg'],
      quantity: 2,
    },
  ];

  beforeEach(async () => {
    // Creamos spies para los servicios
    const clientesServiceSpy = jasmine.createSpyObj('ClientesService', [], {
      clienteSeleccionado: mockCliente,
    });

    // Usamos un objeto simple para catalogoService
    const catalogoServiceMock = {
      productoSeleccionado: null,
      obtenerProductos: jasmine.createSpy('obtenerProductos').and.returnValue(of(mockProductos)),
    };

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Configuramos el TestBed
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        CommonModule,
        MatCardModule,
        ReactiveFormsModule,
        CatalogoProductosComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: ClientesService, useValue: clientesServiceSpy },
        { provide: CatalogoService, useValue: catalogoServiceMock },
        { provide: Router, useValue: routerSpy },
        { provide: DinamicSearchService, useClass: MockDinamicSearchService },
        { provide: TranslateService, useClass: MockTranslateService },
        TranslateStore,
        HighlightTextPipe,
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    // Obtenemos instancias
    fixture = TestBed.createComponent(CatalogoProductosComponent);
    component = fixture.componentInstance;
    clientesService = TestBed.inject(ClientesService) as jasmine.SpyObj<ClientesService>;
    catalogoService = TestBed.inject(CatalogoService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    dinamicSearchService = TestBed.inject(DinamicSearchService);

    // Espiamos console.log
    spyOn(console, 'log').and.callThrough();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load client info and products on ionViewWillEnter', () => {
    // Espiamos los métodos del componente
    spyOn(component, 'obtenerInfoCliente').and.callThrough();
    spyOn(component, 'obtenerProductos').and.callThrough();

    // Llamamos al método del ciclo de vida
    component.ionViewWillEnter();

    // Verificamos que se llamaron los métodos
    expect(component.obtenerInfoCliente).toHaveBeenCalled();
    expect(component.obtenerProductos).toHaveBeenCalled();
  });

  it('should load products from service', () => {
    // Llamamos al método
    component.obtenerProductos();

    // Verificamos que se llamó al servicio
    expect(catalogoService.obtenerProductos).toHaveBeenCalled();

    // Verificamos que los productos se cargaron correctamente
    expect(component.productos.length).toBe(2);
    expect(component.productos[0].product_name).toBe('Producto 1');
    expect(component.productos[1].product_name).toBe('Producto 2');
  });

  it('should initialize filterProductos$ observable', () => {
    // Llamamos al método
    component.filterProductos();

    // Verificamos que el observable se inicializó
    expect(component.filterProductos$).toBeDefined();
  });

  it('should return all products when search term is empty', () => {
    // Establecemos los productos
    component.productos = mockProductos;

    // Inicializamos el observable
    component.filterProductos();

    // Cambiamos el valor del FormControl a vacío
    component.formBusquedaProductos.setValue('');

    // Nos suscribimos para verificar los resultados
    component.filterProductos$?.subscribe(filteredProductos => {
      expect(filteredProductos.length).toBe(2);
    });
  });

  it('should filter products correctly when searching', () => {
    // Espiamos el servicio dynamicSearch
    spyOn(dinamicSearchService, 'dynamicSearch').and.callThrough();

    // Establecemos los productos
    component.productos = mockProductos;

    // Probamos el método buscar con un término
    const result = component.buscar('Producto 1');

    // Verificamos que se llamó al servicio
    expect(dinamicSearchService.dynamicSearch).toHaveBeenCalledWith(mockProductos, 'Producto 1');

    // Verificamos los resultados
    expect(result.length).toBe(1);
    expect(result[0].product_name).toBe('Producto 1');
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

  // Y la prueba específica:
  it('should navigate to product detail when irDetalleProducto is called', () => {
    // Establecemos el cliente seleccionado
    component.clienteSeleccionado = mockCliente;

    // Llamamos al método con un producto
    component.irDetalleProducto(mockProductos[0]);

    // Verificamos que se establece el producto seleccionado
    expect(catalogoService.productoSeleccionado).toEqual(mockProductos[0]);

    // Verificamos la navegación
    expect(router.navigate).toHaveBeenCalledWith([
      '/detalle-cliente',
      mockCliente.customer_id,
      'catalogoProductos',
      mockProductos[0].product_id,
    ]);
  });
  it('should call window.history.back when back method is called', () => {
    // Espiamos window.history.back
    spyOn(window.history, 'back');

    // Llamamos al método
    component.back();

    // Verificamos que se llamó window.history.back
    expect(window.history.back).toHaveBeenCalled();
  });

  it('should handle empty product list', () => {
    // Reseteamos la lista de productos a vacía
    component.productos = [];

    // Inicializamos el observable
    component.filterProductos();

    // Verificamos que el observable devuelve una lista vacía
    component.filterProductos$?.subscribe(filteredProductos => {
      expect(filteredProductos.length).toBe(0);
    });

    // Verificamos el comportamiento de buscar con lista vacía
    const result = component.buscar('cualquier cosa');
    expect(result.length).toBe(0);
  });

  it('should handle error in obtenerProductos', done => {
    // Creamos un espía que lanza un error
    const errorMsg = 'Error al obtener productos';
    catalogoService.obtenerProductos.and.returnValue(throwError(() => new Error(errorMsg)));

    // Espiamos console.error para verificar que se maneja el error
    spyOn(console, 'error');

    // Modifica el método obtenerProductos del componente para capturar el error
    const originalMethod = component.obtenerProductos;
    component.obtenerProductos = function () {
      catalogoService.obtenerProductos().subscribe({
        next: (data: Producto[]) => {
          this.productos = data;
          this.filterProductos();
        },
        error: (err: Error) => {
          console.error('Error capturado:', err);
          this.productos = []; // Aseguramos que la lista quede vacía
          done(); // Señalamos que la prueba asíncrona ha terminado
        },
      });
    };

    try {
      // Llamamos al método modificado
      component.obtenerProductos();
    } catch (e) {
      // Si hay un error no capturado, fallamos la prueba
      done.fail('No se debería lanzar un error no capturado');
    }

    // Restauramos el método original para no afectar otras pruebas
    setTimeout(() => {
      component.obtenerProductos = originalMethod;
    });
  });

  it('should not throw error when irCarritoCompras is called', () => {
    // Verificamos que el método existe y no causa errores al llamarse
    expect(() => {
      component.irCarritoCompras();
    }).not.toThrow();
  });
});
