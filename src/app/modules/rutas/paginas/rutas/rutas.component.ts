import { Component, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { map, Observable, startWith } from 'rxjs';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import { HighlightTextPipe } from 'src/app/shared/pipes/highlight-text.pipe';
import { DinamicSearchService } from 'src/app/shared/services/dinamic-search.service';
import { DetalleRutaComponent } from '../../componentes/detalle-ruta/detalle-ruta.component';
import { Ruta } from '../../interfaces/ruta.interface';
import { RutasService } from '../../servicios/rutas.service';

@Component({
  selector: 'app-rutas',
  templateUrl: './rutas.component.html',
  styleUrls: ['./rutas.component.scss'],
  imports: [
    ReactiveFormsModule,
    IonButton,
    sharedImports,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    MatCardModule,
    IonModal,
    DetalleRutaComponent,
    HighlightTextPipe,
  ],
})
export class RutasComponent implements ViewWillEnter {
  @ViewChild(IonModal) modal!: IonModal;

  formBusquedaRutas = new FormControl('');
  rutas: Ruta[] = [];
  filterRutas$?: Observable<Ruta[]>;

  constructor(
    private rutasService: RutasService,
    private dinamicSearchService: DinamicSearchService,
  ) {}

  obtenerRutas() {
    this.rutasService.obtenerRuta().subscribe(rutas => {
      this.rutas = rutas;
      this.filterRutas();
    });
  }

  filterRutas() {
    this.filterRutas$ = this.formBusquedaRutas.valueChanges.pipe(
      startWith(''),
      map(name => this.buscar(name || '')),
    );
  }

  buscar(name: string) {
    if (name) {
      return this.dinamicSearchService.dynamicSearch(this.rutas, name);
    }
    return this.rutas.slice();
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  onWillDismiss(event: any) {}

  ionViewWillEnter(): void {
    this.obtenerRutas();
  }
}
