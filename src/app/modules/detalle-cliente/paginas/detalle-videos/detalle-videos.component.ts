import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import { Capacitor } from '@capacitor/core';
import { CameraPreview } from '@capacitor-community/camera-preview';

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
export class DetalleVideosComponent {
  videoUrl: string | null = null;
  isRecording = false;

  constructor() {}

  back() {
    window.history.back();
  }

  async agregarVideo() {
    if (Capacitor.isNativePlatform()) {
      try {
        // Iniciar la vista previa de la cámara
        await CameraPreview.start({
          position: 'rear',
          parent: 'content',
          className: 'camera-preview',
          toBack: true,
          enableHighResolution: true,
          disableAudio: false,
        });

        // Iniciar grabación de video
        await this.startRecording();
      } catch (error) {
        console.error('Error al iniciar la cámara:', error);
      }
    } else {
      console.log('Esta función solo está disponible en dispositivos nativos');
    }
  }

  async startRecording() {
    if (!this.isRecording) {
      try {
        this.isRecording = true;
        console.log('Iniciando grabación de video...');

        // Comenzar a grabar (empieza a grabar automáticamente cuando se inicia la cámara)
        const result = await CameraPreview.startRecordVideo({
          height: 1280,
          width: 720,
        });

        // Para detener la grabación después de un tiempo (opcional)
        setTimeout(() => {
          this.stopRecording();
        }, 10000); // Detener después de 10 segundos (ajusta según necesites)
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

        // En realidad, necesitas obtener la ruta del video por otro método
        // Este es un ejemplo, la implementación real dependerá de la API específica
        console.log('Video grabado completado');

        // Para pruebas, puedes asignar una URL de muestra
        this.videoUrl = 'ruta/al/video/grabado.mp4';

        // Detener la vista previa de la cámara
        await CameraPreview.stop();
      } catch (error) {
        console.error('Error al detener la grabación:', error);
      }
    }
  }
}
