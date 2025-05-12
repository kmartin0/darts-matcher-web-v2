import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';

import {Injectable} from '@angular/core';
import {Observable, tap} from 'rxjs';


@Injectable()
export class ApiLoggingInterceptor implements HttpInterceptor {

  constructor() {
  }

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
