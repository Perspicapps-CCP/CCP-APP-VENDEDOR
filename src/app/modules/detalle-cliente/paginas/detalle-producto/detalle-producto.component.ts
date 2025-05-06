import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonToolbar,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { ClientesService } from 'src/app/modules/clientes/servicios/clientes.service';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import { CatalogoService } from '../../servicios/catalogo.service';
import { Producto } from '../../interfaces/productos.interface';
import { Cliente } from 'src/app/modules/clientes/interfaces/cliente.interface';
import { Router } from '@angular/router';
import { VisorImagenesDialogComponent } from 'src/app/shared/componentes/visor-imagenes-dialog/visor-imagenes-dialog.component';
import { map, Observable, Subscription } from 'rxjs';
import { CarritoComprasService } from '../../servicios/carrito-compras.service';
import { OnlyNumbersDirective } from 'src/app/shared/directivas/only-numbers.directive';
import { InventorySocketServiceService } from '../../servicios/inventory-socket-service.service';

@Component({
  selector: 'app-detalle-producto',
  templateUrl: './detalle-producto.component.html',
  styleUrls: ['./detalle-producto.component.scss'],
  imports: [
    sharedImports,
    IonButton,
    IonButtons,
    IonToolbar,
    IonContent,
    IonHeader,
    CommonModule,
    ReactiveFormsModule,
    VisorImagenesDialogComponent,
    OnlyNumbersDirective,
  ],
})
export class DetalleProductoComponent implements ViewWillEnter, OnDestroy {
  productoSeleccionado?: Producto;
  clienteSeleccionado?: Cliente;
  carritoCount?: Observable<string>;
  private subscriptionChangeInventory?: Subscription;

  constructor(
    private router: Router,
    private clientesService: ClientesService,
    private catalogoService: CatalogoService,
    private carritoComprasService: CarritoComprasService,
    private inventorySocketServiceService: InventorySocketServiceService,
  ) {}

  ionViewWillEnter() {
    this.obtenerInfoCliente();
    this.obtenerProducto();
  }

  obtenerInfoCliente() {
    if (this.clientesService.clienteSeleccionado) {
      this.clienteSeleccionado = this.clientesService.clienteSeleccionado;
      this.carritoCount = this.carritoComprasService.getCartItemCount();
    } else {
      this.router.navigate(['/home']);
    }
  }

  obtenerProducto() {
    if (this.catalogoService.productoSeleccionado) {
      this.productoSeleccionado = this.catalogoService.productoSeleccionado;
    } else {
      this.router.navigate(['/home']);
    }
  }

  irCarritoCompras() {
    this.router.navigate([
      `/detalle-cliente/${this.clienteSeleccionado!.customer_id}/carritoCompras`,
    ]);
  }

  back() {
    window.history.back();
  }

  connectionChangeInventory() {
    this.subscriptionChangeInventory =
      this.inventorySocketServiceService.inventoryChange$.subscribe(event => {
        if (event) {
          const { product_id, quantity } = event;
          if (this.productoSeleccionado?.product_id === product_id) {
            this.productoSeleccionado.quantity = quantity;
          }
        }
      });
  }

  agregarAlCarrito() {
    if (this.productoSeleccionado) {
      this.carritoComprasService.addToCurrentCart(this.productoSeleccionado);
      this.productoSeleccionado.quantity_selected = 0;
    }
  }

  onChangeCantidad(producto: Producto) {
    this.carritoComprasService.updateProductQuantity(
      producto.product_id!,
      producto.quantity_selected!,
    );
  }

  ngOnDestroy() {
    if (this.subscriptionChangeInventory) {
      this.subscriptionChangeInventory.unsubscribe();
    }
  }
}
