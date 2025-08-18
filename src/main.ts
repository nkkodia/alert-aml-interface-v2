import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeFrExtra from '@angular/common/locales/extra/fr';
import {AppComponent} from './app/app.component';

registerLocaleData(localeFr, 'fr-FR', localeFrExtra);
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
