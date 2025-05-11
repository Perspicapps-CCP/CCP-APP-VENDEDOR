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
  IonModal,
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
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CrearPedido } from '../../interfaces/crearPedido.interface';
import { CrearPedidoService } from '../../servicios/crear-pedido.service';

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
    IonModal,
  ],
})
export class CarritoComprasComponent implements ViewWillEnter, OnDestroy {
  clienteSeleccionado?: Cliente;
  productosCarritoCompras: Producto[] = [];
  private subscription?: Subscription;
  currentProductDelete?: Producto;

  constructor(
    private clientesService: ClientesService,
    private router: Router,
    private carritoComprasService: CarritoComprasService,
    private translate: TranslateService,
    private _snackBar: MatSnackBar,
    private crearPedidoService: CrearPedidoService,
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

  eliminarProducto() {
    this.carritoComprasService.removeFromCurrentCart(this.currentProductDelete!.product_id!);
    this.translate.get('CARRITO_COMPRAS.PRODUCT_DELETED').subscribe((mensaje: string) => {
      this._snackBar.open(mensaje, '', {
        duration: 3000,
      });
    });
    this.obtenerProductosCarritoCompras();
    this.currentProductDelete = undefined;
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

  realizarPedido() {
    const pedido: CrearPedido = {
      client_id: this.clienteSeleccionado!.customer_id,
      items: this.productosCarritoCompras.map(producto => ({
        product_id: producto.product_id!,
        quantity: producto.quantity_selected,
      })),
    };

    this.crearPedidoService.crearPedido(pedido).subscribe({
      next: () => {
        this.translate
          .get('CARRITO_COMPRAS.CONFIRM_PEDIDO_SUCCESS')
          .subscribe((mensaje: string) => {
            this._snackBar.open(mensaje, '', {
              duration: 3000,
            });
          });
        this.carritoComprasService.clearCurrentCart();
        window.history.back();
      },
      error: () => {
        this.translate.get('CARRITO_COMPRAS.CONFIRM_PEDIDO_ERROR').subscribe((mensaje: string) => {
          this._snackBar.open(mensaje, '', {
            duration: 3000,
          });
        });
      },
    });
  }

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
