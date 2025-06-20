import {ApplicationConfig, ErrorHandler, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {appRoutes} from './app.routes';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {provideAnimations} from '@angular/platform-browser/animations';
import {ApiLoggingInterceptor} from '../api/interceptors/api-logging.interceptor';
import {ApiErrorInterceptor} from '../api/interceptors/api-error.interceptor';
import {GlobalErrorHandler} from './global-error-handler';
import {MAT_ICON_DEFAULT_OPTIONS} from '@angular/material/icon';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(appRoutes),
    provideAnimations(),
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    {provide: HTTP_INTERCEPTORS, useClass: ApiLoggingInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ApiErrorInterceptor, multi: true},
    {provide: ErrorHandler, useClass: GlobalErrorHandler},
    {provide: MAT_ICON_DEFAULT_OPTIONS, useValue: {fontSet: 'material-symbols-outlined'}}
  ],
};
