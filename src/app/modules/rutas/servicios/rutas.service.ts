import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { LocalDatePipe } from 'src/app/shared/pipes/local-date.pipe';
import { LocalizationService } from 'src/app/shared/services/localization.service';
import { environment } from 'src/environments/environment';
import { Ruta, RutaResponse } from '../interfaces/ruta.interface';

@Injectable({
  providedIn: 'root',
})
export class RutasService {
  private apiUrl = environment.apiUrlCCP;
  private localDatePipe: LocalDatePipe;

  constructor(
    private http: HttpClient,
    private localizationService: LocalizationService,
  ) {
    this.localDatePipe = new LocalDatePipe(this.localizationService);
  }

  obtenerRuta(): Observable<Ruta[]> {
    const date = this.localDatePipe.transform(new Date(), 'yyyy-MM-dd', true) || '';
    return this.http.get<RutaResponse>(`${this.apiUrl}/api/v1/sales/routes/${date}`).pipe(
      map<RutaResponse, Ruta[]>((res: RutaResponse) => {
        const rutas: Ruta[] = [];

        res.stops.forEach(stop => {
          const ruta: Ruta = {
            id: stop.id,
            customer_address: stop.address.line,
            customer_name: stop.client.full_name,
            customer_phone_number: stop.client.phone,
            latitude: stop.address.latitude.toString(),
            longitude: stop.address.longitude.toString(),
            date: this.localDatePipe.transform(res.date, undefined, true) || '',
          };
          rutas.push(ruta);
        });
        return rutas;
      }),
    );
  }
}
