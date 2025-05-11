import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DetalleClienteService } from './detalle-cliente.service';
import { Sales } from '../interfaces/ventas.interface';
import { environment } from 'src/environments/environment';

describe('DetalleClienteService', () => {
  let service: DetalleClienteService;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  const apiUrl = environment.apiUrlCCP;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DetalleClienteService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(DetalleClienteService);
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya solicitudes pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve sales data for a client', () => {
    // Mock de los datos de respuesta
    const mockSales: Sales[] = [
      {
        id: '123',
        order_number: 'ORD-001',
        total: 1500,
        date: new Date('2025-01-01'),
        status: 'completed',
        client: {
          id: 'client-123',
          full_name: 'Juan Pérez',
          email: 'juan@example.com',
          username: 'juanperez',
          phone: '1234567890',
          id_type: 'CC',
          identification: '123456789',
          role: 'client',
        },
        seller: {
          id: 'seller-456',
          full_name: 'María López',
          email: 'maria@example.com',
          username: 'marialopez',
          phone: '0987654321',
          id_type: 'CC',
          identification: '987654321',
          role: 'seller',
        },
        items: [
          {
            product: {
              id: 'prod-123',
              product_code: 'P001',
              name: 'Producto A',
              price: 750,
              images: ['img1.jpg', 'img2.jpg'],
              manufacturer: {
                id: 'manu-123',
                name: 'Fabricante X',
                country: 'Colombia',
              },
            },
            quantity: 2,
            subtotal: 1500,
          },
        ],
        deliveries: [
          {
            shipping_number: 'SHP-001',
            license_plate: 'ABC123',
            driver_name: 'Carlos Rodríguez',
            warehouse: {
              id: 'ware-123',
              name: 'Bodega Central',
              location: 'Bogotá',
            },
            delivery_status: 'delivered',
            created_at: new Date('2025-01-02'),
            updated_at: new Date('2025-01-03'),
          },
        ],
      },
    ];

    const clientId = 'client-123';

    // Realizamos la llamada al método
    let result: Sales[] = [];
    service.obtenerVentasPorCliente(clientId).subscribe(data => {
      result = data;
    });

    // Esperamos y respondemos con el mock
    const req = httpMock.expectOne(`${apiUrl}/api/v1/sales/sale/${clientId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSales);

    // Verificamos que la respuesta sea la esperada
    expect(result).toEqual(mockSales);
    expect(result.length).toBe(1);
    expect(result[0].client.id).toBe('client-123');
  });
});
