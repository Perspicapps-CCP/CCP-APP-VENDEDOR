import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { VisitasService } from './visitas.service';
import { Cliente } from '../../clientes/interfaces/cliente.interface';
import { environment } from 'src/environments/environment';

describe('VisitasService', () => {
  let service: VisitasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VisitasService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(VisitasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a POST request to the correct URL', () => {
    // Arrange
    const mockCliente: Cliente = {
      customer_id: '12345',
      customer_name: 'Cliente Prueba',
      identification: '987654321',
      addressString: 'Calle Principal 123',
      phone: '555-123-4567',
      customer_image: 'https://example.com/image.jpg',
      isRecentVisit: false,
      address: {
        id: 'addr-001',
        line: 'Calle Principal 123',
        neighborhood: 'Centro',
        city: 'Bogotá',
        state: 'Cundinamarca',
        country: 'Colombia',
        latitude: 4.6097,
        longitude: -74.0817,
      },
      client: {
        id: 'client-001',
        full_name: 'Cliente Prueba',
        email: 'cliente@example.com',
        username: 'clienteprueba',
        phone: '555-123-4567',
        id_type: 'CC',
        identification: '987654321',
        created_at: new Date(),
        updated_at: new Date(),
        address: {
          id: 'addr-001',
          line: 'Calle Principal 123',
          neighborhood: 'Centro',
          city: 'Bogotá',
          state: 'Cundinamarca',
          country: 'Colombia',
          latitude: 4.6097,
          longitude: -74.0817,
        },
      },
    };
    const descripcion = 'Visita de prueba';
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const imagenes = [file];

    // Act
    service.registrarVisita(imagenes, descripcion, mockCliente).subscribe();

    // Assert
    const req = httpMock.expectOne(
      `${environment.apiUrlCCP}/api/v1/sales/sellers/clients/12345/visit`,
    );
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should create FormData with the correct content', () => {
    // Arrange
    const mockCliente: Cliente = {
      customer_id: '12345',
      customer_name: 'Cliente Prueba',
      identification: '987654321',
      addressString: 'Calle Principal 123',
      phone: '555-123-4567',
      customer_image: 'https://example.com/image.jpg',
      isRecentVisit: false,
      address: {
        id: 'addr-001',
        line: 'Calle Principal 123',
        neighborhood: 'Centro',
        city: 'Bogotá',
        state: 'Cundinamarca',
        country: 'Colombia',
        latitude: 4.6097,
        longitude: -74.0817,
      },
      client: {
        id: 'client-001',
        full_name: 'Cliente Prueba',
        email: 'cliente@example.com',
        username: 'clienteprueba',
        phone: '555-123-4567',
        id_type: 'CC',
        identification: '987654321',
        created_at: new Date(),
        updated_at: new Date(),
        address: {
          id: 'addr-001',
          line: 'Calle Principal 123',
          neighborhood: 'Centro',
          city: 'Bogotá',
          state: 'Cundinamarca',
          country: 'Colombia',
          latitude: 4.6097,
          longitude: -74.0817,
        },
      },
    };
    const descripcion = 'Visita de prueba';
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const imagenes = [file];

    service.registrarVisita(imagenes, descripcion, mockCliente).subscribe();

    const req = httpMock.expectOne(
      `${environment.apiUrlCCP}/api/v1/sales/sellers/clients/12345/visit`,
    );
    expect(req.request.body instanceof FormData).toBeTruthy();
    req.flush({});
  });
});
