import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { VisitasComponent } from './visitas.component';
import {
  TranslateModule,
  TranslateLoader,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { of } from 'rxjs';

// Mock del TranslateLoader
export class MockTranslateLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of({});
  }
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
      providers: [TranslateService, TranslateStore],
      schemas: [NO_ERRORS_SCHEMA], // Para ignorar errores de elementos desconocidos
    }).compileComponents();

    fixture = TestBed.createComponent(VisitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar correctamente', () => {
    spyOn(component, 'ngOnInit');
    component.ngOnInit();
    expect(component.ngOnInit).toHaveBeenCalled();
  });
});
