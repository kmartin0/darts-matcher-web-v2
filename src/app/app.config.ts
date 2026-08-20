import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {AppStore} from './app-store';
import {MAT_ICON_DEFAULT_OPTIONS} from '@angular/material/icon';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {apiErrorInterceptor} from '../data/api/interceptors/api-error.interceptor';
import {apiLoggingInterceptor} from '../data/api/interceptors/api-logging.interceptor';
import {GlobalErrorHandler} from './global-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    {provide: ErrorHandler, useClass: GlobalErrorHandler},
    provideHttpClient(
      withInterceptors([
        apiErrorInterceptor,
        apiLoggingInterceptor
      ])
    ),
    provideRouter(routes),
    {provide: MAT_ICON_DEFAULT_OPTIONS, useValue: {fontSet: 'material-symbols-outlined'}},
    provideAppInitializer(() => {
      inject(AppStore);
    })
  ]
};
