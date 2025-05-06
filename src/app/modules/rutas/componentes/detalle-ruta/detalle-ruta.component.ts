import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { sharedImports } from 'src/app/shared/otros/shared-imports';
import { Ruta } from '../../interfaces/ruta.interface';
import { GoogleMapsModule } from '@angular/google-maps';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-detalle-ruta',
  templateUrl: './detalle-ruta.component.html',
  styleUrls: ['./detalle-ruta.component.scss'],
  standalone: true,
  imports: [
    sharedImports,
    IonButton,
    IonTitle,
    IonButtons,
    IonToolbar,
    IonContent,
    IonHeader,
    GoogleMapsModule,
    CommonModule,
  ],
})
export class DetalleRutaComponent implements OnInit {
  @Input({
    required: true,
  })
  rutas!: Ruta[];

  @Output() closeModal = new EventEmitter<boolean>();

  apiLoaded = false;
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  zoom = 2;
  markers: any[] = [];
  infoWindows: google.maps.InfoWindow[] = [];
  map!: google.maps.Map;
  directionsResults: google.maps.DirectionsResult | null = null;
  // Almacenar las coordenadas actualizadas según la ruta calculada
  routeCoordinates: Ruta[] = [];

  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    disableDefaultUI: false,
    zoomControl: true,
    scrollwheel: true,
    fullscreenControl: true,
  };

  directionsOptions: google.maps.DirectionsRendererOptions = {
    suppressMarkers: true, // Suprimimos los marcadores predeterminados para usar los nuestros
    polylineOptions: {
      strokeColor: '#0f53ff',
      strokeOpacity: 0.5,
      strokeWeight: 7,
    },
  };

  // Almacenar la biblioteca de marcadores
  markerLibrary: any = null;

  constructor() {}

  ngOnInit() {
    this.loadGoogleMapsApi().then(() => {
      this.apiLoaded = true;
      this.setupMap();
    });
  }

  loadGoogleMapsApi(): Promise<void> {
    return new Promise(resolve => {
      if (typeof google === 'object' && typeof google.maps === 'object') {
        // Si ya está cargado, inmediatamente resolvemos
        google.maps.importLibrary('marker').then(lib => {
          this.markerLibrary = lib;
          resolve();
        });
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Cuando se carga el script, importamos la biblioteca de marcadores
        google.maps.importLibrary('marker').then(lib => {
          this.markerLibrary = lib;
          resolve();
        });
      };
      document.head.appendChild(script);
    });
  }

  close() {
    this.closeModal.emit(true);
  }

  onMapInitialized(map: google.maps.Map) {
    this.map = map;
    // No creamos los marcadores aquí, esperamos a que la ruta se calcule

    // Asegurarse de que tenemos la biblioteca de marcadores cargada
    if (!this.markerLibrary) {
      google.maps.importLibrary('marker').then(lib => {
        this.markerLibrary = lib;
      });
    }
  }

  createCustomMarkers() {
    if (!this.map) return;

    // Asegurarse de que tenemos la biblioteca de marcadores
    if (!this.markerLibrary) {
      // Si aún no está cargada, lo intentamos más tarde
      google.maps.importLibrary('marker').then(lib => {
        this.markerLibrary = lib;
        this.createCustomMarkers(); // Volver a intentar
      });
      return;
    }

    // Limpiar marcadores anteriores
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
    this.infoWindows = [];

    // Usamos las coordenadas ajustadas a la ruta en lugar de las originales
    const rutasToUse = this.routeCoordinates.length > 0 ? this.routeCoordinates : this.rutas;

    // Definir las rutas a los SVG en los assets (una para cada color)
    const baseSvgPath = 'assets/markers/marcador-client.svg';

    // Crear nuevos marcadores
    rutasToUse.forEach((ruta, index) => {
      // Convertir las coordenadas de string a number
      const latitude = parseFloat(ruta.latitude);
      const longitude = parseFloat(ruta.longitude);

      if (isNaN(latitude) || isNaN(longitude)) {
        console.error(`Coordenadas inválidas para la ruta en el índice ${index}`, ruta);
        return;
      }

      // Obtener la ruta del SVG apropiada según la posición
      const svgPath = baseSvgPath;

      // Crear marcador usando el nuevo método recomendado
      const marker = new this.markerLibrary.Marker({
        position: { lat: latitude, lng: longitude },
        map: this.map,
        title: ruta.customer_name || `Parada ${index + 1}`,
        icon: {
          url: svgPath,
          scaledSize: new google.maps.Size(32, 38), // Ajusta el tamaño según sea necesario
          anchor: new google.maps.Point(16, 19), // El punto de anclaje (la punta inferior del pin)
        },
      });

      // Crear contenido HTML personalizado para el InfoWindow
      const contentString = `
        <div class="custom-info-window">
          <h3>${ruta.customer_name || `Parada ${index + 1}`}</h3>
          <p>Dirección: ${ruta.customer_address || 'Sin dirección'}</p>
          <p>Teléfono: ${ruta.customer_phone_number || 'Sin teléfono'}</p>
          <p>${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
          <div class="info-actions">
            <button class="info-btn">Cerrar</button>
          </div>
        </div>
      `;

      // Crear InfoWindow personalizado
      const infoWindow = new google.maps.InfoWindow({
        content: contentString,
        maxWidth: 300,
        ariaLabel: ruta.customer_name,
        headerDisabled: true, // Este atributo no es soportado en versiones antiguas de Google Maps
      });

      // Evento para abrir InfoWindow al hacer clic en el marcador
      marker.addListener('click', () => {
        // Cerrar todos los InfoWindows abiertos
        this.infoWindows.forEach(window => window.close());
        // Abrir el InfoWindow actual
        infoWindow.open({
          anchor: marker,
          map: this.map,
        });
      });

      // Evento para los botones dentro del InfoWindow
      google.maps.event.addListener(infoWindow, 'domready', () => {
        // Botón cerrar
        const closeButton = document.querySelector('.info-btn:not(.info-btn-primary)');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            infoWindow.close();
          });
        }
      });

      // Guardar referencias
      this.markers.push(marker);
      this.infoWindows.push(infoWindow);
    });
  }

  setupMap() {
    if (!this.rutas || this.rutas.length === 0) {
      console.warn('No hay rutas para mostrar');
      return;
    }

    try {
      // Validar coordenadas
      const validRutas = this.rutas.filter(ruta => {
        const latitude = parseFloat(ruta.latitude);
        const longitude = parseFloat(ruta.longitude);

        if (isNaN(latitude) || isNaN(longitude)) {
          console.error(`Coordenada inválida`, ruta);
          return false;
        }
        return true;
      });

      if (validRutas.length === 0) {
        console.error('No hay rutas con coordenadas válidas');
        return;
      }

      // Calcular el centro del mapa (promedio de coordenadas)
      const sumLat = validRutas.reduce((sum, ruta) => sum + parseFloat(ruta.latitude), 0);
      const sumLng = validRutas.reduce((sum, ruta) => sum + parseFloat(ruta.longitude), 0);
      this.center = {
        lat: sumLat / validRutas.length,
        lng: sumLng / validRutas.length,
      };

      // Calcular la ruta real utilizando el servicio de direcciones
      this.calculateRoute();

      // Ajustar el zoom automáticamente para ver todas las coordenadas
      this.fitBounds();
    } catch (error) {
      console.error('Error al configurar el mapa:', error);
    }
  }

  calculateRoute() {
    if (this.rutas.length < 2) {
      console.warn('Se necesitan al menos 2 puntos para calcular una ruta');
      // Si solo hay un punto, crear un marcador simple
      if (this.rutas.length === 1) {
        this.createCustomMarkers();
      }
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    // Preparar el origen, destino y waypoints (puntos intermedios)
    const origin = {
      lat: parseFloat(this.rutas[0].latitude),
      lng: parseFloat(this.rutas[0].longitude),
    };

    const destination = {
      lat: parseFloat(this.rutas[this.rutas.length - 1].latitude),
      lng: parseFloat(this.rutas[this.rutas.length - 1].longitude),
    };

    // Los waypoints son todos los puntos intermedios (entre el origen y el destino)
    const waypoints = this.rutas.slice(1, this.rutas.length - 1).map(ruta => ({
      location: new google.maps.LatLng(parseFloat(ruta.latitude), parseFloat(ruta.longitude)),
      stopover: true,
    }));

    // Configurar la solicitud de ruta
    const request: google.maps.DirectionsRequest = {
      origin: origin,
      destination: destination,
      waypoints: waypoints,
      optimizeWaypoints: false, // mantener el orden exacto de los puntos
      travelMode: google.maps.TravelMode.DRIVING, // podría ser WALKING, BICYCLING, TRANSIT
    };

    // Realizar la solicitud de ruta
    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        this.directionsResults = result;

        // Extraer las coordenadas de la ruta calculada
        if (result) {
          this.extractRouteCoordinates(result);
        }

        // Crear marcadores con las coordenadas actualizadas
        this.createCustomMarkers();

        // Ajustar el centro y zoom basado en el bounds de la ruta
        if (result?.routes?.[0]?.bounds) {
          const bounds = result.routes[0].bounds;
          const center = bounds.getCenter();
          this.center = { lat: center.lat(), lng: center.lng() };
        }
      } else {
        console.error('Error al calcular la ruta:', status);
        // Si falla el cálculo de ruta, caemos de nuevo a mostrar los marcadores originales
        alert(
          'No se pudo calcular la ruta por carreteras. Se mostrarán los marcadores en las posiciones originales.',
        );
        this.createCustomMarkers(); // Usará las coordenadas originales
      }
    });
  }

  // Método para extraer las coordenadas de la ruta calculada y mantener la información original de las rutas
  extractRouteCoordinates(result: google.maps.DirectionsResult) {
    // Reiniciamos el array
    this.routeCoordinates = [];

    if (!result.routes || result.routes.length === 0) {
      return;
    }

    const route = result.routes[0];

    // El origen siempre es el primer punto
    const startLeg = route.legs[0];
    this.routeCoordinates.push({
      ...this.rutas[0],
      latitude: startLeg.start_location.lat().toString(),
      longitude: startLeg.start_location.lng().toString(),
    });

    // Recorremos todas las legs para obtener los waypoints
    route.legs.forEach((leg, index) => {
      // Si no es la última leg, agregamos el punto final como waypoint
      if (index < route.legs.length - 1) {
        this.routeCoordinates.push({
          ...this.rutas[index + 1],
          latitude: leg.end_location.lat().toString(),
          longitude: leg.end_location.lng().toString(),
        });
      }
    });

    // El destino es el último punto de la última leg
    const lastLeg = route.legs[route.legs.length - 1];
    this.routeCoordinates.push({
      ...this.rutas[this.rutas.length - 1],
      latitude: lastLeg.end_location.lat().toString(),
      longitude: lastLeg.end_location.lng().toString(),
    });
  }

  fitBounds() {
    if (typeof google === 'undefined' || !this.rutas || this.rutas.length === 0) return;

    try {
      const bounds = new google.maps.LatLngBounds();

      // Añadir todas las coordenadas al bounds
      for (const ruta of this.rutas) {
        const latitude = parseFloat(ruta.latitude);
        const longitude = parseFloat(ruta.longitude);

        if (!isNaN(latitude) && !isNaN(longitude)) {
          bounds.extend({ lat: latitude, lng: longitude });
        }
      }

      // Obtener el centro desde los límites
      const center = bounds.getCenter();
      this.center = { lat: center.lat(), lng: center.lng() };

      // Calculamos la distancia aproximada
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      // Calculamos la distancia aproximada
      const latDiff = Math.abs(ne.lat() - sw.lat());
      const lngDiff = Math.abs(ne.lng() - sw.lng());

      // Usamos el máximo de las diferencias para determinar un zoom apropiado
      const maxDiff = Math.max(latDiff, lngDiff);

      if (maxDiff > 100) this.zoom = 2;
      else if (maxDiff > 50) this.zoom = 3;
      else if (maxDiff > 25) this.zoom = 4;
      else if (maxDiff > 10) this.zoom = 5;
      else if (maxDiff > 5) this.zoom = 6;
      else if (maxDiff > 2) this.zoom = 7;
      else if (maxDiff > 1) this.zoom = 8;
      else if (maxDiff > 0.5) this.zoom = 9;
      else if (maxDiff > 0.2) this.zoom = 10;
      else this.zoom = 11;
    } catch (error) {
      console.error('Error al ajustar los límites del mapa:', error);
      // En caso de error, establecer un zoom seguro por defecto
      this.zoom = 5;
    }
  }
}
