import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { VideoService } from './video.service';
import { environment } from 'src/environments/environment';
import { Video } from '../interfaces/videos.interface';

describe('VideoService', () => {
  let service: VideoService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrlCCP;

  // Datos de prueba
  const mockVideos: Video[] = [
    {
      id: 'video-001',
      title: 'Video Tutorial 1',
      status: 'active',
      description: 'Descripción del video tutorial 1',
      url: 'https://example.com/video1',
      recomendations: 'Recomendaciones para el video 1',
    },
    {
      id: 'video-002',
      title: 'Video Tutorial 2',
      status: 'active',
      description: 'Descripción del video tutorial 2',
      url: 'https://example.com/video2',
      recomendations: 'Recomendaciones para el video 2',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      // En lugar de imports: [HttpClientTestingModule],
      providers: [VideoService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(VideoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya solicitudes pendientes
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get videos from the API', () => {
    const idCliente = 'cliente-001'; // ID de cliente de prueba
    service.obtenerVideos(idCliente).subscribe(videos => {
      expect(videos).toEqual(mockVideos);
      expect(videos.length).toBe(2);
    });

    const req = httpMock.expectOne(`${apiUrl}/api/v1/sales/sellers/clients/${idCliente}/videos`);
    expect(req.request.method).toBe('GET');
    req.flush(mockVideos);
  });

  it('should create a video and send to API', () => {
    const mockFile = new File(['dummy content'], 'test-video.mp4', { type: 'video/mp4' });
    const descripcion = 'Descripción de prueba';
    const title = 'Título de prueba';
    const idCliente = 'cliente-001';

    // Respuesta simulada del servidor
    const mockResponse = { success: true, id: 'new-video-id' };

    service.crearVideo([mockFile], descripcion, title, idCliente).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/api/v1/sales/sellers/clients/${idCliente}/videos`);
    expect(req.request.method).toBe('POST');

    // Verificar que el FormData contenga los datos correctos
    // Nota: FormData es difícil de probar directamente, pero podemos verificar que la solicitud tenga un body
    expect(req.request.body instanceof FormData).toBeTruthy();

    req.flush(mockResponse);
  });

  it('should set and get videoSeleccionado correctly', () => {
    // Verificar valor inicial
    expect(service.videoSeleccionado).toBeNull();

    // Establecer un video
    service.videoSeleccionado = mockVideos[0];

    // Verificar que se haya establecido correctamente
    expect(service.videoSeleccionado).toEqual(mockVideos[0]);

    // Establecer otro video
    service.videoSeleccionado = mockVideos[1];

    // Verificar que se haya actualizado correctamente
    expect(service.videoSeleccionado).toEqual(mockVideos[1]);
  });
});
