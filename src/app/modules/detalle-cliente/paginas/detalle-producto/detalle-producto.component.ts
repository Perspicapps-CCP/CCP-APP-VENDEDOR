import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
  ],
})
export class DetalleProductoComponent implements ViewWillEnter {
  productoSeleccionado?: Producto;
  clienteSeleccionado?: Cliente;

  constructor(
    private router: Router,
    private clientesService: ClientesService,
    private catalogoService: CatalogoService,
  ) {}

  ionViewWillEnter() {
    this.obtenerInfoCliente();
    this.obtenerProducto();
  }

  obtenerInfoCliente() {
    if (this.clientesService.clienteSeleccionado) {
      this.clienteSeleccionado = this.clientesService.clienteSeleccionado;
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

  irCarritoCompras() {}

  back() {
    window.history.back();
  }
}
