import {inject, Injectable} from '@angular/core';
import {ApiErrorCode} from './api-error-code';
import {ApiErrorResponse} from './api-error-response';
import {ErrorDialogService} from '../../../shared/services/error-dialog.service';

@Injectable({
  providedIn: 'root',
})
export class ApiErrorHandlerService {
  private readonly errorDialogService = inject(ErrorDialogService);

  /**
   * Handles API errors that require application-wide handling.
   *
   * Errors intended for local handling are ignored.
   *
   * @param error - API error response to handle.
   */
  handle(error: ApiErrorResponse): void {
    switch (error.error) {
      case ApiErrorCode.INTERNAL:
      case ApiErrorCode.MESSAGE_NOT_READABLE:
      case ApiErrorCode.METHOD_NOT_ALLOWED:
      case ApiErrorCode.UNSUPPORTED_MEDIA_TYPE:
        this.errorDialogService.openInternalErrorDialog();
        break;

      case ApiErrorCode.URI_NOT_FOUND:
        this.errorDialogService.openUriNotFoundErrorDialog();
        break;

      case ApiErrorCode.UNAVAILABLE:
        this.errorDialogService.openServiceUnavailableErrorDialog();
        break;

      case ApiErrorCode.INVALID_ARGUMENTS:
      case ApiErrorCode.RESOURCE_NOT_FOUND:
      case ApiErrorCode.CONFLICT:
        break;
    }
  }
}
