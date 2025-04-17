import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { LanguageConfig } from '../shared/models/LanguajeConfig.interface';
import { LocalCurrencyPipe } from '../shared/pipes/local-currency.pipe';
import { LocalDatePipe } from '../shared/pipes/local-date.pipe';
import { LocalizationService } from '../shared/services/localization.service';

@Component({
  selector: 'app-explore-container',
  templateUrl: './explore-container.component.html',
  styleUrls: ['./explore-container.component.scss'],
  imports: [
    TranslateModule,
    IonLabel,
    IonSelect,
    IonSelectOption,
    FormsModule,
    IonItem,
    CommonModule,
    LocalDatePipe,
    LocalCurrencyPipe,
  ],
})
export class ExploreContainerComponent implements OnInit, OnDestroy {
  // Valores de ejemplo para mostrar formateo
  currentDate = new Date();
  sampleAmount = 1234567.89;

  // Para la selección de idioma
  selectedLanguage?: string;
  selectedLocale?: string;
  selectedConfig?: LanguageConfig | null;

  availableLanguages: LanguageConfig[] = [];

  // Suscripciones
  private langSubscription: Subscription | undefined;
  private localeSubscription: Subscription | undefined;

  constructor(public localizationService: LocalizationService) {
    this.selectedLanguage = this.localizationService.getCurrentLanguage();
    this.availableLanguages = this.localizationService.getAllAvailableLanguages();
    this.selectedConfig = this.localizationService.getCurrentLocalization();
  }

  ngOnInit() {
    // Suscribirse a cambios de idioma
    this.langSubscription = this.localizationService.currentLang$.subscribe(lang => {
      this.selectedLanguage = lang;
      console.log('Idioma actualizado:', lang);
    });

    this.localeSubscription = this.localizationService.currentLocale$.subscribe(locale => {
      this.selectedLocale = locale;
      console.log('Locale actualizado:', locale);
    });
  }

  ngOnDestroy() {
    // Limpieza de suscripciones
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    if (this.localeSubscription) {
      this.localeSubscription.unsubscribe();
    }
  }

  // Método para cambiar el idioma/localización
  changeLanguage(config: LanguageConfig) {
    console.log('Configuración seleccionada:', config);
    if (config && config.localeCode) {
      // Aplicamos el cambio usando el localeCode
      this.localizationService.setLocale(config.localeCode);
    }
  }

  compareWith = (o1: LanguageConfig, o2: LanguageConfig) => {
    if (!o1 || !o2) {
      return false;
    }
    return o1.localeCode === o2.localeCode;
  };
}
