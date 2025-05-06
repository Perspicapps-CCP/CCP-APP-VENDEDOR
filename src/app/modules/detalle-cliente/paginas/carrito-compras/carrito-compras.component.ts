import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { Cliente } from 'src/app/modules/clientes/interfaces/cliente.interface';
import { ClientesService } from 'src/app/modules/clientes/servicios/clientes.service';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import { LocalCurrencyPipe } from 'src/app/shared/pipes/local-currency.pipe';
import { Producto } from '../../interfaces/productos.interface';
import { CarritoComprasService } from '../../servicios/carrito-compras.service';
import { OnlyNumbersDirective } from 'src/app/shared/directivas/only-numbers.directive';

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
export class CarritoComprasComponent implements ViewWillEnter, OnDestroy {
  clienteSeleccionado?: Cliente;
  productosCarritoCompras: Producto[] = [];
  private subscription?: Subscription;

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
      this.subscribeToInventoryChanges();
    } else {
      this.router.navigate(['/home']);
    }
  }

  subscribeToInventoryChanges() {
    this.subscription = this.carritoComprasService.productAvailabilityChanged$.subscribe(
      productId => {
        if (productId !== null) {
          this.obtenerProductosCarritoCompras();
        }
      },
    );
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

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
