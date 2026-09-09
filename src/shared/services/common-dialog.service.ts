import {inject, Injectable} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialog} from '../components/confirm-dialog/confirm-dialog';
import {ConfirmDialogData} from '../components/confirm-dialog/confirm-dialog-data';
import {DialogManagerService} from './dialog-manager.service';

@Injectable({providedIn: 'root'})
export class CommonDialogService {
  private readonly dialogManagerService = inject(DialogManagerService);

  /**
   * Opens a confirmation dialog for the specified action.
   *
   * @param action - Description of the action requiring confirmation.
   * @param stackable - Whether the dialog can be opened while another dialog is already open.
   * @returns Reference to the opened dialog, or null when prevented by stacking rules.
   */
  openConfirmDialog(action: string, stackable: boolean = false): MatDialogRef<ConfirmDialog, boolean> | null {
    const data: ConfirmDialogData = {
      action: action
    };

    return this.dialogManagerService.open(
      ConfirmDialog,
      {data: data},
      stackable
    );
  }
}
