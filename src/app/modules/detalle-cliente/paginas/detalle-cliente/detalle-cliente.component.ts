import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Cliente } from 'src/app/modules/clientes/interfaces/cliente.interface';
import { ClientesService } from 'src/app/modules/clientes/servicios/clientes.service';
import { sharedImports } from 'src/app/shared/otros/shared-imports';

@Component({
  selector: 'app-detalle-cliente',
  templateUrl: './detalle-cliente.component.html',
  styleUrls: ['./detalle-cliente.component.scss'],
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
export class DetalleClienteComponent implements OnInit {
  clienteSeleccionado?: Cliente;

  constructor(
    private clientesService: ClientesService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.obtenerInfoCliente();
  }

  obtenerInfoCliente() {
    if (this.clientesService.ClienteSeleccionado) {
      this.clienteSeleccionado = this.clientesService.ClienteSeleccionado;
      console.log('Cliente seleccionado', this.clienteSeleccionado);
    } else {
      this.router.navigate(['/home']);
    }
  }

  back() {
    window.history.back();
  }

  catalogoArticulos() {
    console.log('Catalogo articulos', this.clienteSeleccionado!.customer_name);
    this.router.navigate([
      `/detalle-cliente/${this.clienteSeleccionado!.customer_id}/catalogoProductos`,
    ]);
  }
  carritoCompras() {}

  navegarAVideoDetalle() {}
}
