import { Injectable } from '@angular/core';
import { Ruta } from '../interfaces/ruta.interface';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { LocalDatePipe } from 'src/app/shared/pipes/local-date.pipe';
import { LocalizationService } from 'src/app/shared/services/localization.service';

@Injectable({
  providedIn: 'root',
})
export class RutasService {
  private apiUrl = environment.apiUrl;
  private localDatePipe: LocalDatePipe;

  constructor(
    private http: HttpClient,
    private localizationService: LocalizationService,
  ) {
    this.localDatePipe = new LocalDatePipe(this.localizationService);
  }

  obtenerRuta(seller_id: string): Observable<Ruta[]> {
    return this.http.get<Ruta[]>(`${this.apiUrl}/logistic/seller/route/${seller_id}`).pipe(
      map<any, any>((res: any) => {
        res.route.forEach((route: any) => {
          route.date = this.localDatePipe.transform(route.date, undefined, true);
        });
        return res;
      }),
      map((rutas: any) => {
        return rutas.route;
      }),
      catchError(error => {
        console.error(
          'ERROR_RUTAS: Error detallado:',
          JSON.stringify({
            error: error,
            status: error.status,
            message: error.message,
            details: error.error,
          }),
        );

        console.error('ERROR_RUTAS:', JSON.stringify(error));
        return throwError(() => error);
      }),
    );
  }
}
