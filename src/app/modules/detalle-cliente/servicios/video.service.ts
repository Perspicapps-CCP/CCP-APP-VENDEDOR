import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Video } from '../interfaces/videos.interface';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private apiUrl = environment.apiUrlCCP;

  private _videoSeleccionado: Video | null = null;

  constructor(private http: HttpClient) {}

  obtenerVideos() {
    return this.http.get<Video[]>(`${this.apiUrl}/inventory/stock/catalog/`);
  }

  crearVideo(video: File[], descripcion: string, title: string, idCliente: string) {
    const formData = new FormData();
    Array.from(video).forEach(file => {
      formData.append('video', file, file.name);
    });
    formData.append('description', descripcion);
    formData.append('title', title);

    return this.http.post(
      `${this.apiUrl}/api/v1/sales/sellers/clients/${idCliente}/videos`,
      formData,
    );
  }

  set videoSeleccionado(video: Video) {
    this._videoSeleccionado = video;
  }

  get videoSeleccionado(): Video | null {
    return this._videoSeleccionado;
  }
}
