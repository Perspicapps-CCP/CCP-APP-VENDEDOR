import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cliente } from 'src/app/modules/clientes/interfaces/cliente.interface';
import { ClientesService } from 'src/app/modules/clientes/servicios/clientes.service';

@Component({
  selector: 'app-catalogo-productos',
  templateUrl: './catalogo-productos.component.html',
  styleUrls: ['./catalogo-productos.component.scss'],
})
export class CatalogoProductosComponent implements OnInit {
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
    } else {
      this.router.navigate(['/home']);
    }
  }
}
