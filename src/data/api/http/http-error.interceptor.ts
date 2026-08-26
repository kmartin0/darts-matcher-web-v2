import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {catchError, throwError} from 'rxjs';
import {ApiErrorCode} from '../errors/api-error-code';
import {ApiErrorResponse, isApiErrorResponse} from '../errors/api-error-response';
import {inject} from '@angular/core';
import {ErrorDialogService} from '../../../shared/services/error-dialog.service';
import {ApiErrorHandlerService} from '../errors/api-error-handler.service';

export const httpErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const errorDialogService = inject(ErrorDialogService);
  const apiErrorHandlerService = inject(ApiErrorHandlerService);

  return next(request).pipe(
    catchError((error: unknown) => {
      handleGlobalHttpError(error, errorDialogService, apiErrorHandlerService);

      return throwError(() => error);
    })
  );
};

/**
 * Handles HTTP-specific failures and delegates valid API error responses to the shared API error handler.
 *
 * @param error - Error produced by an HTTP request.
 * @param errorDialogService - Service used to display HTTP-specific global error dialogs.
 * @param apiErrorHandler - Handler for application-wide API error responses.
 */
function handleGlobalHttpError(
  error: unknown,
  errorDialogService: ErrorDialogService,
  apiErrorHandler: ApiErrorHandlerService
): void {
  if (!(error instanceof HttpErrorResponse)) {
    errorDialogService.openInternalErrorDialog();
    return;
  }

  if (error.status === 0) {
    errorDialogService.openServiceUnavailableErrorDialog();
    return;
  }

  if (!isApiErrorResponse(error.error)) {
    errorDialogService.openInternalErrorDialog();
    return;
  }

  apiErrorHandler.handle(error.error);
}
