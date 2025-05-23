import { Routes } from '@angular/router';

export const DETALLE_CLIENTE_ROUTES: Routes = [
  {
    path: ':idCliente',
    loadComponent: () =>
      import('./paginas/detalle-cliente/detalle-cliente.component').then(
        c => c.DetalleClienteComponent,
      ),
  },
  {
    path: ':idCliente/pedido/:idPedido',
    loadComponent: () =>
      import('./paginas/detalle-pedido/detalle-pedido.component').then(
        c => c.DetallePedidoComponent,
      ),
  },
  {
    path: ':idCliente/catalogoProductos',
    loadComponent: () =>
      import('./paginas/catalogo-productos/catalogo-productos.component').then(
        c => c.CatalogoProductosComponent,
      ),
  },
  {
    path: ':idCliente/catalogoProductos/:idProducto',
    loadComponent: () =>
      import('./paginas/detalle-producto/detalle-producto.component').then(
        c => c.DetalleProductoComponent,
      ),
  },
  {
    path: ':idCliente/videos',
    loadComponent: () =>
      import('./paginas/detalle-videos/detalle-videos.component').then(
        c => c.DetalleVideosComponent,
      ),
  },
  {
    path: ':idCliente/videos/:idVideo',
    loadComponent: () =>
      import('./paginas/detalle-video/detalle-video.component').then(c => c.DetalleVideoComponent),
  },
  {
    path: ':idCliente/carritoCompras',
    loadComponent: () =>
      import('./paginas/carrito-compras/carrito-compras.component').then(
        c => c.CarritoComprasComponent,
      ),
  },
];
