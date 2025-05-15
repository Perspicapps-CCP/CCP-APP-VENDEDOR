import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VideoServiceService {
  private apiUrl = environment.apiUrlCCP;

  constructor(private http: HttpClient) {}

  crearVideo(
    video: Blob,
    fileName: string,
    descripcion: string = 'Descripción de prueba',
    title: string = 'Video de prueba',
    idCliente: string = '9b3cf976-98bc-48c5-a296-ebdd321d827b',
  ) {
    console.log('VideoServiceService -> crearVideo');
    const formData = new FormData();
    formData.append('video', video, fileName);
    formData.append('description', descripcion);
    formData.append('title', title);
    console.log('VideoServiceService -> crearVideo -> formData', formData);
    return this.http.post(
      `${this.apiUrl}/api/v1/sales/sellers/clients/${idCliente}/videos`,
      formData,
    );
  }
}
