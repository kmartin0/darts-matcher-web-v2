import {ErrorHandler, inject, Injectable} from '@angular/core';
import {ErrorDialogService} from '../shared/services/error-dialog.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly errorDialogService = inject(ErrorDialogService);

  /**
   * Handles uncaught errors by logging the error and showing the internal error dialog.
   *
   * @param error - Uncaught error to handle.
   */
  handleError(error: unknown): void {
    console.error('Global Error Handler:', error);
    this.errorDialogService.openInternalErrorDialog();
  }
}
