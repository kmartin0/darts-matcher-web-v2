import {inject, Injectable} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {InternalErrorDialog} from '../components/internal-error-dialog/internal-error-dialog';
import {TextDialog} from '../components/text-dialog/text-dialog';
import {TextDialogData} from '../components/text-dialog/text-dialog-data';
import {DialogManagerService} from './dialog-manager.service';

@Injectable({providedIn: 'root'})
export class ErrorDialogService {
  private readonly dialogManagerService = inject(DialogManagerService);

  /**
   * Opens the internal error dialog.
   *
   * @param stackable - Whether the dialog can be opened while another dialog is already open.
   * @returns Reference to the opened dialog, or null when prevented by stacking rules.
   */
  openInternalErrorDialog(stackable: boolean = false): MatDialogRef<InternalErrorDialog> | null {
    return this.dialogManagerService.open(
      InternalErrorDialog,
      undefined,
      stackable
    );
  }

  /**
   * Opens a dialog for an API URI that could not be found.
   *
   * @param stackable - Whether the dialog can be opened while another dialog is already open.
   * @returns Reference to the opened dialog, or null when prevented by stacking rules.
   */
  openUriNotFoundErrorDialog(stackable: boolean = false): MatDialogRef<TextDialog> | null {
    const data: TextDialogData = {
      title: 'Error',
      subtitle: 'The URI you are trying to reach could not be found',
      contentText: 'Please try again later.',
      matIcon: 'error'
    };

    return this.dialogManagerService.open(TextDialog, {data: data}, stackable);
  }

  /**
   * Opens a dialog when the API cannot currently be reached.
   *
   * @param stackable - Whether the dialog can be opened while another dialog is already open.
   * @returns Reference to the opened dialog, or null when prevented by stacking rules.
   */
  openServiceUnavailableErrorDialog(stackable: boolean = false): MatDialogRef<TextDialog> | null {
    const data: TextDialogData = {
      title: 'Could not make a connection',
      contentText: 'Please try again later.',
      matIcon: 'error'
    };

    return this.dialogManagerService.open(TextDialog, {data: data}, stackable);
  }
}
