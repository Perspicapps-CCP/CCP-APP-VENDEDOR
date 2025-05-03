import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
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
import { CarritoComprasService } from '../../servicios/carrito-compras.service';
import { Producto } from '../../interfaces/productos.interface';
import { LocalCurrencyPipe } from 'src/app/shared/pipes/local-currency.pipe';

@Component({
  selector: 'app-carrito-compras',
  templateUrl: './carrito-compras.component.html',
  styleUrls: ['./carrito-compras.component.scss'],
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
    ReactiveFormsModule,
    LocalCurrencyPipe,
  ],
})
export class CarritoComprasComponent implements ViewWillEnter {
  clienteSeleccionado?: Cliente;
  productosCarritoCompras: Producto[] = [];

  constructor(
    private clientesService: ClientesService,
    private router: Router,
    private carritoComprasService: CarritoComprasService,
  ) {}

  ionViewWillEnter() {
    this.obtenerInfoCliente();
  }

  obtenerInfoCliente() {
    if (this.clientesService.clienteSeleccionado) {
      this.clienteSeleccionado = this.clientesService.clienteSeleccionado;
      this.obtenerProductosCarritoCompras();
    } else {
      this.router.navigate(['/home']);
    }
  }

  obtenerProductosCarritoCompras() {
    this.productosCarritoCompras = this.carritoComprasService.getCurrentCart();
  }

  back() {
    window.history.back();
  }

  eliminarProducto(producto: Producto) {
    this.carritoComprasService.removeFromCurrentCart(producto.product_id!);
    this.obtenerProductosCarritoCompras();
  }

  onChangeCantidad(producto: Producto) {
    this.carritoComprasService.updateProductQuantity(
      producto.product_id!,
      producto.quantity_selected!,
    );
    this.obtenerProductosCarritoCompras();
  }

  get totalCarritoCompras() {
    return this.productosCarritoCompras.reduce((total, producto) => {
      return total + producto.price! * producto.quantity_selected!;
    }, 0);
  }

  realizarPedido() {}

  get disabledPedido() {
    return this.productosCarritoCompras.some(producto => {
      return producto.quantity_selected === 0 || producto.quantity_selected > producto.quantity;
    });
  }
}
