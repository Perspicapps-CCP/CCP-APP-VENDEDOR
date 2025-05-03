import { Routes } from '@angular/router';

export const DETALLE_CLIENTE_ROUTES: Routes = [
  {
    path: ':idCliente',
    loadComponent: () =>
      import('./paginas/detalle-cliente/detalle-cliente.component').then(
        c => c.DetalleClienteComponent,
      ),
  },
  // {
  //   path: ':idCliente/pedido/:idPedido',
  //   loadComponent: () =>
  //     import('./paginas/pedido/detalle-pedido.component').then(c => c.DetallePedidoComponent),
  // },
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
  // {
  //   path: ':idCliente/videos',
  //   loadComponent: () => import('./paginas/videos/videos.component').then(c => c.VideosComponent),
  // },
  // {
  //   path: ':idCliente/videos/:idVideo',
  //   loadComponent: () =>
  //     import('./paginas/videos/detalle-video.component').then(c => c.DetalleVideoComponent),
  // },
  {
    path: ':idCliente/carritoCompras',
    loadComponent: () =>
      import('./paginas/carrito-compras/carrito-compras.component').then(
        c => c.CarritoComprasComponent,
      ),
  },
];
