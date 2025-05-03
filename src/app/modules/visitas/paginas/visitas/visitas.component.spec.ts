import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { VisitasComponent } from './visitas.component';
import { BehaviorSubject, of } from 'rxjs';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';

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

describe('VisitasComponent', () => {
  let component: VisitasComponent;
  let fixture: ComponentFixture<VisitasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        VisitasComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: TranslateService, useClass: MockTranslateService },
        TranslateStore, // Importante: añadir el TranslateStore como provider
      ],
      schemas: [NO_ERRORS_SCHEMA], // Para ignorar elementos desconocidos
    }).compileComponents();

    fixture = TestBed.createComponent(VisitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call obtenerVisitas when modal is dismissed with confirm role', () => {
    // Espiar el método obtenerVisitas
    spyOn(component, 'obtenerVisitas');

    // Crear un evento mock con role 'confirm'
    const mockEvent = {
      detail: {
        role: 'confirm',
      },
    } as CustomEvent<any>;

    // Llamar al método a probar
    component.onWillDismiss(mockEvent);

    // Verificar que se llamó obtenerVisitas
    expect(component.obtenerVisitas).toHaveBeenCalled();
  });
});
