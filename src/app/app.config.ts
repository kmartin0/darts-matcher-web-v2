import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';

import {routes} from './app.routes';
import {AppStore} from './app-store';
import {MAT_ICON_DEFAULT_OPTIONS} from '@angular/material/icon';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {httpErrorInterceptor} from '../data/api/http/http-error.interceptor';
import {httpLoggingInterceptor} from '../data/api/http/http-logging.interceptor';
import {GlobalErrorHandler} from './global-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    {provide: ErrorHandler, useClass: GlobalErrorHandler},
    provideHttpClient(
      withInterceptors([
        httpErrorInterceptor,
        httpLoggingInterceptor
      ])
    ),
    provideRouter(
      routes,
      withComponentInputBinding()
    ),
    {provide: MAT_ICON_DEFAULT_OPTIONS, useValue: {fontSet: 'material-symbols-outlined'}},
    provideAppInitializer(() => {
      inject(AppStore);
    })
  ]
};
