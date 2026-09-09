import {inject, Injectable} from '@angular/core';
import {ApiErrorCode, ApiErrorCodes} from './api-error-code';
import {ApiErrorResponse} from './api-error-response';
import {ErrorDialogService} from '../../../shared/services/error-dialog.service';

@Injectable({
  providedIn: 'root',
})
export class ApiErrorHandlerService {
  private readonly errorDialogService = inject(ErrorDialogService);

  /**
   * Handles an API error using the appropriate global error dialog.
   *
   * API errors handled locally by the caller are ignored by this handler.
   *
   * @param errorResponse - API error response to handle.
   * @param handleLocally - API error codes handled locally by the caller.
   */
  handle(errorResponse: ApiErrorResponse, handleLocally: ApiErrorCodes = []): void {
    if (handleLocally.includes(errorResponse.type)) {
      return;
    }

    switch (errorResponse.type) {
      case ApiErrorCode.INTERNAL:
      case ApiErrorCode.MESSAGE_NOT_READABLE:
      case ApiErrorCode.METHOD_NOT_ALLOWED:
      case ApiErrorCode.UNSUPPORTED_MEDIA_TYPE:
      case ApiErrorCode.INVALID_ARGUMENTS:
      case ApiErrorCode.RESOURCE_NOT_FOUND:
      case ApiErrorCode.CONFLICT:
        this.errorDialogService.openInternalErrorDialog();
        break;

      case ApiErrorCode.URI_NOT_FOUND:
        this.errorDialogService.openUriNotFoundErrorDialog();
        break;

      case ApiErrorCode.UNAVAILABLE:
        this.errorDialogService.openServiceUnavailableErrorDialog();
        break;
    }
  }
}
