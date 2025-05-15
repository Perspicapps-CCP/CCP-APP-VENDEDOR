import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Routes, provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  TranslateModule,
  TranslateLoader,
  TranslateFakeLoader,
  TranslateStore,
} from '@ngx-translate/core';

import { LayoutComponent } from './layout.component';

// Definimos algunas rutas de prueba si es necesario
const routes: Routes = [{ path: '', component: LayoutComponent }];

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;

  beforeEach(waitForAsync(() => {
    // Configurar un mock completo de Capacitor antes de ejecutar las pruebas
    (window as any).Capacitor = {
      isNativePlatform: () => false,
      convertFileSrc: (path: string) => path,
      Plugins: {},
      getPlatform: () => 'web',
      isPluginAvailable: (pluginName: string) => false, // Añadida esta función
      registerPlugin: () => ({}),
      // Plugins comunes que podrían ser necesarios
      Keyboard: {
        addListener: () => ({ remove: () => {} }),
        removeAllListeners: () => Promise.resolve(),
        hide: () => Promise.resolve(),
        show: () => Promise.resolve(),
        setResizeMode: () => Promise.resolve(),
        setScroll: () => Promise.resolve(),
        setAccessoryBarVisible: () => Promise.resolve(),
      },
      App: {
        addListener: () => ({ remove: () => {} }),
        removeAllListeners: () => Promise.resolve(),
        exitApp: () => Promise.resolve(),
        getInfo: () =>
          Promise.resolve({ name: 'Test App', id: 'test', build: '1', version: '1.0.0' }),
      },
      Device: {
        getInfo: () => Promise.resolve({ platform: 'web' }),
      },
    };

    // Mock para el controlador de teclado de Ionic
    (window as any).Keyboard = {
      getEngine: () => 'test',
      getResizeMode: () => 'none',
      setResizeMode: () => Promise.resolve(),
      willShowKeyboard: () => Promise.resolve(),
      willHideKeyboard: () => Promise.resolve(),
      isKeyboardVisible: false,
      setKeyboardVisible: (isVisible: boolean) => {},
    };

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot({
          _testing: true, // Configuración para pruebas
        }),
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
          defaultLanguage: 'es',
        }),
        LayoutComponent,
      ],
      providers: [
        provideRouter(routes),
        provideLocationMocks(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'testId',
              },
            },
          },
        },
        TranslateStore, // Añadimos TranslateStore si es necesario
      ],
      schemas: [NO_ERRORS_SCHEMA], // Ayuda a manejar componentes desconocidos
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;

    // Podemos retrasar la llamada a detectChanges hasta tener todo configurado
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
