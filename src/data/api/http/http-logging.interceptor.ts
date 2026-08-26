import {HttpInterceptorFn, HttpResponse} from '@angular/common/http';
import {tap} from 'rxjs';
import {environment} from '../../../environments/environment';

/**
 * Logs requests and responses for the Darts Matcher API.
 */
export const httpLoggingInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.dartsMatcherApiUrl)) {
    return next(request);
  }

  console.info(request);

  return next(request).pipe(
    tap({
      next: event => {
        if (event instanceof HttpResponse) {
          console.info(event);
        }
      },
      error: error => {
        console.error(error);
      }
    })
  );
};
