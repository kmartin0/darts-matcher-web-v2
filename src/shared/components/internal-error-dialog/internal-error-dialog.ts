import {Component} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {DialogResult} from '../../types/dialog-result';

/**
 * Displays a static dialog for unexpected internal application or API errors.
 *
 * Unlike the generic error dialog, this component uses fixed content and can
 * be safely opened by the global application error handler.
 */
@Component({
  selector: 'app-internal-error-dialog',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatIcon,
    MatDialogTitle
  ],
  templateUrl: './internal-error-dialog.html',
  styleUrl: './internal-error-dialog.scss'
})
export class InternalErrorDialog {
  protected readonly confirmedResult: DialogResult<undefined> = {
    status: 'confirmed',
    value: undefined
  };
}
