import {inject, Injectable} from '@angular/core';
import {ApiErrorBody, isApiErrorBody} from '../error/api-error-body';
import {ApiErrorEnum} from '../error/api-error-enum';
import {DialogService} from '../../shared/services/dialog-service/dialog.service';

@Injectable({providedIn: 'root'})
export class ApiErrorBodyHandler {
  private dialogService = inject(DialogService);

  /**
   * Handles API error bodies that should trigger the same UI response, regardless of where in the application they occur.
   * Such as Internal Server Errors or invalid uri's. These errors will be displayed to the user via a dialog.
   *
   * @param apiError - A valid `ApiErrorBody` containing the error code and optional metadata.
   */
  handleApiErrorBody(apiError: ApiErrorBody) {
    if (!isApiErrorBody(apiError)) {
      this.dialogService.openInternalErrorDialog();
      return;
    }

    switch (apiError.error) {
      case ApiErrorEnum.INTERNAL:
      case ApiErrorEnum.MESSAGE_NOT_READABLE:
      case ApiErrorEnum.METHOD_NOT_ALLOWED:
      case ApiErrorEnum.UNSUPPORTED_MEDIA_TYPE: {
        this.dialogService.openInternalErrorDialog();
        break;
      }
      case ApiErrorEnum.URI_NOT_FOUND: {
        this.dialogService.openUriNotFoundErrorDialog();
        break;
      }
      case ApiErrorEnum.UNAVAILABLE: {
        this.dialogService.openServiceUnavailableErrorDialog();
        break;
      }
    }
  }

}
