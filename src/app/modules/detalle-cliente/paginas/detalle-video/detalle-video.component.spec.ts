import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DetalleVideoComponent } from './detalle-video.component';
import { VideoService } from '../../servicios/video.service';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Video } from '../../interfaces/videos.interface';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import {
  TranslateModule,
  TranslateLoader,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { of } from 'rxjs';

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

// Mock video para las pruebas
const mockVideo: Video = {
  id: 'video-001',
  title: 'Video Tutorial 1',
  status: 'active',
  description: 'Descripción del video tutorial 1',
  url: 'https://example.com/video1',
  recomendation: 'Recomendaciones para el video 1',
};

describe('DetalleVideoComponent', () => {
  let component: DetalleVideoComponent;
  let fixture: ComponentFixture<DetalleVideoComponent>;
  let videoService: jasmine.SpyObj<VideoService>;

  beforeEach(waitForAsync(() => {
    // Creamos un spy para VideoService con una propiedad de videoSeleccionado
    const videoServiceSpy = jasmine.createSpyObj('VideoService', [], {
      // Inicializamos directamente la propiedad videoSeleccionado
      videoSeleccionado: mockVideo,
    });

    TestBed.configureTestingModule({
      // El componente es standalone, así que va en imports, no en declarations
      imports: [
        IonicModule.forRoot(),
        CommonModule,
        DetalleVideoComponent,
        // Configura TranslateModule para pruebas
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
        sharedImports,
        IonButton,
        IonTitle,
        IonButtons,
        IonToolbar,
        IonContent,
        IonHeader,
      ],
      // Proporcionamos todos los servicios necesarios incluyendo TranslateService y TranslateStore
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: VideoService, useValue: videoServiceSpy },
        { provide: TranslateService, useClass: MockTranslateService },
        TranslateStore, // ¡Muy importante! Este era el proveedor faltante
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleVideoComponent);
    component = fixture.componentInstance;
    videoService = TestBed.inject(VideoService) as jasmine.SpyObj<VideoService>;

    // Espiamos ionViewWillEnter para controlar su ejecución
    spyOn(component, 'ionViewWillEnter').and.callThrough();
    spyOn(component, 'obtenerInfoVideo').and.callThrough();
    spyOn(component, 'back').and.callThrough();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set videoSeleccionado when ionViewWillEnter is called', () => {
    // Llamamos al método del ciclo de vida
    component.ionViewWillEnter();

    // Verificamos que se llamó a obtenerInfoVideo
    expect(component.obtenerInfoVideo).toHaveBeenCalled();

    // Verificamos que se estableció el video seleccionado
    expect(component.videoSeleccionado).toEqual(mockVideo);
  });

  it('should call back method if no video is selected', () => {
    // Configuramos videoSeleccionado como null
    // Modificamos el spy para devolver null
    Object.defineProperty(videoService, 'videoSeleccionado', {
      get: () => null,
      configurable: true,
    });

    // Llamamos al método
    component.obtenerInfoVideo();

    // Verificamos que se llamó al método back
    expect(component.back).toHaveBeenCalled();
  });

  it('should call window.history.back when back method is called', () => {
    // Espiamos window.history.back
    spyOn(window.history, 'back');

    // Llamamos al método back
    component.back();

    // Verificamos que se llamó a window.history.back
    expect(window.history.back).toHaveBeenCalled();
  });
});
