import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Cliente, ClienteResponse } from '../interfaces/cliente.interface';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private apiUrl = environment.apiUrlCCP;

  private _clienteSeleccionado: Cliente | null = null;

  constructor(private http: HttpClient) {}

  obtenerClientes(): Observable<Cliente[]> {
    return this.http.get<ClienteResponse[]>(`${this.apiUrl}/api/v1/sales/sellers/clients/`).pipe(
      map((clientesResponse: any) => {
        const clientInfo = clientesResponse.map((clienteResp: ClienteResponse) => {
          return {
            customer_id: clienteResp.id,
            customer_name: clienteResp.client.full_name,
            identification: clienteResp.client.identification,
            addressString: clienteResp.client.address.line,
            phone: clienteResp.client.phone,
            customer_image: clienteResp.client_thumbnail,
            isRecentVisit: clienteResp.was_visited_recently,
            address: clienteResp.client.address,
            client: clienteResp.client,
          };
        });
        return clientInfo;
      }),
    );
  }

  set clienteSeleccionado(cliente: Cliente) {
    this._clienteSeleccionado = cliente;
  }

  get clienteSeleccionado(): Cliente | null {
    return this._clienteSeleccionado;
  }
}
