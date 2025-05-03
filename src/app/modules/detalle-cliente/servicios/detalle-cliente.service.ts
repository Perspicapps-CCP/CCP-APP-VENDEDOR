import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Sales } from '../interfaces/ventas.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DetalleClienteService {
  private apiUrl = environment.apiUrlCCP;
  constructor(private http: HttpClient) {}

  obtenerVentasPorCliente(clienteId: string): Observable<Sales[]> {
    return this.http.get<Sales[]>(`${this.apiUrl}/api/v1/sales/sales/`);
  }
}
