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
  IonModal,
} from '@ionic/angular/standalone';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import { Video } from '../../interfaces/videos.interface';
import { VideoService } from '../../servicios/video.service';
import { MatCard } from '@angular/material/card';
import { Router } from '@angular/router';
import { ClientesService } from 'src/app/modules/clientes/servicios/clientes.service';
import { Cliente } from 'src/app/modules/clientes/interfaces/cliente.interface';
import { RegistrarVideoComponent } from '../../componentes/registrar-video/registrar-video.component';
import { OverlayEventDetail } from '@ionic/core';
@Component({
  selector: 'app-detalle-videos',
  templateUrl: './detalle-videos.component.html',
  styleUrls: ['./detalle-videos.component.scss'],
  imports: [
    IonModal,
    sharedImports,
    IonButton,
    IonTitle,
    IonButtons,
    IonToolbar,
    IonContent,
    IonHeader,
    CommonModule,
    MatCard,
    RegistrarVideoComponent,
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
    this.videoService.obtenerVideos(this.clienteSeleccionado?.customer_id!).subscribe(videos => {
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

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      this.obtenerVideos();
    }
  }
}
