import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {isApiErrorBody} from '../error/api-error-body';
import {DialogService} from '../../shared/services/dialog-service/dialog.service';
import {ApiErrorBodyHandler} from '../services/api-error-body-handler.service';

@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {

  constructor(private dialogService: DialogService, private apiErrorBodyHandler: ApiErrorBodyHandler) {
  }

  /**
   * Intercepts HTTP requests to handle and process general API errors such as internal errors.
   *
   * @param req - The outgoing HTTP request.
   * @param next - The HTTP request handler.
   * @returns An Observable of the HTTP event stream.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError(err => {
        this.handleError(err, req, next);
        return throwError(() => err);
      })
    );
  }

  /**
   * Handles errors caught during an HTTP request.
   *
   * If the error is not an instance of `HttpErrorResponse` or the error body
   * is not a valid `ApiErrorBody`, an internal error dialog is shown.
   * Otherwise, it passes the valid API error body to `handleApiErrorBody()`.
   *
   * @param err - The caught error.
   * @param req - The original HTTP request.
   * @param next - The HTTP handler to continue the request chain (not used here).
   */
  private handleError(err: any, req: HttpRequest<any>, next: HttpHandler) {
    // Check if the error is a http Error or a known api error body. If not display an unknown error.
    if (!(err instanceof HttpErrorResponse) || !isApiErrorBody(err.error)) {
      // An unknown error occurred, display internal error to user.
      this.dialogService.openInternalErrorDialog();
      return;
    }

    // Handle the api error by displaying a dialog for globally occurring api errors.
    this.apiErrorBodyHandler.handleApiErrorBody(err.error);
  }
}
