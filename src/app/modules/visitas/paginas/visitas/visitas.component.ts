import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonModal,
} from '@ionic/angular/standalone';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import { OverlayEventDetail } from '@ionic/core/components';
import { CrearVisitaComponent } from '../../componentes/crear-visita/crear-visita.component';

@Component({
  selector: 'app-visitas',
  templateUrl: './visitas.component.html',
  styleUrls: ['./visitas.component.scss'],
  standalone: true,
  imports: [
    IonModal,
    IonButton,
    IonButtons,
    sharedImports,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CrearVisitaComponent,
  ],
})
export class VisitasComponent {
  constructor() {}

  obtenerVisitas() {}

  onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role === 'confirm') {
      this.obtenerVisitas();
    }
  }
}
