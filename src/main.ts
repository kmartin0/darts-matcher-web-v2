import {bootstrapApplication} from '@angular/platform-browser';
import {appConfig} from './app/core/app.config';
import {AppComponent} from './app/core/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
