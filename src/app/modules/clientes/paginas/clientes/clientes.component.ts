import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { ViewWillEnter } from '@ionic/angular';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { map, Observable, startWith } from 'rxjs';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import { HighlightTextPipe } from 'src/app/shared/pipes/highlight-text.pipe';
import { DinamicSearchService } from 'src/app/shared/services/dinamic-search.service';
import { LoginService } from '../../../auth/servicios/login.service';
import { Cliente } from '../../interfaces/cliente.interface';
import { ClientesService } from '../../servicios/clientes.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
  standalone: true,
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
    HighlightTextPipe,
  ],
})
export class ClientesComponent implements ViewWillEnter {
  formBusquedaClientes = new FormControl('');
  clientes: Cliente[] = [];
  filterClientes$?: Observable<Cliente[]>;

  constructor(
    private clientesService: ClientesService,
    private dinamicSearchService: DinamicSearchService,
    private loginService: LoginService,
    private router: Router,
  ) {}

  obtenerClientes() {
    this.clientesService.obtenerClientes().subscribe(clientes => {
      this.clientes = clientes;
      this.filterClientes();
    });
  }

  filterClientes() {
    this.filterClientes$ = this.formBusquedaClientes.valueChanges.pipe(
      startWith(''),
      map(name => this.buscar(name || '')),
    );
  }

  buscar(name: string) {
    if (name) {
      return this.dinamicSearchService.dynamicSearch(this.clientes, name);
    }
    return this.clientes.slice();
  }

  cerrarSesion() {
    this.loginService.cerrarSesion();
  }

  ionViewWillEnter(): void {
    this.obtenerClientes();
  }

  navegarADetalleCliente(cliente: Cliente) {
    this.clientesService.clienteSeleccionado = cliente;
    this.router.navigate(['/detalle-cliente', cliente.customer_id]);
  }
}
