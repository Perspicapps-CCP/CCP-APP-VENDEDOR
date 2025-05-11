import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CarritoComprasComponent } from './carrito-compras.component';
import { ClientesService } from 'src/app/modules/clientes/servicios/clientes.service';
import { Cliente } from 'src/app/modules/clientes/interfaces/cliente.interface';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Subject, of, throwError } from 'rxjs';
import { CarritoComprasService } from '../../servicios/carrito-compras.service';
import { Producto } from '../../interfaces/productos.interface';
import { CrearPedidoService } from '../../servicios/crear-pedido.service';

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

// Mock de cliente
const mockCliente: Cliente = {
  customer_id: '001',
  customer_name: 'Juan Pérez',
  identification: '123456789',
  addressString: 'Calle Principal 123',
  phone: '3001234567',
  customer_image: 'https://example.com/image1.jpg',
  isRecentVisit: true,
  client: {
    id: '001',
    full_name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    username: 'juanp',
    phone: '3001234567',
    id_type: 'CC',
    identification: '123456789',
    created_at: new Date('2023-01-01'),
    updated_at: new Date('2023-05-15'),
    address: {
      id: 'addr001',
      line: 'Calle Principal 123',
      neighborhood: 'Centro',
      city: 'Bogotá',
      state: 'Cundinamarca',
      country: 'Colombia',
      latitude: 4.60971,
      longitude: -74.08175,
    },
  },
};

describe('CarritoComprasComponent', () => {
  let component: CarritoComprasComponent;
  let clientesService: jasmine.SpyObj<Partial<ClientesService>>;
  let router: jasmine.SpyObj<Router>;
  let carritoComprasService: jasmine.SpyObj<Partial<CarritoComprasService>>;
  let translateService: jasmine.SpyObj<Partial<TranslateService>>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let crearPedidoService: jasmine.SpyObj<Partial<CrearPedidoService>>;

  beforeEach(() => {
    // Crear spies para los servicios
    const clientesServiceSpy = jasmine.createSpyObj('ClientesService', [], {
      clienteSeleccionado: mockCliente,
    });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const carritoComprasServiceSpy = jasmine.createSpyObj(
      'CarritoComprasService',
      ['getCurrentCart', 'removeFromCurrentCart', 'updateProductQuantity', 'clearCurrentCart'],
      { productAvailabilityChanged$: new Subject<string | null>() },
    );
    carritoComprasServiceSpy.getCurrentCart.and.returnValue([...mockProductosCarrito]);

    const translateServiceSpy = jasmine.createSpyObj('TranslateService', ['get']);
    translateServiceSpy.get.and.returnValue(of('mensaje traducido'));

    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    const crearPedidoServiceSpy = jasmine.createSpyObj('CrearPedidoService', ['crearPedido']);
    crearPedidoServiceSpy.crearPedido.and.returnValue(of({}));

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), CommonModule, ReactiveFormsModule],
      providers: [
        CarritoComprasComponent,
        { provide: ClientesService, useValue: clientesServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: CarritoComprasService, useValue: carritoComprasServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: CrearPedidoService, useValue: crearPedidoServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    });

    // Obtener instancias
    component = TestBed.inject(CarritoComprasComponent);
    clientesService = TestBed.inject(ClientesService) as jasmine.SpyObj<Partial<ClientesService>>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    carritoComprasService = TestBed.inject(CarritoComprasService) as jasmine.SpyObj<
      Partial<CarritoComprasService>
    >;
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<
      Partial<TranslateService>
    >;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    crearPedidoService = TestBed.inject(CrearPedidoService) as jasmine.SpyObj<
      Partial<CrearPedidoService>
    >;

    // Espiar métodos adicionales del componente
    spyOn(component, 'obtenerProductosCarritoCompras').and.callThrough();
    spyOn(component, 'subscribeToInventoryChanges').and.callThrough();
    spyOn(window.history, 'back');
  });

  // Tests básicos de componente y servicios
  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(clientesService).toBeTruthy();
    expect(router).toBeTruthy();
    expect(carritoComprasService).toBeTruthy();
    expect(translateService).toBeTruthy();
    expect(snackBar).toBeTruthy();
    expect(crearPedidoService).toBeTruthy();
  });

  // Tests de ciclo de vida
  it('should call obtenerInfoCliente on ionViewWillEnter', () => {
    spyOn(component, 'obtenerInfoCliente');
    component.ionViewWillEnter();
    expect(component.obtenerInfoCliente).toHaveBeenCalled();
  });

  // Tests de obtención de información
  it('should get client info and cart products when client is selected', () => {
    component.obtenerInfoCliente();
    expect(component.clienteSeleccionado).toEqual(mockCliente);
    expect(component.obtenerProductosCarritoCompras).toHaveBeenCalled();
    expect(component.subscribeToInventoryChanges).toHaveBeenCalled();
  });

  it('should navigate to home if no client is selected', () => {
    // Cambiar el valor de clienteSeleccionado
    Object.defineProperty(clientesService, 'clienteSeleccionado', {
      get: () => undefined,
    });

    component.obtenerInfoCliente();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should get cart products from service', () => {
    component.obtenerProductosCarritoCompras();
    expect(carritoComprasService.getCurrentCart).toHaveBeenCalled();
    expect(component.productosCarritoCompras).toEqual(mockProductosCarrito);
  });

  // Tests de navegación
  it('should call window.history.back when back method is called', () => {
    component.back();
    expect(window.history.back).toHaveBeenCalled();
  });

  // Tests de operaciones con el carrito
  it('should remove product from cart and show snackbar', () => {
    // Configurar un producto para eliminar
    component.currentProductDelete = mockProductosCarrito[0];

    // Ejecutar el método
    component.eliminarProducto();

    // Verificar resultados
    expect(carritoComprasService.removeFromCurrentCart).toHaveBeenCalledWith('P001');
    expect(translateService.get).toHaveBeenCalledWith('CARRITO_COMPRAS.PRODUCT_DELETED');
    expect(snackBar.open).toHaveBeenCalledWith('mensaje traducido', '', { duration: 3000 });
    expect(component.obtenerProductosCarritoCompras).toHaveBeenCalled();
    expect(component.currentProductDelete).toBeUndefined();
  });

  it('should update product quantity and refresh cart', () => {
    // Crear un producto para actualizar
    const productoActualizar = { ...mockProductosCarrito[0], quantity_selected: 3 };

    // Ejecutar el método
    component.onChangeCantidad(productoActualizar);

    // Verificar resultados
    expect(carritoComprasService.updateProductQuantity).toHaveBeenCalledWith('P001', 3);
    expect(component.obtenerProductosCarritoCompras).toHaveBeenCalled();
  });

  // Tests de cálculos
  it('should calculate total cart value correctly', () => {
    component.productosCarritoCompras = [...mockProductosCarrito];
    // El total debería ser (100 * 2) + (200 * 1) = 400
    expect(component.totalCarritoCompras).toBe(400);
  });

  // Tests de validación
  it('should disable order button when products have invalid quantities', () => {
    // Caso 1: Producto con cantidad 0
    component.productosCarritoCompras = [
      { ...mockProductosCarrito[0], quantity_selected: 0 },
      mockProductosCarrito[1],
    ];
    expect(component.disabledPedido).toBe(true);

    // Caso 2: Producto con cantidad mayor a la disponible
    component.productosCarritoCompras = [
      { ...mockProductosCarrito[0], quantity: 5, quantity_selected: 6 },
      mockProductosCarrito[1],
    ];
    expect(component.disabledPedido).toBe(true);

    // Caso 3: Todos los productos con cantidades válidas
    component.productosCarritoCompras = [
      { ...mockProductosCarrito[0], quantity: 5, quantity_selected: 3 },
      { ...mockProductosCarrito[1], quantity: 10, quantity_selected: 5 },
    ];
    expect(component.disabledPedido).toBe(false);
  });

  // Tests de creación de pedido
  it('should create order successfully and show success message', () => {
    // Configurar datos
    component.clienteSeleccionado = mockCliente;
    component.productosCarritoCompras = [...mockProductosCarrito];

    // Ejecutar método
    component.realizarPedido();

    // Verificar llamadas
    expect(crearPedidoService.crearPedido).toHaveBeenCalledWith({
      client_id: '001',
      items: [
        { product_id: 'P001', quantity: 2 },
        { product_id: 'P002', quantity: 1 },
      ],
    });

    // Verificar mensaje
    expect(translateService.get).toHaveBeenCalledWith('CARRITO_COMPRAS.CONFIRM_PEDIDO_SUCCESS');
    expect(snackBar.open).toHaveBeenCalledWith('mensaje traducido', '', { duration: 3000 });

    // Verificar limpieza
    expect(carritoComprasService.clearCurrentCart).toHaveBeenCalled();
    expect(window.history.back).toHaveBeenCalled();
  });

  it('should handle error when creating order fails', () => {
    // Configurar datos
    component.clienteSeleccionado = mockCliente;
    component.productosCarritoCompras = [...mockProductosCarrito];

    // Configurar error
    (crearPedidoService.crearPedido as jasmine.Spy).and.returnValue(
      throwError(() => new Error('Error al crear pedido')),
    );

    // Ejecutar método
    component.realizarPedido();

    // Verificar mensaje de error
    expect(translateService.get).toHaveBeenCalledWith('CARRITO_COMPRAS.CONFIRM_PEDIDO_ERROR');
    expect(snackBar.open).toHaveBeenCalledWith('mensaje traducido', '', { duration: 3000 });

    // Verificar que no se limpia el carrito
    expect(carritoComprasService.clearCurrentCart).not.toHaveBeenCalled();
  });

  // Tests de reactividad
  it('should update cart when product availability changes', () => {
    component.subscribeToInventoryChanges();

    // Resetear el contador de llamadas para obtenerProductosCarritoCompras
    (component.obtenerProductosCarritoCompras as jasmine.Spy).calls.reset();

    // Simular cambio de disponibilidad
    (carritoComprasService.productAvailabilityChanged$ as Subject<string | null>).next('P001');

    // Verificar actualización
    expect(component.obtenerProductosCarritoCompras).toHaveBeenCalled();
  });

  // Test de limpieza
  it('should unsubscribe from subscription on destroy', () => {
    // Crear un subscription mock
    const subscriptionSpy = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    component['subscription'] = subscriptionSpy;

    // Ejecutar ngOnDestroy
    component.ngOnDestroy();

    // Verificar que se llamó unsubscribe
    expect(subscriptionSpy.unsubscribe).toHaveBeenCalled();
  });
});
