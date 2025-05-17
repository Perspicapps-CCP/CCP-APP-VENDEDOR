import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DetalleVideosComponent } from './detalle-videos.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ClientesService } from 'src/app/modules/clientes/servicios/clientes.service';
import { VideoService } from '../../servicios/video.service';
import { Cliente } from 'src/app/modules/clientes/interfaces/cliente.interface';
import { Video } from '../../interfaces/videos.interface';

// Mock para TranslateLoader
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

// Mock de datos para pruebas
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
    email: 'juan@example.com',
    username: 'juanperez',
    phone: '1234567890',
    id_type: 'CC',
    identification: '123456789',
    created_at: new Date(),
    updated_at: new Date(),
    address: {
      id: 'addr-001',
      line: 'Calle Principal 123',
      neighborhood: 'Centro',
      city: 'Bogotá',
      state: 'Cundinamarca',
      country: 'Colombia',
      latitude: 4.710989,
      longitude: -74.072092,
    },
  },
};

const mockVideos: Video[] = [
  {
    id: 'video-001',
    title: 'Video Tutorial 1',
    status: 'active',
    description: 'Descripción del video tutorial 1',
    url: 'https://example.com/video1',
    recomendation: 'Recomendaciones para el video 1',
  },
  {
    id: 'video-002',
    title: 'Video Tutorial 2',
    status: 'active',
    description: 'Descripción del video tutorial 2',
    url: 'https://example.com/video2',
    recomendation: 'Recomendaciones para el video 2',
  },
];

describe('DetalleVideosComponent', () => {
  let component: DetalleVideosComponent;
  let fixture: ComponentFixture<DetalleVideosComponent>;
  let router: jasmine.SpyObj<Router>;
  let clientesService: jasmine.SpyObj<Partial<ClientesService>>;
  let videoService: jasmine.SpyObj<Partial<VideoService>>;

  beforeEach(async () => {
    // Creamos spies para los servicios
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const clientesServiceSpy = jasmine.createSpyObj('ClientesService', [], {
      clienteSeleccionado: mockCliente,
    });

    // Configuración mejorada para videoService que permite mutar videoSeleccionado
    const videoServiceSpy = jasmine.createSpyObj('VideoService', ['obtenerVideos']);
    // Configura videoSeleccionado como una propiedad con getter y setter
    Object.defineProperty(videoServiceSpy, 'videoSeleccionado', {
      get: jasmine.createSpy('videoSeleccionadoGetter').and.callFake(() => {
        return videoServiceSpy._videoSeleccionado;
      }),
      set: jasmine.createSpy('videoSeleccionadoSetter').and.callFake(value => {
        videoServiceSpy._videoSeleccionado = value;
      }),
      configurable: true,
    });
    // Inicializa la propiedad interna
    videoServiceSpy._videoSeleccionado = null;
    videoServiceSpy.obtenerVideos.and.returnValue(of(mockVideos));

    // Configuramos el TestBed con los módulos necesarios
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        CommonModule,
        DetalleVideosComponent, // ¡IMPORTANTE! - Componente standalone va en imports
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      // ¡NO declarations array aquí!
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: ClientesService, useValue: clientesServiceSpy },
        { provide: VideoService, useValue: videoServiceSpy },
        TranslateStore,
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    // Creamos el componente y obtenemos las instancias de los servicios
    fixture = TestBed.createComponent(DetalleVideosComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    clientesService = TestBed.inject(ClientesService) as jasmine.SpyObj<Partial<ClientesService>>;
    videoService = TestBed.inject(VideoService) as jasmine.SpyObj<Partial<VideoService>>;

    // Importante: no detectamos cambios automáticamente para controlar el ciclo de vida
    // Prevenir que ionViewWillEnter se ejecute automáticamente
    spyOn(component, 'ionViewWillEnter').and.callThrough();
    spyOn(component, 'obtenerInfoCliente').and.callThrough();
    spyOn(component, 'obtenerVideos').and.callThrough();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call window.history.back when back method is called', () => {
    // Espiamos window.history.back
    spyOn(window.history, 'back');

    // Llamamos al método
    component.back();

    // Verificamos que se llamó window.history.back
    expect(window.history.back).toHaveBeenCalled();
  });

  it('should call obtenerInfoCliente when ionViewWillEnter is called', () => {
    // Permitimos que obtenerInfoCliente se ejecute pero no obtenerVideos
    (component.obtenerInfoCliente as jasmine.Spy).and.callThrough();
    (component.obtenerVideos as jasmine.Spy).and.returnValue(undefined);

    // Llamamos al método del ciclo de vida
    component.ionViewWillEnter();

    // Verificamos que obtenerInfoCliente fue llamado
    expect(component.obtenerInfoCliente).toHaveBeenCalled();
  });

  it('should get videos when obtenerVideos is called', () => {
    // Revertimos el spy para permitir la ejecución real
    (component.obtenerVideos as jasmine.Spy).and.callThrough();

    // Llamamos al método
    component.obtenerVideos();

    // Verificamos que se llamó al servicio
    expect(videoService.obtenerVideos).toHaveBeenCalled();
    // Verificamos que se asignaron los videos al componente
    expect(component.videos).toEqual(mockVideos);
  });

  it('should navigate to home if no client is selected', () => {
    // Simulamos que no hay cliente seleccionado
    Object.defineProperty(clientesService, 'clienteSeleccionado', {
      get: () => undefined,
    });

    // Llamamos al método
    component.obtenerInfoCliente();

    // Verificamos que se navega a home
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should navigate to video detail and set selected video', () => {
    // Establecemos el cliente seleccionado
    component.clienteSeleccionado = mockCliente;

    // Llamamos al método de navegación
    component.navegarADetalleVideo(mockVideos[0]);

    // Verificamos que se estableció el video seleccionado
    expect(videoService.videoSeleccionado).toEqual(mockVideos[0]);

    // Verificamos que se navegó a la ruta correcta
    expect(router.navigate).toHaveBeenCalledWith([
      `/detalle-cliente/${mockCliente.customer_id}/videos/${mockVideos[0].id}`,
    ]);
  });

  it('should refresh videos when modal is dismissed with confirm role', () => {
    // Espiamos el método obtenerVideos
    (component.obtenerVideos as jasmine.Spy).and.callThrough();

    // Llamamos al método con un evento simulado
    const mockEvent = {
      detail: {
        role: 'confirm',
      },
    } as CustomEvent<any>;

    component.onWillDismiss(mockEvent);

    // Verificamos que se llamó a obtenerVideos
    expect(component.obtenerVideos).toHaveBeenCalled();
  });

  it('should not refresh videos when modal is dismissed with a role other than confirm', () => {
    // Reseteamos las llamadas previas
    (component.obtenerVideos as jasmine.Spy).calls.reset();

    // Llamamos al método con un evento simulado con role diferente
    const mockEvent = {
      detail: {
        role: 'cancel',
      },
    } as CustomEvent<any>;

    component.onWillDismiss(mockEvent);

    // Verificamos que NO se llamó a obtenerVideos
    expect(component.obtenerVideos).not.toHaveBeenCalled();
  });
});
