import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import {
  TranslateModule,
  TranslateService,
  TranslateLoader,
  TranslateFakeLoader,
} from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { CrearVisitaComponent } from './crear-visita.component';
import { ClientesService } from 'src/app/modules/clientes/servicios/clientes.service';
import { VisitasService } from '../../servicios/visitas.service';
import { Cliente } from 'src/app/modules/clientes/interfaces/cliente.interface';

describe('CrearVisitaComponent', () => {
  let component: CrearVisitaComponent;
  let fixture: ComponentFixture<CrearVisitaComponent>;
  let clientesService: ClientesService;
  let visitasService: VisitasService;
  let snackBar: MatSnackBar;
  let translateService: TranslateService;

  // Mock data para clientes
  const mockClientes: Cliente[] = [
    {
      customer_id: '1',
      customer_name: 'Cliente Test 1',
      identification: '12345678',
      addressString: 'Dirección Test 1',
      phone: '1234567890',
      customer_image: 'imagen1.jpg',
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
        full_name: 'Cliente Test 1',
        email: 'cliente1@example.com',
        username: 'cliente1',
        phone: '1234567890',
        id_type: 'CC',
        identification: '12345678',
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
    },
    {
      customer_id: '2',
      customer_name: 'Cliente Test 2',
      identification: '87654321',
      addressString: 'Dirección Test 2',
      phone: '0987654321',
      customer_image: 'imagen2.jpg',
      isRecentVisit: true,
      address: {
        id: 'addr-002',
        line: 'Calle Secundaria 456',
        neighborhood: 'Norte',
        city: 'Medellín',
        state: 'Antioquia',
        country: 'Colombia',
        latitude: 6.2476,
        longitude: -75.5666,
      },
      client: {
        id: 'client-002',
        full_name: 'Cliente Test 2',
        email: 'cliente2@example.com',
        username: 'cliente2',
        phone: '0987654321',
        id_type: 'CC',
        identification: '87654321',
        created_at: new Date(),
        updated_at: new Date(),
        address: {
          id: 'addr-002',
          line: 'Calle Secundaria 456',
          neighborhood: 'Norte',
          city: 'Medellín',
          state: 'Antioquia',
          country: 'Colombia',
          latitude: 6.2476,
          longitude: -75.5666,
        },
      },
    },
  ];

  // Crear mocks para los servicios
  const clientesServiceMock = {
    obtenerClientes: jasmine.createSpy('obtenerClientes').and.returnValue(of(mockClientes)),
  };

  const visitasServiceMock = {
    registrarVisita: jasmine.createSpy('registrarVisita').and.returnValue(of({})),
  };

  const snackBarMock = {
    open: jasmine.createSpy('open'),
  };

  const translateServiceMock = {
    get: jasmine.createSpy('get').and.returnValue(of('mensaje traducido')),
    instant: jasmine.createSpy('instant').and.returnValue('mensaje traducido'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
        NgbTypeaheadModule,
      ],
      schemas: [NO_ERRORS_SCHEMA], // Permite ignorar elementos no reconocidos en templates
      providers: [
        { provide: ClientesService, useValue: clientesServiceMock },
        { provide: VisitasService, useValue: visitasServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    })
      .overrideComponent(CrearVisitaComponent, {
        set: {
          // Sustituimos el template para evitar problemas
          template: `<div>Mocked Template for Testing</div>`,
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CrearVisitaComponent);
    component = fixture.componentInstance;
    clientesService = TestBed.inject(ClientesService);
    visitasService = TestBed.inject(VisitasService);
    snackBar = TestBed.inject(MatSnackBar);
    translateService = TestBed.inject(TranslateService);

    // Resetear los spies antes de cada prueba
    clientesServiceMock.obtenerClientes.calls.reset();
    visitasServiceMock.registrarVisita.calls.reset();
    snackBarMock.open.calls.reset();
    translateServiceMock.get.calls.reset();

    // Configurar manualmente los datos necesarios
    component.clientes = mockClientes;
    // Inicializar el emisor de eventos
    component.closeModal = new EventEmitter<boolean>();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Prueba que se llamen a los servicios correctamente en ngOnInit
  it('should load clients on init', () => {
    component.ngOnInit();
    expect(clientesService.obtenerClientes).toHaveBeenCalled();
    expect(component.clientes).toEqual(mockClientes);
  });

  // Prueba para verificar la inicialización del formulario
  it('should initialize the form with required validators', () => {
    expect(component.visitaForm).toBeDefined();
    expect(component.visitaForm.get('client')?.validator).toBeTruthy();
    expect(component.visitaForm.get('description')?.validator).toBeTruthy();
    expect(component.visitaForm.get('images')?.validator).toBeTruthy();
    expect(component.visitaForm.get('images_text')?.validator).toBeTruthy();
  });

  // Prueba para el método isInvalid
  it('should return true for invalid and touched fields', () => {
    // Marcar campo como tocado e inválido
    component.visitaForm.get('description')?.markAsTouched();
    // Verificar que isInvalid retorne true para un campo inválido y tocado
    expect(component.isInvalid('description')).toBeTruthy();

    // Establecer un valor válido
    component.visitaForm.get('description')?.setValue('Descripción de prueba');
    expect(component.isInvalid('description')).toBeFalsy();
  });

  // Prueba para el método getErrorMessage con error 'required'
  it('should return required error message for required fields', () => {
    const errorMessage = component.getErrorMessage('description');
    expect(errorMessage.key).toBe('VISITAS.CREAR_VISITA.FORM_ERRORS.FIELD_REQUIRED');
  });

  // Prueba para el método formatter del typeahead
  it('should format client names correctly', () => {
    const cliente = { customer_name: 'Test Client' };
    expect(component.formatter(cliente)).toBe('Test Client');
  });

  // Pruebas simplificadas para los métodos problemáticos
  it('should have a method to validate file types', () => {
    expect(component.allFilesIsImage).toBeDefined();
    expect(typeof component.allFilesIsImage).toBe('function');
  });

  it('should have a method to handle file selection', () => {
    expect(component.onFileSelected).toBeDefined();
    expect(typeof component.onFileSelected).toBe('function');
  });

  // Prueba de integración simplificada para crearVisita
  it('should call registrarVisita when form is valid', () => {
    // Espiar el método registrarVisita
    visitasServiceMock.registrarVisita.and.returnValue(of({}));

    // Establecer valores para el formulario sin manipular FileList
    component.visitaForm.patchValue({
      client: mockClientes[0],
      description: 'Descripción de prueba',
      images_text: '1 imagen(es) cargada(s)',
    });

    // Configurar manualmente el campo 'images' para que sea válido sin asignar un FileList
    const imagesControl = component.visitaForm.get('images');
    if (imagesControl) {
      imagesControl.markAsDirty();
      imagesControl.markAsTouched();
      // Usamos una asignación directa simple en lugar de un mock de FileList
      imagesControl.setValue([new File([''], 'test.jpg', { type: 'image/jpeg' })]);
    }

    // Espiar el método closeModal.emit
    spyOn(component.closeModal, 'emit');

    // Llamar al método crearVisita
    component.crearVisita();

    // Verificar que el servicio fue llamado
    expect(visitasService.registrarVisita).toHaveBeenCalled();
    expect(translateService.get).toHaveBeenCalledWith('VISITAS.CREAR_VISITA.TOAST.SUCCESS');
    expect(component.closeModal.emit).toHaveBeenCalledWith(true);
  });

  // Prueba para el método crearVisita con error
  it('should handle error when creating a visit fails', fakeAsync(() => {
    // Configurar el mock para que devuelva un error
    visitasServiceMock.registrarVisita.and.returnValue(
      throwError(() => new Error('Error al crear visita')),
    );

    // Configurar el formulario de manera similar a la prueba anterior
    component.visitaForm.patchValue({
      client: mockClientes[0],
      description: 'Descripción de prueba',
      images_text: '1 imagen(es) cargada(s)',
    });

    const imagesControl = component.visitaForm.get('images');
    if (imagesControl) {
      imagesControl.markAsDirty();
      imagesControl.markAsTouched();
      imagesControl.setValue([new File([''], 'test.jpg', { type: 'image/jpeg' })]);
    }

    // Espiar el método closeModal.emit
    spyOn(component.closeModal, 'emit');

    // Llamar al método
    component.crearVisita();
    tick();

    // Verificar que el servicio fue llamado
    expect(visitasService.registrarVisita).toHaveBeenCalled();

    // Verificar que se muestra el mensaje de error
    expect(translateService.get).toHaveBeenCalledWith('VISITAS.CREAR_VISITA.TOAST.ERROR');
    expect(snackBar.open).toHaveBeenCalled();

    // Verificar que se emite el evento closeModal con false
    expect(component.closeModal.emit).toHaveBeenCalledWith(false);

    // Restablecer el spy para las siguientes pruebas
    visitasServiceMock.registrarVisita.and.returnValue(of({}));
  }));

  // NUEVAS PRUEBAS PARA LOS MÉTODOS REQUERIDOS

  // Test para searchClientes function
  it('should filter clients correctly with searchClientes', fakeAsync(() => {
    // Set up test data
    component.clientes = mockClientes;

    // Create a mock Observable for the text$ parameter
    const text$ = of('Cliente Test 1');

    // Subscribe to the searchClientes function
    let results: readonly { customer_name: string }[] = [];
    component.searchClientes(text$).subscribe((res: readonly { customer_name: string }[]) => {
      results = res;
    });

    // Force debounceTime to complete
    tick(200);

    // Verify results
    expect(results.length).toBe(1);
    expect(results[0].customer_name).toBe('Cliente Test 1');

    // Test with short term (< 2 chars)
    const shortText$ = of('C');
    component.searchClientes(shortText$).subscribe((res: readonly { customer_name: string }[]) => {
      results = res;
    });

    tick(200);

    // Should return empty array for terms less than 2 chars
    expect(results.length).toBe(0);

    // Test with term that matches multiple clients
    const multiText$ = of('Cliente');
    component.searchClientes(multiText$).subscribe((res: readonly { customer_name: string }[]) => {
      results = res;
    });

    tick(200);

    // Should return both clients
    expect(results.length).toBe(2);
    expect(results[0].customer_name).toBe('Cliente Test 1');
    expect(results[1].customer_name).toBe('Cliente Test 2');

    // Test with no matches
    const noMatchText$ = of('XYZ');
    component
      .searchClientes(noMatchText$)
      .subscribe((res: readonly { customer_name: string }[]) => {
        results = res;
      });

    tick(200);

    // Should return empty array
    expect(results.length).toBe(0);
  }));

  // Additional tests for formatter function
  it('should format customer_name with formatter function', () => {
    // Test with regular object
    const cliente = { customer_name: 'Test Client' };
    expect(component.formatter(cliente)).toBe('Test Client');

    // Test with empty name
    const emptyNameCliente = { customer_name: '' };
    expect(component.formatter(emptyNameCliente)).toBe('');

    // Test with different customer_name value
    const differentCliente = { customer_name: 'Cliente Prueba' };
    expect(component.formatter(differentCliente)).toBe('Cliente Prueba');
  });

  // Comprehensive tests for getErrorMessage function
  describe('getErrorMessage function', () => {
    it('should return required error message for required fields', () => {
      // For client field
      component.visitaForm.get('client')?.markAsTouched();
      const clientErrorMessage = component.getErrorMessage('client');
      expect(clientErrorMessage.key).toBe('VISITAS.CREAR_VISITA.FORM_ERRORS.FIELD_REQUIRED');

      // For description field
      component.visitaForm.get('description')?.markAsTouched();
      const descriptionErrorMessage = component.getErrorMessage('description');
      expect(descriptionErrorMessage.key).toBe('VISITAS.CREAR_VISITA.FORM_ERRORS.FIELD_REQUIRED');

      // For images field
      component.visitaForm.get('images')?.markAsTouched();
      const imagesErrorMessage = component.getErrorMessage('images');
      expect(imagesErrorMessage.key).toBe('VISITAS.CREAR_VISITA.FORM_ERRORS.FIELD_REQUIRED');
    });

    it('should return empty key when there are no errors', () => {
      // Set valid values for fields
      component.visitaForm.get('client')?.setValue(mockClientes[0]);
      component.visitaForm.get('description')?.setValue('Descripción de prueba');
      component.visitaForm
        .get('images')
        ?.setValue([new File([''], 'test.jpg', { type: 'image/jpeg' })]);
      component.visitaForm.get('images_text')?.setValue('1 imagen(es) cargada(s)');

      // Verify no error messages are returned
      const clientErrorMessage = component.getErrorMessage('client');
      expect(clientErrorMessage.key).toBe('');

      const descriptionErrorMessage = component.getErrorMessage('description');
      expect(descriptionErrorMessage.key).toBe('');
    });

    it('should handle non-existent control names gracefully', () => {
      // Test with a non-existent control name
      const nonExistentErrorMessage = component.getErrorMessage('nonExistentControl');
      expect(nonExistentErrorMessage.key).toBe('');
    });

    it('should handle other validator errors correctly', () => {
      // Add a custom error to a control
      const descriptionControl = component.visitaForm.get('description');
      descriptionControl?.setErrors({ customError: true });

      // Should return empty key for non-required errors
      const errorMessage = component.getErrorMessage('description');
      expect(errorMessage.key).toBe('');
    });
  });

  // Tests para el método onFileSelected
  describe('onFileSelected method', () => {
    it('should update form with valid image files', () => {
      // Crear un mock de event con files
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const mockFileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => mockFile,
      } as unknown as FileList;

      const mockEvent = {
        target: {
          files: mockFileList,
        },
      };

      // Espiar el método allFilesIsImage
      spyOn(component, 'allFilesIsImage').and.returnValue(true);

      // Espiar patchValue del formulario
      spyOn(component.visitaForm, 'patchValue');

      // Configurar el spy para translate.get
      translateServiceMock.get.and.returnValue(of('imagen(es) cargada(s)'));

      // Llamar al método
      component.onFileSelected(mockEvent);

      // Verificar que se validaron los archivos
      expect(component.allFilesIsImage).toHaveBeenCalledWith(mockFileList);

      // Verificar que se obtuvo el mensaje traducido
      expect(translateService.get).toHaveBeenCalledWith('VISITAS.CREAR_VISITA.FORM.IMAGES_CHARGED');

      // Verificar que se actualizó el formulario correctamente
      expect(component.visitaForm.patchValue).toHaveBeenCalledWith(
        jasmine.objectContaining({
          images_text: jasmine.any(String),
        }),
      );
      expect(component.visitaForm.patchValue).toHaveBeenCalledWith(
        jasmine.objectContaining({
          images: mockFileList,
        }),
      );
    });

    it('should handle invalid files by resetting form values', () => {
      // Crear un mock de event con files
      const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
      const mockFileList = {
        0: mockFile,
        length: 1,
        item: (index: number) => mockFile,
      } as unknown as FileList;

      const mockEvent = {
        target: {
          files: mockFileList,
        },
      };

      // Espiar el método allFilesIsImage para que devuelva false
      spyOn(component, 'allFilesIsImage').and.returnValue(false);

      // Espiar patchValue del formulario
      spyOn(component.visitaForm, 'patchValue');

      // Espiar markAsDirty y markAsTouched
      const imagesTextControl = component.visitaForm.get('images_text');
      spyOn(imagesTextControl!, 'markAsDirty');
      spyOn(imagesTextControl!, 'markAsTouched');

      // Llamar al método
      component.onFileSelected(mockEvent);

      // Verificar que se validaron los archivos
      expect(component.allFilesIsImage).toHaveBeenCalledWith(mockFileList);

      // Verificar que se actualizó el formulario correctamente para el caso de error
      expect(component.visitaForm.patchValue).toHaveBeenCalledWith({ images: null });
      expect(component.visitaForm.patchValue).toHaveBeenCalledWith({ images_text: null });

      // Verificar que se marcó el campo como sucio y tocado
      expect(imagesTextControl!.markAsDirty).toHaveBeenCalled();
      expect(imagesTextControl!.markAsTouched).toHaveBeenCalled();
    });
  });

  // Tests para el método allFilesIsImage
  describe('allFilesIsImage method', () => {
    it('should return true for valid image files', () => {
      // Crear un FileList mock con un archivo de imagen válido
      const mockJpgFile = new File([''], 'image.jpg', { type: 'image/jpeg' });

      const mockFileList = {
        0: mockJpgFile,
        length: 1,
        item: (index: number) => mockJpgFile,
      } as unknown as FileList;

      // Llamar al método
      const result = component.allFilesIsImage(mockFileList);

      // Verificar que retorna true para archivos válidos
      expect(result).toBeTruthy();
    });

    it('should return false and show error message for invalid file types', () => {
      // Crear un FileList mock con un archivo no válido
      const mockTxtFile = new File([''], 'document.txt', { type: 'text/plain' });

      const mockFileList = {
        0: mockTxtFile,
        length: 1,
        item: (index: number) => mockTxtFile,
      } as unknown as FileList;

      // Configurar el spy para translate.get
      translateServiceMock.get.and.returnValue(of('Todos los archivos deben ser imágenes'));

      // Llamar al método
      const result = component.allFilesIsImage(mockFileList);

      // Verificar que retorna false para archivos inválidos
      expect(result).toBeFalsy();

      // Verificar que se obtuvo el mensaje traducido
      expect(translateService.get).toHaveBeenCalledWith(
        'VISITAS.CREAR_VISITA.FORM_ERRORS.ALL_FILES_MUST_BE_IMAGES',
      );

      // Verificar que se mostró el mensaje de error
      expect(snackBar.open).toHaveBeenCalledWith('Todos los archivos deben ser imágenes', '', {
        duration: 3000,
      });
    });

    it('should validate multiple image formats', () => {
      // Crear pruebas para los diferentes formatos de imagen
      const imageFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

      imageFormats.forEach(format => {
        const mockFile = new File([''], `test${format}`, { type: 'image/mock' });

        const mockFileList = {
          0: mockFile,
          length: 1,
          item: (index: number) => mockFile,
        } as unknown as FileList;

        // Llamar al método
        const result = component.allFilesIsImage(mockFileList);

        // Verificar que retorna true para cada formato de imagen válido
        expect(result).toBeTruthy(`El formato ${format} debería ser válido`);
      });
    });
  });
});
