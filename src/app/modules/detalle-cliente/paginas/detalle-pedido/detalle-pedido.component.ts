import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  selector: 'app-detalle-pedido',
  templateUrl: './detalle-pedido.component.html',
  styleUrls: ['./detalle-pedido.component.scss'],
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
export class DetallePedidoComponent {
  constructor() {}

  back() {
    window.history.back();
  }
}
