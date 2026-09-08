import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, throwError} from 'rxjs';
import {ErrorDialogService} from '../../../shared/services/error-dialog.service';
import {ApiErrorCodes} from '../errors/api-error-code';
import {ApiErrorHandlerService} from '../errors/api-error-handler.service';
import {isApiErrorResponse} from '../errors/api-error-response';
import {LOCALLY_HANDLED_ERRORS_TOKEN} from './http-api-error-context';

export const httpErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const errorDialogService = inject(ErrorDialogService);
  const apiErrorHandlerService = inject(ApiErrorHandlerService);
  const handleLocally = request.context.get(LOCALLY_HANDLED_ERRORS_TOKEN);

  return next(request).pipe(
    catchError((error: unknown) => {
      handleGlobalHttpError(error, handleLocally, errorDialogService, apiErrorHandlerService);

      return throwError(() => error);
    })
  );
};

/**
 * Handles HTTP-specific failures and delegates valid API error responses to the shared API error handler.
 *
 * @param error - Error produced by an HTTP request.
 * @param handleLocally - API error codes handled locally by the caller.
 * @param errorDialogService - Service used to display HTTP-specific global error dialogs.
 * @param apiErrorHandlerService - Service used to handle application-wide API error responses.
 */
function handleGlobalHttpError(
  error: unknown,
  handleLocally: ApiErrorCodes,
  errorDialogService: ErrorDialogService,
  apiErrorHandlerService: ApiErrorHandlerService
): void {
  // Open internal error dialog for non-HTTP failures.
  if (!(error instanceof HttpErrorResponse)) {
    errorDialogService.openInternalErrorDialog();
    return;
  }

  // error is now an http error.
  const httpError = error;

  // Open the service unavailable dialog when the backend cannot be reached.
  if (httpError.status === 0) {
    errorDialogService.openServiceUnavailableErrorDialog();
    return;
  }

  // Open the internal error dialog when the response does not match the API error contract.
  if (!isApiErrorResponse(httpError.error)) {
    errorDialogService.openInternalErrorDialog();
    return;
  }

  // Handle the API error unless the caller handles it locally.
  apiErrorHandlerService.handle(httpError.error, handleLocally);
}
