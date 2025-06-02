import {ErrorHandler, Injectable} from '@angular/core';
import {DialogService} from '../shared/services/dialog-service/dialog.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor(private dialogService: DialogService) {
  }

  /**
   * Handles uncaught errors by opening a dialog showing the user something unexpected went wrong.
   *
   * @param error - The error object to handle.
   */
  handleError(error: any): void {
    console.error('Global Error Handler: ', error);
    this.dialogService.openInternalErrorDialog();
  }

}
