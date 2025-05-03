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
  constructor() {}

  back() {
    window.history.back();
  }

  agregarVideo() {}
}
