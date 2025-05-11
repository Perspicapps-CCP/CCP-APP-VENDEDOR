import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  TranslateModule,
  TranslateService,
  TranslateLoader,
  TranslateFakeLoader,
  TranslateStore,
} from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { IonicModule } from '@ionic/angular';
import { RegistrarVideoComponent } from './registrar-video.component';
import { VideoService } from '../../servicios/video.service';
import { ClientesService } from 'src/app/modules/clientes/servicios/clientes.service';
import { Cliente } from 'src/app/modules/clientes/interfaces/cliente.interface';

// Función mejorada para crear un FileList mock
function createMockFileList(files: File[]): FileList {
  const fileList: Partial<FileList> = {
    length: files.length,
    item: (index: number) => files[index] || null,
  };

  // Agregar los índices como propiedades
  files.forEach((file, index) => {
    Object.defineProperty(fileList, index, {
      value: file,
      enumerable: true,
    });
  });

  return fileList as FileList;
}

describe('RegistrarVideoComponent', () => {
  let component: RegistrarVideoComponent;
  let fixture: ComponentFixture<RegistrarVideoComponent>;
  let clientesService: jasmine.SpyObj<Partial<ClientesService>>;
  let videoService: jasmine.SpyObj<VideoService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let translateService: TranslateService;

  // Mock data para cliente
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

  beforeEach(async () => {
    // Crear mocks para los servicios con implementación menos estricta para tipos
    const videoServiceSpy = jasmine.createSpyObj<VideoService>('VideoService', ['crearVideo']);

    // Configuramos el spy para que acepte cualquier parámetro
    videoServiceSpy.crearVideo.and.callFake((...args: any[]) => {
      return of({});
    });

    const clientesServiceSpy = jasmine.createSpyObj('ClientesService', [], {
      clienteSeleccionado: mockCliente,
    });

    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
          defaultLanguage: 'es',
        }),
        RegistrarVideoComponent, // Componente standalone va en imports
      ],
      // No declarations array para componentes standalone
      providers: [
        { provide: VideoService, useValue: videoServiceSpy },
        { provide: ClientesService, useValue: clientesServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        TranslateStore,
      ],
      schemas: [NO_ERRORS_SCHEMA], // Para manejar elementos desconocidos en templates
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarVideoComponent);
    component = fixture.componentInstance;

    videoService = TestBed.inject(VideoService) as jasmine.SpyObj<VideoService>;
    clientesService = TestBed.inject(ClientesService) as jasmine.SpyObj<Partial<ClientesService>>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    translateService = TestBed.inject(TranslateService);

    // Configurar TranslateService correctamente
    translateService.setDefaultLang('es');
    translateService.use('es');

    // Mock del método get de TranslateService
    spyOn(translateService, 'get').and.callFake((key: string) => {
      // Retornar un observable con un mensaje de traducción
      return of(
        key === 'DETALLE_VIDEOS.CREAR_VIDEO.FORM.VIDEO_CHARGED'
          ? 'video(s) cargado(s)'
          : 'mensaje traducido',
      );
    });

    // Detectar cambios iniciales
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Prueba para el método isInvalid
  it('should identify invalid fields correctly', () => {
    // Marcar un campo como tocado y verificar
    component.videoForm.get('title')?.markAsTouched();
    expect(component.isInvalid('title')).toBeTruthy();

    // Establecer un valor válido y verificar
    component.videoForm.get('title')?.setValue('Título de prueba');
    expect(component.isInvalid('title')).toBeFalsy();
  });

  // Prueba para getErrorMessage
  it('should return correct error messages', () => {
    // Verificar mensaje de error para campo requerido
    const errorMessage = component.getErrorMessage('title');
    expect(errorMessage.key).toBe('DETALLE_VIDEOS.CREAR_VIDEO.FORM_ERRORS.FIELD_REQUIRED');

    // Verificar que no hay mensaje de error cuando el campo es válido
    component.videoForm.get('title')?.setValue('Título de prueba');
    const noErrorMessage = component.getErrorMessage('title');
    expect(noErrorMessage.key).toBe('');
  });

  // Prueba para onFileSelected con archivos válidos
  it('should handle valid video file selection', () => {
    // Crear un mock de FileList con un archivo de video válido
    const mockFile = new File([''], 'test.mp4', { type: 'video/mp4' });
    const mockFileList = createMockFileList([mockFile]);

    const mockEvent = {
      target: {
        files: mockFileList,
      },
    };

    // Espiar el método allFilesIsVideo
    spyOn(component, 'allFilesIsVideo').and.returnValue(true);

    // Espiar patchValue del formulario
    spyOn(component.videoForm, 'patchValue').and.callThrough();

    // Llamar al método
    component.onFileSelected(mockEvent);

    // Verificar que se validaron los archivos
    expect(component.allFilesIsVideo).toHaveBeenCalled();

    // Verificar que se obtuvo el mensaje traducido
    expect(translateService.get).toHaveBeenCalledWith(
      'DETALLE_VIDEOS.CREAR_VIDEO.FORM.VIDEO_CHARGED',
    );

    // Verificar que se actualizó el formulario correctamente
    expect(component.videoForm.patchValue).toHaveBeenCalled();
  });

  // Prueba para onFileSelected con archivos inválidos
  it('should handle invalid file selection', () => {
    // Crear un mock de FileList con un archivo no válido
    const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
    const mockFileList = createMockFileList([mockFile]);

    const mockEvent = {
      target: {
        files: mockFileList,
      },
    };

    // Espiar el método allFilesIsVideo para que devuelva false
    spyOn(component, 'allFilesIsVideo').and.returnValue(false);

    // Espiar patchValue del formulario
    spyOn(component.videoForm, 'patchValue').and.callThrough();

    // Espiar markAsDirty y markAsTouched
    const videosTextControl = component.videoForm.get('videos_text');
    spyOn(videosTextControl!, 'markAsDirty');
    spyOn(videosTextControl!, 'markAsTouched');

    // Llamar al método
    component.onFileSelected(mockEvent);

    // Verificar que se validaron los archivos
    expect(component.allFilesIsVideo).toHaveBeenCalled();

    // Verificar que se actualizó el formulario correctamente para el caso de error
    expect(component.videoForm.patchValue).toHaveBeenCalledWith({ videos: null });
    expect(component.videoForm.patchValue).toHaveBeenCalledWith({ videos_text: null });

    // Verificar que se marcó el campo como sucio y tocado
    expect(videosTextControl!.markAsDirty).toHaveBeenCalled();
    expect(videosTextControl!.markAsTouched).toHaveBeenCalled();
  });

  // Prueba para allFilesIsVideo
  it('should validate video files correctly', () => {
    // Crear un mock de FileList con un archivo de video válido
    const mockFile = new File([''], 'test.mp4', { type: 'video/mp4' });
    const mockFileList = createMockFileList([mockFile]);

    // Llamar al método
    const result = component.allFilesIsVideo(mockFileList);

    // Verificar que retorna true para archivos válidos
    expect(result).toBeTruthy();
  });

  // Prueba para allFilesIsVideo con archivos inválidos
  it('should reject non-video files', () => {
    // Crear un mock de FileList con un archivo no válido
    const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
    const mockFileList = createMockFileList([mockFile]);

    // Llamar al método
    const result = component.allFilesIsVideo(mockFileList);

    // Verificar que retorna false para archivos inválidos
    expect(result).toBeFalsy();

    // Verificar que se obtuvo el mensaje traducido
    expect(translateService.get).toHaveBeenCalledWith(
      'DETALLE_VIDEOS.CREAR_VIDEO.FORM_ERRORS.ALL_FILES_MUST_BE_VIDEOS',
    );

    // Verificar que se mostró el mensaje de error
    expect(snackBar.open).toHaveBeenCalled();
  });

  // Prueba para el método crearVideo con éxito
  it('should create video successfully', fakeAsync(() => {
    // Establecer valores válidos en el formulario
    component.videoForm.patchValue({
      title: 'Título de prueba',
      description: 'Descripción de prueba',
      videos_text: '1 video(s) cargado(s)',
    });

    // Simular campo videos válido
    const mockFile = new File([''], 'test.mp4', { type: 'video/mp4' });
    const mockFileList = createMockFileList([mockFile]);

    // Asignar el FileList al formulario
    component.videoForm.get('videos')?.setValue(mockFileList);

    // Espiar el evento closeModal
    spyOn(component.closeModal, 'emit');

    // Reconfigurar el servicio para retornar éxito, usando una implementación más flexible
    videoService.crearVideo.and.callFake((...args: any[]) => {
      return of({});
    });

    // Llamar al método
    component.crearVideo();
    tick();

    // Verificar que se llamó al servicio
    expect(videoService.crearVideo).toHaveBeenCalled();

    // Verificar mensaje de éxito
    expect(translateService.get).toHaveBeenCalledWith('DETALLE_VIDEOS.CREAR_VIDEO.TOAST.SUCCESS');
    expect(snackBar.open).toHaveBeenCalled();

    // Verificar que se emitió closeModal con true
    expect(component.closeModal.emit).toHaveBeenCalledWith(true);
  }));

  // Prueba para el método crearVideo con error
  it('should handle error when creating video fails', fakeAsync(() => {
    // Establecer valores válidos en el formulario
    component.videoForm.patchValue({
      title: 'Título de prueba',
      description: 'Descripción de prueba',
      videos_text: '1 video(s) cargado(s)',
    });

    // Simular campo videos válido
    const mockFile = new File([''], 'test.mp4', { type: 'video/mp4' });
    const mockFileList = createMockFileList([mockFile]);

    // Asignar el FileList al formulario
    component.videoForm.get('videos')?.setValue(mockFileList);

    // Espiar el evento closeModal
    spyOn(component.closeModal, 'emit');

    // Configurar servicio para retornar error, usando una implementación más flexible
    videoService.crearVideo.and.callFake((...args: any[]) => {
      return throwError(() => new Error('Error al crear video'));
    });

    // Llamar al método
    component.crearVideo();
    tick();

    // Verificar que se llamó al servicio
    expect(videoService.crearVideo).toHaveBeenCalled();

    // Verificar mensaje de error
    expect(translateService.get).toHaveBeenCalledWith('DETALLE_VIDEOS.CREAR_VIDEO.TOAST.ERROR');
    expect(snackBar.open).toHaveBeenCalled();

    // Verificar que se emitió closeModal con false
    expect(component.closeModal.emit).toHaveBeenCalledWith(false);
  }));
});
