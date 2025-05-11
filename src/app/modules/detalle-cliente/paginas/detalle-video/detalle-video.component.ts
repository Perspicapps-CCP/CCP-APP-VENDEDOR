import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import { VideoService } from '../../servicios/video.service';
import { Video } from '../../interfaces/videos.interface';

@Component({
  selector: 'app-detalle-video',
  templateUrl: './detalle-video.component.html',
  styleUrls: ['./detalle-video.component.scss'],
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
export class DetalleVideoComponent implements ViewWillEnter {
  videoSeleccionado: Video | null = null;

  constructor(private videoService: VideoService) {}

  ionViewWillEnter(): void {
    this.obtenerInfoVideo();
  }

  obtenerInfoVideo() {
    if (this.videoService.videoSeleccionado) {
      this.videoSeleccionado = this.videoService.videoSeleccionado;
    } else {
      this.back();
    }
  }

  back() {
    window.history.back();
  }
}
