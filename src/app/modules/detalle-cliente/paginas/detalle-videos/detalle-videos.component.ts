import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { CameraPreview } from '@capacitor-community/camera-preview';
import { Capacitor } from '@capacitor/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Component({
  selector: 'app-detalle-videos',
  templateUrl: './detalle-videos.component.html',
  styleUrls: ['./detalle-videos.component.scss'],
  imports: [
    sharedImports,
    IonButton,
    IonTitle,
    IonButtons,
    IonToolbar,
    IonContent,
    IonHeader,
    CommonModule,
  ],
})
export class DetalleVideosComponent implements OnDestroy {
  videoUrl: string | null = null;
  isRecording = false;
  isPreviewActive = false;
  flashOn = false;
  cameraPosition: 'rear' | 'front' = 'rear';

  constructor() {}

  back() {
    // Si la cámara está activa, detenerla antes de regresar
    if (this.isPreviewActive) {
      this.stopCameraPreview();
    }
    window.history.back();
  }

  async agregarVideo() {
    if (Capacitor.isNativePlatform()) {
      try {
        console.log('Iniciando cámara...');

        // Primero activamos la bandera para que se muestre el contenedor
        this.isPreviewActive = true;

        // Damos tiempo para que el DOM se actualice
        setTimeout(async () => {
          const container = document.getElementById('camera-preview-container');
          console.log('Contenedor de cámara encontrado:', container);

          if (!container) {
            console.error('No se encontró el contenedor para la cámara');
            this.isPreviewActive = false;
            return;
          }

          // Obtener las dimensiones y posición exactas
          const rect = container.getBoundingClientRect();
          console.log(
            'Dimensiones exactas: ' +
              JSON.stringify({
                width: Math.floor(rect.width),
                height: Math.floor(rect.height),
                x: Math.floor(rect.left),
                y: Math.floor(rect.top),
                containerOffsetTop: container.offsetTop,
                containerOffsetLeft: container.offsetLeft,
                windowInnerWidth: window.innerWidth,
                windowInnerHeight: window.innerHeight,
              }),
          );

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
              width: Math.floor(rect.width - 2),
              height: Math.floor(rect.height - 2),
              // Ubicación exacta en la pantalla
              x: Math.floor(rect.left + 1),
              y: Math.floor(rect.top + 1),
            });

            console.log('Cámara iniciada correctamente');

            // Asegurar que el elemento de la cámara tenga los estilos correctos
            setTimeout(() => {
              const previewElement = document.querySelector('.camera-preview');
              if (previewElement) {
                previewElement.setAttribute(
                  'style',
                  'width: 100% !important; height: 100% !important; position: absolute !important; top: 0 !important; left: 0 !important; object-fit: cover !important;',
                );
              }
            }, 200);
          } catch (error) {
            console.error('Error al iniciar la cámara:', error);
            this.isPreviewActive = false;
          }
        }, 100);
      } catch (error) {
        console.error('Error general al iniciar la cámara:', error);
      }
    } else {
      console.log('Esta función solo está disponible en dispositivos nativos');
    }
  }

  async startRecording() {
    if (!this.isRecording && this.isPreviewActive) {
      try {
        this.isRecording = true;
        console.log('Iniciando grabación de video...');

        // Comenzar a grabar
        await CameraPreview.startRecordVideo({
          height: 1280,
          width: 720,
        });

        console.log('Grabación iniciada');
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
        console.log('Deteniendo grabación de video...');

        // Detener la grabación
        const resultRecordVideo = (await CameraPreview.stopRecordVideo()) as any;
        console.log('Video grabado completado', JSON.stringify(resultRecordVideo));

        // Guardamos la ruta del archivo
        if (resultRecordVideo && resultRecordVideo.videoFilePath) {
          this.videoUrl = resultRecordVideo.videoFilePath;
          console.log('Ruta del archivo de video:', this.videoUrl);

          // Ahora podemos usar esta ruta para leer el archivo y enviarlo al backend
          if (this.videoUrl) {
            await this.processVideoFile(this.videoUrl);
          }
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
      console.log('Procesando archivo de video:', filePath);

      // Extraer el nombre del archivo de la ruta
      const fileName = filePath.split('/').pop() || 'video.mp4';

      // Crear un FormData para enviar el archivo
      const formData = new FormData();

      // Ruta temporal para el blob
      const tempPath = `temp_${Date.now()}.mp4`;

      // Copiar el archivo de la caché al directorio de documentos
      // (esto hace que sea más accesible)
      await Filesystem.copy({
        from: fileName,
        to: tempPath,
        directory: Directory.Cache,
        toDirectory: Directory.Documents,
      });

      // Ahora leer el archivo desde Documents
      const fileData = await Filesystem.readFile({
        path: tempPath,
        directory: Directory.Documents,
      });

      // Convertir a blob
      const blob =
        typeof fileData.data === 'string'
          ? this.base64ToBlob(fileData.data, 'video/mp4')
          : fileData.data;

      // Crear un objeto File
      const videoFile = new File([blob], fileName, { type: 'video/mp4' });

      console.log('Archivo de video creado:', videoFile.name, 'Tamaño:', videoFile.size);

      // Enviar al backend
      await this.uploadVideoToBackend(videoFile);

      // Limpiar el archivo temporal
      await Filesystem.deleteFile({
        path: tempPath,
        directory: Directory.Documents,
      });
    } catch (error) {
      console.error('Error al procesar el archivo de video:', error);
    }
  }

  private base64ToBlob(base64: string, type: string): Blob {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new Blob([bytes], { type: type });
  }

  async uploadVideoToBackend(videoFile: File) {
    try {
      console.log('Preparando para enviar video al backend...');

      // Crear un FormData para enviar el archivo
      const formData = new FormData();
      formData.append('video', videoFile);
      console.log('Solicitud de envío iniciada', JSON.stringify(formData));
    } catch (error) {
      console.error('Error al enviar el video al backend:', error);
    }
  }

  async stopCameraPreview() {
    if (this.isRecording) {
      await this.stopRecording();
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

  // Al destruir el componente, asegurarse de detener la cámara
  ngOnDestroy() {
    this.stopCameraPreview();
  }
}
