import {ErrorHandler, Injectable} from '@angular/core';
import {BasicDialogService} from '../shared/services/basic-dialog.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

  constructor(private dialogService: BasicDialogService) {
  }

  handleError(error: any): void {
    console.error('Global Error Handler: ', error);
    this.dialogService.openInternalErrorDialog();
  }

}
