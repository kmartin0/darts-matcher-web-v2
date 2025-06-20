import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';

import {Injectable} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {environment} from '../../../environments/environment';


@Injectable()
export class ApiLoggingInterceptor implements HttpInterceptor {

  constructor() {
  }

  /**
   * Intercepts HTTP requests to log the request and response with the Api.
   *
   * @param req - The outgoing HTTP request.
   * @param next - The HTTP request handler.
   * @returns An Observable of the HTTP event stream.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.startsWith(environment.dartsMatcherApiUrl)) {
      console.info(req);
      return next.handle(req).pipe(
        tap({
          next: (event) => console.info(event),
          error: (error) => console.error(error),
        })
      );
    }

    return next.handle(req);
  }
}
