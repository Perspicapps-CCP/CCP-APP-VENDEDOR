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

          try {
            await CameraPreview.start({
              position: this.cameraPosition,
              parent: 'camera-preview-container',
              className: 'camera-preview',
              toBack: false,
              enableHighResolution: true,
              disableAudio: false,
              enableZoom: true,
              width: container.clientWidth,
              height: container.clientHeight,
              x: container.offsetLeft,
              y: container.offsetTop,
            });

            console.log('Cámara iniciada correctamente');
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
        await CameraPreview.stopRecordVideo();
        console.log('Video grabado completado');

        // No tenemos acceso directo a la ruta del video en esta API
        // Lo ideal sería implementar un listener o callback
        this.videoUrl = 'ruta/al/video/grabado.mp4';
      } catch (error) {
        console.error('Error al detener la grabación:', error);
      }
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
