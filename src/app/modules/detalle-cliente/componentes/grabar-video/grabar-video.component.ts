import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  IonHeader,
  IonButton,
  IonContent,
  IonTitle,
  IonButtons,
  IonToolbar,
  AlertController,
} from '@ionic/angular/standalone';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Capacitor } from '@capacitor/core';
import { CameraPreview } from '@capacitor-community/camera-preview';
import { Directory, Filesystem } from '@capacitor/filesystem';

@Component({
  selector: 'app-grabar-video',
  templateUrl: './grabar-video.component.html',
  styleUrls: ['./grabar-video.component.scss'],
  imports: [sharedImports, IonTitle, IonButton, IonButtons, IonToolbar, IonContent, IonHeader],
  providers: [AndroidPermissions],
})
export class GrabarVideoComponent implements OnInit, OnDestroy {
  @Output() closeModal = new EventEmitter<File | null>();
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  videoFileToUpload: File | null = null;
  videoUrl: string | null = null;
  isRecording = false;
  isPreviewActive = false;
  flashOn = false;
  cameraPosition: 'rear' | 'front' = 'rear';
  permissionsGranted = false;

  constructor(
    private androidPermissions: AndroidPermissions,
    private alertController: AlertController,
  ) {}

  ngOnInit() {
    // Verificar permisos al iniciar el componente
    if (Capacitor.isNativePlatform()) {
      this.verificarPermisos();
    }
  }

  ngOnDestroy(): void {
    // Detener la vista previa de la cámara al destruir el componente
    if (this.isPreviewActive) {
      this.stopCameraPreview();
    }
  }

  async verificarPermisos() {
    try {
      const cameraPermissionStatus = await this.androidPermissions.checkPermission(
        this.androidPermissions.PERMISSION.CAMERA,
      );

      const audioPermissionStatus = await this.androidPermissions.checkPermission(
        this.androidPermissions.PERMISSION.RECORD_AUDIO,
      );

      if (!cameraPermissionStatus.hasPermission || !audioPermissionStatus.hasPermission) {
        // Si no tiene permisos, solicitarlos
        await this.solicitarPermisos();
      } else {
        this.permissionsGranted = true;
        this.agregarVideo();
      }
    } catch (err) {
      console.error('Error al verificar permisos:', err);
      await this.mostrarAlertaPermisosDenegados();
    }
  }

  async solicitarPermisos(): Promise<any> {
    try {
      const result = await this.androidPermissions.requestPermissions([
        this.androidPermissions.PERMISSION.RECORD_AUDIO,
        this.androidPermissions.PERMISSION.CAMERA,
      ]);

      // Verificar si todos los permisos fueron concedidos
      if (result.hasPermission) {
        this.permissionsGranted = true;
        return result;
      } else {
        console.warn('No se concedieron todos los permisos necesarios');
        await this.mostrarAlertaPermisosDenegados();
        return result;
      }
    } catch (err) {
      console.error('Error solicitando permisos:', err);
      await this.mostrarAlertaPermisosDenegados();
      throw err;
    }
  }

  async mostrarAlertaPermisosDenegados() {
    const alert = await this.alertController.create({
      header: 'Permisos requeridos',
      message:
        'Para usar la función de grabación de video, necesitamos acceso a la cámara y al micrófono. Por favor, concede estos permisos en la configuración de tu dispositivo.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            this.back();
          },
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.back();
          },
        },
      ],
    });

    await alert.present();
  }

  back() {
    // Si la cámara está activa, detenerla antes de regresar
    if (this.isPreviewActive) {
      this.stopCameraPreview();
    }
    this.closeModal.emit(null);
  }

  async agregarVideo() {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Verificar si ya tenemos permisos
    if (!this.permissionsGranted) {
      await this.verificarPermisos();

      // Si después de verificar aún no tenemos permisos, salir
      if (!this.permissionsGranted) {
        return;
      }
    }

    try {
      this.isPreviewActive = true;

      setTimeout(async () => {
        const container = document.getElementById('camera-preview-container');

        if (!container) {
          console.error('No se encontró el contenedor para la cámara');
          this.isPreviewActive = false;
          return;
        }

        const rect = container.getBoundingClientRect();

        try {
          await CameraPreview.start({
            position: this.cameraPosition,
            parent: 'camera-preview-container',
            className: 'camera-preview',
            toBack: false,
            enableHighResolution: true,
            disableAudio: false,
            enableZoom: true,
            // Usar las dimensiones exactas del contenedor
            width: Math.floor(rect.width),
            height: Math.floor(rect.height),
            // Ubicación exacta en la pantalla
            x: Math.floor(rect.left),
            y: Math.floor(rect.top),
            rotateWhenOrientationChanged: false,
          });
        } catch (error) {}
      }, 100);
    } catch (error) {
      this.isPreviewActive = false;
      await this.mostrarAlertaErrorCamara(error);
    }
  }

  async mostrarAlertaErrorCamara(error: any) {
    const alert = await this.alertController.create({
      header: 'Error al acceder a la cámara',
      message:
        'No se pudo iniciar la cámara. ' +
        'Por favor, verifica que la aplicación tenga los permisos necesarios y que tu dispositivo soporte esta función.',
      buttons: ['OK'],
    });

    await alert.present();
  }

  async startRecording() {
    if (!this.isRecording && this.isPreviewActive) {
      try {
        this.isRecording = true;

        // Comenzar a grabar
        await CameraPreview.startRecordVideo({
          height: 720,
          width: 480,
        });
      } catch (error) {
        console.error('Error al iniciar la grabación:', error);
        this.isRecording = false;
      }
    }
  }

  async stopRecording() {
    if (this.isRecording) {
      try {
        this.isRecording = false;

        // Detener la grabación
        const resultRecordVideo = (await CameraPreview.stopRecordVideo()) as any;

        // Guardamos la ruta del archivo
        if (resultRecordVideo && resultRecordVideo.videoFilePath) {
          // Detener la vista previa de la cámara
          await this.stopCameraPreview();

          // Procesar el archivo y establecer la URL para reproducción
          await this.processVideoFile(resultRecordVideo.videoFilePath);
        } else {
          console.error('No se recibió la ruta del video grabado');
        }
      } catch (error) {
        console.error('Error al detener la grabación:', error);
      }
    }
  }

  async processVideoFile(filePath: string) {
    try {
      // Extraer el nombre del archivo de la ruta
      const fileName = filePath.split('/').pop() || 'video.mp4';

      // Ruta temporal para el blob
      const tempPath = `ccp-temp_${Date.now()}.mp4`;

      // Copiar el archivo de la caché al directorio de documentos
      await Filesystem.copy({
        from: fileName,
        to: tempPath,
        directory: Directory.Cache,
        toDirectory: Directory.Documents,
      });

      // Ahora leer el archivo desde Documents
      const fileUri = await Filesystem.getUri({
        path: tempPath,
        directory: Directory.Documents,
      });

      if (fileUri && fileUri.uri) {
        const newUri = Capacitor.convertFileSrc(fileUri.uri);
        // Convertir base64 a blob
        const base64Response = await fetch(newUri);
        const blob = await base64Response.blob();
        const file = new File([blob], fileName, { type: blob.type });

        this.videoFileToUpload = file;

        this.closeModal.emit(file);
      }
    } catch (error) {
      console.error('Error al procesar el archivo de video:', JSON.stringify(error));
    }
  }

  async stopCameraPreview() {
    if (this.isRecording) {
      await this.stopRecording();
      return; // Ya llamamos a stopCameraPreview desde stopRecording
    }

    if (this.isPreviewActive) {
      try {
        await CameraPreview.stop();
        this.isPreviewActive = false;
      } catch (error) {
        console.error('Error al detener la vista previa:', error);
      }
    }
  }

  async switchCamera() {
    if (this.isPreviewActive) {
      try {
        this.cameraPosition = this.cameraPosition === 'rear' ? 'front' : 'rear';
        await CameraPreview.flip();
      } catch (error) {
        console.error('Error al cambiar de cámara:', error);
      }
    }
  }

  async toggleFlash() {
    if (this.isPreviewActive) {
      try {
        this.flashOn = !this.flashOn;
        if (this.flashOn) {
          await CameraPreview.setFlashMode({ flashMode: 'torch' });
        } else {
          await CameraPreview.setFlashMode({ flashMode: 'off' });
        }
      } catch (error) {
        console.error('Error al alternar el flash:', error);
      }
    }
  }
}
