import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  ViewWillEnter,
  ViewWillLeave,
} from '@ionic/angular/standalone';
import { map, Observable, startWith, Subscription, tap } from 'rxjs';
import { Cliente } from 'src/app/modules/clientes/interfaces/cliente.interface';
import { ClientesService } from 'src/app/modules/clientes/servicios/clientes.service';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import { HighlightTextPipe } from 'src/app/shared/pipes/highlight-text.pipe';
import { DinamicSearchService } from 'src/app/shared/services/dinamic-search.service';
import { Producto } from '../../interfaces/productos.interface';
import { CatalogoService } from '../../servicios/catalogo.service';
import { CarritoComprasService } from '../../servicios/carrito-compras.service';
import { OnlyNumbersDirective } from 'src/app/shared/directivas/only-numbers.directive';
import { InventorySocketServiceService } from '../../servicios/inventory-socket-service.service';

@Component({
  selector: 'app-catalogo-productos',
  templateUrl: './catalogo-productos.component.html',
  styleUrls: ['./catalogo-productos.component.scss'],
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
    HighlightTextPipe,
  ],
})
export class CatalogoProductosComponent implements ViewWillEnter, ViewWillLeave {
  clienteSeleccionado?: Cliente;

  // Variables para el catálogo de productos
  productos: Producto[] = [];
  formBusquedaProductos = new FormControl('');
  filterProductos$?: Observable<Producto[]>;

  carritoCount?: Observable<string>;
  private subscriptionChangeInventory?: Subscription;

  constructor(
    private catalogoService: CatalogoService,
    private clientesService: ClientesService,
    private router: Router,
    private dinamicSearchService: DinamicSearchService,
    private carritoComprasService: CarritoComprasService,
    private inventorySocketServiceService: InventorySocketServiceService,
  ) {}

  ionViewWillEnter() {
    this.obtenerInfoCliente();
    this.obtenerProductos();
    this.connectionChangeInventory();
  }

  connectionChangeInventory() {
    this.subscriptionChangeInventory =
      this.inventorySocketServiceService.inventoryChange$.subscribe(event => {
        if (event) {
          const { product_id, quantity } = event;
          const indexProduct = this.productos.findIndex(
            producto => producto.product_id === product_id,
          );
          if (indexProduct !== -1) {
            this.productos[indexProduct].quantity = quantity;
          }
        }
      });
  }

  obtenerProductos() {
    this.catalogoService.obtenerProductos().subscribe(res => {
      this.productos = res;
      this.filterProductos();
    });
  }

  filterProductos() {
    this.filterProductos$ = this.formBusquedaProductos.valueChanges.pipe(
      startWith(''),
      map(name => this.buscar(name || '')),
    );
  }

  buscar(name: string) {
    if (name) {
      return this.dinamicSearchService.dynamicSearch(this.productos, name);
    }
    return this.productos.slice();
  }

  obtenerInfoCliente() {
    if (this.clientesService.clienteSeleccionado) {
      this.clienteSeleccionado = this.clientesService.clienteSeleccionado;
      this.carritoCount = this.carritoComprasService.getCartItemCount();
    } else {
      this.router.navigate(['/home']);
    }
  }

  irCarritoCompras() {
    this.router.navigate([
      `/detalle-cliente/${this.clienteSeleccionado!.customer_id}/carritoCompras`,
    ]);
  }
  irDetalleProducto(producto: Producto) {
    this.catalogoService.productoSeleccionado = producto;

    this.router.navigate([
      '/detalle-cliente',
      this.clienteSeleccionado?.customer_id,
      'catalogoProductos',
      producto.product_id,
    ]);
  }

  back() {
    window.history.back();
  }

  agregarAlCarrito(producto: Producto) {
    this.carritoComprasService.addToCurrentCart(producto);
    producto.quantity_selected = 0;
  }

  ionViewWillLeave() {
    if (this.subscriptionChangeInventory) {
      this.subscriptionChangeInventory.unsubscribe();
    }
  }
}
