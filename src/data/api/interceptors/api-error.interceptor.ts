import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {catchError, throwError} from 'rxjs';
import {ApiErrorCode} from '../errors/api-error-code';
import {ApiErrorResponse, isApiErrorResponse} from '../errors/api-error-response';
import {inject} from '@angular/core';
import {ErrorDialogService} from '../../../shared/services/error-dialog.service';

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const errorDialogService = inject(ErrorDialogService);

  return next(request).pipe(
    catchError((error: unknown) => {
      handleGlobalHttpError(error, errorDialogService);

      return throwError(() => error);
    })
  );
};

/**
 * Handles HTTP errors that require the same response regardless of where
 * they occur in the application.
 *
 * @param error - Error produced by an HTTP request.
 * @param errorDialogService - Service used to display global error dialogs.
 */
function handleGlobalHttpError(error: unknown, errorDialogService: ErrorDialogService): void {
  if (!(error instanceof HttpErrorResponse)) {
    errorDialogService.openInternalErrorDialog()
    return;
  }

  if (error.status === 0) {
    errorDialogService.openServiceUnavailableErrorDialog()
    return;
  }

  if (!isApiErrorResponse(error.error)) {
    errorDialogService.openInternalErrorDialog();
    return;
  }

  handleGlobalApiError(error.error, errorDialogService);
}

/**
 * Handles API error responses that require application-wide handling.
 *
 * @param error - Valid API error response to handle.
 * @param errorDialogService - Service used to display global error dialogs.
 */
function handleGlobalApiError(error: ApiErrorResponse, errorDialogService: ErrorDialogService): void {
  switch (error.error) {
    case ApiErrorCode.INTERNAL:
    case ApiErrorCode.MESSAGE_NOT_READABLE:
    case ApiErrorCode.METHOD_NOT_ALLOWED:
    case ApiErrorCode.UNSUPPORTED_MEDIA_TYPE:
      errorDialogService.openInternalErrorDialog()
      break;

    case ApiErrorCode.URI_NOT_FOUND:
      errorDialogService.openUriNotFoundErrorDialog()
      break;

    case ApiErrorCode.UNAVAILABLE:
      errorDialogService.openServiceUnavailableErrorDialog()
      break;

    case ApiErrorCode.INVALID_ARGUMENTS:
    case ApiErrorCode.RESOURCE_NOT_FOUND:
    case ApiErrorCode.CONFLICT:
      break;
  }
}
