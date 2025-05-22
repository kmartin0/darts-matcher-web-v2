import {ErrorHandler, Injectable, NgZone} from '@angular/core';
import {DialogService} from '../shared/services/dialog-service/dialog.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor(private dialogService: DialogService) {
  }

  handleError(error: any): void {
    console.error('Global Error Handler: ', error);
    this.dialogService.openInternalErrorDialog();
  }

}
