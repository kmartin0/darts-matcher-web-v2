import {inject, Injectable} from '@angular/core';
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
   */
  openInternalErrorDialog(stackable: boolean = false): void {
    void this.dialogManagerService.open<InternalErrorDialog, unknown, undefined>(
      InternalErrorDialog,
      undefined,
      stackable
    );
  }

  /**
   * Opens a dialog for an API URI that could not be found.
   *
   * @param stackable - Whether the dialog can be opened while another dialog is already open.
   */
  openUriNotFoundErrorDialog(stackable: boolean = false): void {
    const data: TextDialogData = {
      title: 'Error',
      subtitle: 'The URI you are trying to reach could not be found',
      contentText: 'Please try again later.',
      matIcon: 'error'
    };

    void this.dialogManagerService.open<TextDialog, TextDialogData, undefined>(
      TextDialog,
      {data: data},
      stackable
    );
  }

  /**
   * Opens a dialog when the API cannot currently be reached.
   *
   * @param stackable - Whether the dialog can be opened while another dialog is already open.
   */
  openServiceUnavailableErrorDialog(stackable: boolean = false): void {
    const data: TextDialogData = {
      title: 'Could not make a connection',
      contentText: 'Please try again later.',
      matIcon: 'error'
    };

    void this.dialogManagerService.open<TextDialog, TextDialogData, undefined>(
      TextDialog,
      {data: data},
      stackable
    );
  }
}
