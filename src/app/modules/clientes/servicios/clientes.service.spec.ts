import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ClientesService } from './clientes.service';
import { environment } from 'src/environments/environment';

describe('ClientesService', () => {
  let service: ClientesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClientesService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ClientesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return customers from the API', () => {
    const sellerId = '12345';
    const mockResponse = {
      customer: [
        {
          customer_id: '1',
          customer_name: 'Cliente Prueba 1',
          identification: 'ID12345',
          address: 'Calle Prueba 123',
          phone: '555-1234',
          customer_image: 'url/imagen1.jpg',
          isRecentVisit: true,
        },
        {
          customer_id: '2',
          customer_name: 'Cliente Prueba 2',
          identification: 'ID67890',
          address: 'Avenida Test 456',
          phone: '555-6789',
          customer_image: 'url/imagen2.jpg',
          isRecentVisit: false,
        },
      ],
    };

    service.obtenerClientes(sellerId).subscribe(clientes => {
      expect(clientes.length).toBe(2);
      expect(clientes).toEqual(mockResponse.customer);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/api/v1/users/sellers/seller_id/customers`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle empty customer list', () => {
    const sellerId = '12345';
    const mockResponse = {
      customer: [],
    };

    service.obtenerClientes(sellerId).subscribe(clientes => {
      expect(clientes.length).toBe(0);
      expect(clientes).toEqual([]);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/api/v1/users/sellers/seller_id/customers`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle API errors', () => {
    const sellerId = '12345';
    const mockError = { status: 404, statusText: 'Not Found' };

    service.obtenerClientes(sellerId).subscribe({
      next: () => fail('should have failed with 404 error'),
      error: error => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
      },
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/api/v1/users/sellers/seller_id/customers`,
    );
    expect(req.request.method).toBe('GET');
    req.flush('Not found', mockError);
  });
});
