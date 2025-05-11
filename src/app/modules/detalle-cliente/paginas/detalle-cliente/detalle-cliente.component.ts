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
import { Observable } from 'rxjs';
import { Cliente } from 'src/app/modules/clientes/interfaces/cliente.interface';
import { ClientesService } from 'src/app/modules/clientes/servicios/clientes.service';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import { LocalDatePipe } from 'src/app/shared/pipes/local-date.pipe';
import { Sales } from '../../interfaces/ventas.interface';
import { CarritoComprasService } from '../../servicios/carrito-compras.service';
import { DetalleClienteService } from '../../servicios/detalle-cliente.service';
import { InventorySocketServiceService } from '../../servicios/inventory-socket-service.service';

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
    LocalDatePipe,
  ],
})
export class DetalleClienteComponent implements OnInit {
  clienteSeleccionado?: Cliente;
  carritoCount?: Observable<string>;
  pedidosCliente?: Sales[];

  constructor(
    private clientesService: ClientesService,
    private router: Router,
    private carritoComprasService: CarritoComprasService,
    private detalleClienteService: DetalleClienteService,
    private _: InventorySocketServiceService,
  ) {}

  ngOnInit() {
    this.obtenerInfoCliente();
  }

  obtenerInfoCliente() {
    if (this.clientesService.clienteSeleccionado) {
      this.clienteSeleccionado = this.clientesService.clienteSeleccionado;
      this.obtenerPedidosCliente();
      this.carritoComprasService.setCurrentClient(this.clienteSeleccionado.customer_id);
      this.carritoCount = this.carritoComprasService.getCartItemCount();
    } else {
      this.router.navigate(['/home']);
    }
  }

  back() {
    window.history.back();
  }

  catalogoArticulos() {
    this.router.navigate([
      `/detalle-cliente/${this.clienteSeleccionado!.customer_id}/catalogoProductos`,
    ]);
  }

  irCarritoCompras() {
    this.router.navigate([
      `/detalle-cliente/${this.clienteSeleccionado!.customer_id}/carritoCompras`,
    ]);
  }

  obtenerPedidosCliente() {
    this.detalleClienteService
      .obtenerVentasPorCliente(this.clienteSeleccionado!.client!.id)
      .subscribe(response => {
        this.pedidosCliente = response;
      });
  }

  navegarADetallePedido(idPedido: string) {
    this.router.navigate([
      `/detalle-cliente/${this.clienteSeleccionado!.customer_id}/pedido/${idPedido}`,
    ]);
  }

  navegarAVideoDetalle() {
    this.router.navigate([`/detalle-cliente/${this.clienteSeleccionado!.customer_id}/videos`]);
  }
}
