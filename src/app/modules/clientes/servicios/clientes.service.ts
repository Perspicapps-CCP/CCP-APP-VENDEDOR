import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Cliente } from '../interfaces/cliente.interface';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtenerClientes(seller_id: string) {
    return this.http.get<Cliente[]>(`${this.apiUrl}/api/v1/users/sellers/seller_id/customers`).pipe(
      map((clientes: any) => {
        console.log('clientes', clientes);
        return clientes.customer;
      }),
    );
  }
}
