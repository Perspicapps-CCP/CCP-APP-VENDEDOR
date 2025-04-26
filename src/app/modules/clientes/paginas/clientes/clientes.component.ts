import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
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
import { Cliente } from '../../interfaces/cliente.interface';
import { DinamicSearchService } from 'src/app/shared/services/dinamic-search.service';
import { ClientesService } from '../../servicios/clientes.service';
import { LoginService } from '../../../auth/servicios/login.service';

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
export class ClientesComponent implements OnInit {
  formBusquedaClientes = new FormControl('');
  clientes: Cliente[] = [];
  filterClientes$?: Observable<Cliente[]>;

  constructor(
    private clientesService: ClientesService,
    private dinamicSearchService: DinamicSearchService,
    private loginService: LoginService,
  ) {}

  ngOnInit() {
    this.obtenerClientes();
  }

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
}
