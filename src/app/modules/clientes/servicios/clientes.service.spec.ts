import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ClientesService } from './clientes.service';
import { environment } from 'src/environments/environment';
import { Cliente, ClienteResponse } from '../interfaces/cliente.interface';

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

  it('should return clients from the API', () => {
    const mockResponse: ClienteResponse[] = [
      {
        id: '1',
        client: {
          id: '1',
          full_name: 'Cliente Prueba 1',
          email: 'cliente1@test.com',
          username: 'cliente1',
          phone: '555-1234',
          id_type: '',
          identification: 'ID12345',
          created_at: new Date(),
          updated_at: new Date(),
          address: {
            id: 'addr1',
            line: 'Calle Prueba 123',
            neighborhood: 'Barrio Test',
            city: 'Ciudad Test',
            state: 'Estado Test',
            country: 'País Test',
            latitude: 0,
            longitude: 0,
          },
        },
        last_visited: new Date(),
        was_visited_recently: true,
        client_thumbnail: 'url/imagen1.jpg',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: '2',
        client: {
          id: '2',
          full_name: 'Cliente Prueba 2',
          email: 'cliente2@test.com',
          username: 'cliente2',
          phone: '555-6789',
          id_type: '',
          identification: 'ID67890',
          created_at: new Date(),
          updated_at: new Date(),
          address: {
            id: 'addr2',
            line: 'Avenida Test 456',
            neighborhood: 'Barrio Test 2',
            city: 'Ciudad Test',
            state: 'Estado Test',
            country: 'País Test',
            latitude: 0,
            longitude: 0,
          },
        },
        last_visited: new Date(),
        was_visited_recently: false,
        client_thumbnail: 'url/imagen2.jpg',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    const expectedClientes: Cliente[] = mockResponse.map(clienteResp => ({
      customer_id: clienteResp.client.id,
      customer_name: clienteResp.client.full_name,
      identification: clienteResp.client.identification,
      addressString: clienteResp.client.address.line,
      phone: clienteResp.client.phone,
      customer_image: clienteResp.client_thumbnail,
      isRecentVisit: clienteResp.was_visited_recently,
      address: clienteResp.client.address,
      client: clienteResp.client,
    }));

    service.obtenerClientes().subscribe(clientes => {
      expect(clientes.length).toBe(2);
      expect(clientes).toEqual(expectedClientes);
    });

    const req = httpMock.expectOne(`${environment.apiUrlCCP}/api/v1/sales/sellers/clients/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle empty client list', () => {
    const mockResponse: ClienteResponse[] = [];

    service.obtenerClientes().subscribe(clientes => {
      expect(clientes.length).toBe(0);
      expect(clientes).toEqual([]);
    });

    const req = httpMock.expectOne(`${environment.apiUrlCCP}/api/v1/sales/sellers/clients/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle API errors', () => {
    const mockError = { status: 404, statusText: 'Not Found' };

    service.obtenerClientes().subscribe({
      next: () => fail('should have failed with 404 error'),
      error: error => {
        expect(error.status).toBe(404);
        expect(error.statusText).toBe('Not Found');
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrlCCP}/api/v1/sales/sellers/clients/`);
    expect(req.request.method).toBe('GET');
    req.flush('Not found', mockError);
  });

  it('should set clienteSeleccionado correctly', () => {
    const mockCliente: Cliente = {
      customer_id: '1',
      customer_name: 'Cliente Prueba 1',
      identification: 'ID12345',
      addressString: 'Calle Prueba 123',
      phone: '555-1234',
      customer_image: 'url/imagen1.jpg',
      isRecentVisit: true,
    };

    // Inicialmente debería ser null
    expect(service.clienteSeleccionado).toBeNull();

    // Establecer el cliente
    service.clienteSeleccionado = mockCliente;

    // Verificar que se haya establecido correctamente
    expect(service.clienteSeleccionado).toEqual(mockCliente);
  });

  it('should get clienteSeleccionado correctly', () => {
    const mockCliente: Cliente = {
      customer_id: '2',
      customer_name: 'Cliente Prueba 2',
      identification: 'ID67890',
      addressString: 'Avenida Test 456',
      phone: '555-6789',
      customer_image: 'url/imagen2.jpg',
      isRecentVisit: false,
    };

    // Establecer el cliente
    service.clienteSeleccionado = mockCliente;

    // Obtener el cliente y verificar que sea el mismo
    const clienteObtenido = service.clienteSeleccionado;
    expect(clienteObtenido).toBe(mockCliente);
    expect(clienteObtenido?.customer_id).toBe('2');
    expect(clienteObtenido?.customer_name).toBe('Cliente Prueba 2');
  });
});
