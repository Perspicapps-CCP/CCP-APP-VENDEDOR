import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CarritoComprasComponent } from './carrito-compras.component';
import { ClientesService } from 'src/app/modules/clientes/servicios/clientes.service';
import { Cliente } from 'src/app/modules/clientes/interfaces/cliente.interface';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';

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

describe('CarritoComprasComponent', () => {
  let component: CarritoComprasComponent;
  let fixture: ComponentFixture<CarritoComprasComponent>;
  let clientesService: any;
  let router: jasmine.SpyObj<Router>;

  // Mock de cliente
  const mockCliente: Cliente = {
    customer_id: '001',
    customer_name: 'Juan Pérez',
    identification: '123456789',
    addressString: 'Calle Principal 123',
    phone: '3001234567',
    customer_image: 'https://example.com/image1.jpg',
    isRecentVisit: true,
  };

  beforeEach(async () => {
    // Creamos un objeto simple para el servicio
    const clientesServiceMock = {
      clienteSeleccionado: mockCliente,
    };

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Configuramos TestBed
    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        CarritoComprasComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: ClientesService, useValue: clientesServiceMock },
        { provide: Router, useValue: routerSpy },
        { provide: TranslateService, useClass: MockTranslateService },
        TranslateStore,
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    // Obtenemos instancias
    fixture = TestBed.createComponent(CarritoComprasComponent);
    component = fixture.componentInstance;
    clientesService = TestBed.inject(ClientesService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load client info on ionViewWillEnter', () => {
    // Espiamos el método del componente
    spyOn(component, 'obtenerInfoCliente').and.callThrough();

    // Llamamos al método del ciclo de vida
    component.ionViewWillEnter();

    // Verificamos que se llamó el método
    expect(component.obtenerInfoCliente).toHaveBeenCalled();
  });

  it('should load client from service', () => {
    // Llamamos al método
    component.obtenerInfoCliente();

    // Verificamos que el cliente se cargó correctamente
    expect(component.clienteSeleccionado).toEqual(mockCliente);
  });

  it('should navigate back to home if no client is selected', () => {
    // Simulamos que no hay cliente seleccionado
    clientesService.clienteSeleccionado = undefined;

    // Llamamos al método
    component.obtenerInfoCliente();

    // Verificamos que se navega a home
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should call window.history.back when back method is called', () => {
    // Espiamos window.history.back
    spyOn(window.history, 'back');

    // Llamamos al método
    component.back();

    // Verificamos que se llamó window.history.back
    expect(window.history.back).toHaveBeenCalled();
  });
});
