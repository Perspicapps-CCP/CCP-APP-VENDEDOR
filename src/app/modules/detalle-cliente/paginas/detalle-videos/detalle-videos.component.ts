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
import { Video } from '../../interfaces/videos.interface';
import { VideoService } from '../../servicios/video.service';
import { MatCard } from '@angular/material/card';
import { Router } from '@angular/router';
import { ClientesService } from 'src/app/modules/clientes/servicios/clientes.service';
import { Cliente } from 'src/app/modules/clientes/interfaces/cliente.interface';
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
    MatCard,
  ],
})
export class DetalleVideosComponent implements ViewWillEnter {
  clienteSeleccionado?: Cliente;
  videos: Video[] = [];

  constructor(
    private clientesService: ClientesService,
    private videoService: VideoService,
    private router: Router,
  ) {}

  ionViewWillEnter(): void {
    this.obtenerInfoCliente();
  }

  obtenerInfoCliente() {
    if (this.clientesService.clienteSeleccionado) {
      this.clienteSeleccionado = this.clientesService.clienteSeleccionado;
      this.obtenerVideos();
    } else {
      this.router.navigate(['/home']);
    }
  }

  obtenerVideos() {
    this.videoService.obtenerVideos().subscribe(videos => {
      this.videos = videos;
    });
  }

  navegarADetalleVideo(video: Video) {
    this.videoService.videoSeleccionado = video;
    this.router.navigate([
      `/detalle-cliente/${this.clienteSeleccionado!.customer_id}/videos/${video.id}`,
    ]);
  }

  back() {
    window.history.back();
  }

  agregarVideo() {}
}
