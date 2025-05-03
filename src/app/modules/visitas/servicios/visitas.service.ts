import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Cliente } from '../../clientes/interfaces/cliente.interface';

@Injectable({
  providedIn: 'root',
})
export class VisitasService {
  private apiUrl = environment.apiUrlCCP;

  constructor(private http: HttpClient) {}

  registrarVisita(imagenes: File[], descripcion: string, cliente: Cliente) {
    const formData = new FormData();
    Array.from(imagenes).forEach(file => {
      formData.append('attachments', file, file.name);
    });
    formData.append('description', descripcion);

    return this.http.post(
      `${this.apiUrl}/api/v1/sales/sellers/clients/${cliente.customer_id}/visit`,
      formData,
    );
  }
}
