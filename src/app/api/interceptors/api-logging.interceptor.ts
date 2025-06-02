import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';

import {Injectable} from '@angular/core';
import {Observable, tap} from 'rxjs';


@Injectable()
export class ApiLoggingInterceptor implements HttpInterceptor {

  constructor() {
  }

  /**
   * Intercepts HTTP requests to log the request.
   *
   * @param req - The outgoing HTTP request.
   * @param next - The HTTP request handler.
   * @returns An Observable of the HTTP event stream.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.info(req);
    return next.handle(req).pipe(
      tap({
        next: (event) => console.info(event),
        error: (error) => console.error(error),
      })
    );
  }
}
