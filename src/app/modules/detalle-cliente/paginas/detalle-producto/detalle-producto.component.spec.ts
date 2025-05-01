import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DetalleProductoComponent } from './detalle-producto.component';
import { ClientesService } from 'src/app/modules/clientes/servicios/clientes.service';
import { CatalogoService } from '../../servicios/catalogo.service';
import { Cliente } from 'src/app/modules/clientes/interfaces/cliente.interface';
import { Producto } from '../../interfaces/productos.interface';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { VisorImagenesDialogComponent } from 'src/app/shared/componentes/visor-imagenes-dialog/visor-imagenes-dialog.component';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';

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

// Mock para VisorImagenesDialogComponent
class MockVisorImagenesDialogComponent {}

describe('DetalleProductoComponent', () => {
  let component: DetalleProductoComponent;
  let fixture: ComponentFixture<DetalleProductoComponent>;
  let clientesService: any;
  let catalogoService: any;
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

  // Mock de producto
  const mockProducto: Producto = {
    product_id: 'P001',
    product_name: 'Producto 1',
    product_code: 'PROD-001',
    manufacturer_name: 'Fabricante 1',
    price: 100,
    price_currency: '$ 100.00',
    images: ['imagen1.jpg', 'imagen2.jpg'],
    quantity: 1,
  };

  beforeEach(async () => {
    // Creamos objetos simples para los servicios
    const clientesServiceMock = {
      clienteSeleccionado: mockCliente,
    };

    const catalogoServiceMock = {
      productoSeleccionado: mockProducto,
    };

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Configuramos TestBed
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        CommonModule,
        ReactiveFormsModule,
        DetalleProductoComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: ClientesService, useValue: clientesServiceMock },
        { provide: CatalogoService, useValue: catalogoServiceMock },
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: VisorImagenesDialogComponent, useClass: MockVisorImagenesDialogComponent },
        TranslateStore,
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    // Obtenemos instancias
    fixture = TestBed.createComponent(DetalleProductoComponent);
    component = fixture.componentInstance;
    clientesService = TestBed.inject(ClientesService);
    catalogoService = TestBed.inject(CatalogoService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load client and product info on ionViewWillEnter', () => {
    // Espiamos los métodos del componente
    spyOn(component, 'obtenerInfoCliente').and.callThrough();
    spyOn(component, 'obtenerProducto').and.callThrough();

    // Llamamos al método del ciclo de vida
    component.ionViewWillEnter();

    // Verificamos que se llamaron los métodos
    expect(component.obtenerInfoCliente).toHaveBeenCalled();
    expect(component.obtenerProducto).toHaveBeenCalled();
  });

  it('should load client from service', () => {
    // Llamamos al método
    component.obtenerInfoCliente();

    // Verificamos que el cliente se cargó correctamente
    expect(component.clienteSeleccionado).toEqual(mockCliente);
  });

  it('should load product from service', () => {
    // Llamamos al método
    component.obtenerProducto();

    // Verificamos que el producto se cargó correctamente
    expect(component.productoSeleccionado).toEqual(mockProducto);
  });

  it('should navigate back to home if no client is selected', () => {
    // Simulamos que no hay cliente seleccionado
    clientesService.clienteSeleccionado = undefined;

    // Llamamos al método
    component.obtenerInfoCliente();

    // Verificamos que se navega a home
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should navigate back to home if no product is selected', () => {
    // Simulamos que no hay producto seleccionado
    catalogoService.productoSeleccionado = undefined;

    // Llamamos al método
    component.obtenerProducto();

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

  it('should not throw error when irCarritoCompras is called', () => {
    // Verificamos que el método existe y no causa errores al llamarse
    expect(() => {
      component.irCarritoCompras();
    }).not.toThrow();
  });
});
