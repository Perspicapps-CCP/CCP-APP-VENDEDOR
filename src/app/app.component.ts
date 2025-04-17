import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private translate: TranslateService,
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.platform.ready();
    this.setAppLanguage();
  }

  setAppLanguage() {
    // Utilizando la API de Internacionalización ECMA en lugar del plugin obsoleto
    // Obtener el idioma del dispositivo
    let defaultLang = 'en'; // Idioma por defecto en caso de error

    try {
      // Obtener el idioma del navegador o dispositivo
      // navigator.language es compatible con dispositivos móviles y navegadores
      const deviceLanguage = navigator.language || 'en';
      // Obtener el código de idioma principal (ej: 'es', 'en')
      defaultLang = deviceLanguage.split('-')[0];

      console.log('Idioma detectado del dispositivo:', deviceLanguage);
      console.log('Código de idioma a usar:', defaultLang);
    } catch (error) {
      console.error('Error al obtener el idioma del dispositivo:', error);
    }

    // Configurar idioma en la aplicación
    this.translate.setDefaultLang(defaultLang);
    this.translate.use(defaultLang);
    console.log('Idioma configurado:', defaultLang);

    // Si necesitas almacenar el idioma seleccionado (opcional)
    localStorage.setItem('selectedLanguage', defaultLang);
  }
}
