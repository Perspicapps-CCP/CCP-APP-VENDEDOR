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
    return this.http.get<Video[]>(`${this.apiUrl}/inventory/stock/catalog/`).pipe(
      map((response: any) => {
        let videos: Video[] = response;
        videos = [
          {
            id: '1',
            status: 'Terminado de procesar',
            title: 'Tutorial de producto 1',
            description:
              'Video tutorial sobre características del producto 1 asdasdl asdkljndasnlkasd asdkljasdlkjasdjklasd asdjklasdjklasdjkl asdjklasdkjasd jlñasdjklasdjklasd jklasdjklasdjklasd',
            url: 'https://storage.googleapis.com/ccp-files-storage/client_attachments/aefc55cb-8aba-483a-be6f-b87e73516687/Reuni%C3%B3n%20en%20_General_-20250504_112010-Meeting%20Recording.mp4',
            recomendations: 'Recomendaciones del producto 1',
          },
          {
            id: '2',
            status: 'Terminado de procesar',
            title: 'Demostración de producto 2',
            description: 'Video demostrativo de funcionalidades del producto 2',
            url: 'https://storage.googleapis.com/ccp-files-storage/client_attachments/aefc55cb-8aba-483a-be6f-b87e73516687/Reuni%C3%B3n%20en%20_General_-20250504_112010-Meeting%20Recording.mp4',
            recomendations: 'Recomendaciones del producto 2',
          },
        ];
        return videos;
      }),
    );
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
