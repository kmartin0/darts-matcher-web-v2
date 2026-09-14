import {inject, Injectable} from '@angular/core';
import {ConfirmDialog} from '../components/confirm-dialog/confirm-dialog';
import {ConfirmDialogData} from '../components/confirm-dialog/confirm-dialog-data';
import {DialogResult} from '../types/dialog-result';
import {DialogManagerService} from './dialog-manager.service';

@Injectable({providedIn: 'root'})
export class CommonDialogService {
  private readonly dialogManagerService = inject(DialogManagerService);

  /**
   * Opens a confirmation dialog for the specified action.
   *
   * @param actionText - Description of the action requiring confirmation.
   * @param stackable - Whether the dialog can be opened while another dialog is already open.
   * @returns Result of the confirmation dialog.
   */
  openConfirmDialog(actionText: string, stackable: boolean = false): Promise<DialogResult<boolean>> {
    const data: ConfirmDialogData = {
      actionText: actionText
    };

    return this.dialogManagerService.open<ConfirmDialog, ConfirmDialogData, boolean>(
      ConfirmDialog,
      {data: data},
      stackable
    );
  }
}
