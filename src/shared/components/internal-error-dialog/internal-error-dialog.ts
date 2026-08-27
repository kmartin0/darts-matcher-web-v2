import {Component} from '@angular/core';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

/**
 * Displays a static dialog for unexpected internal application or API errors.
 *
 * The dialog intentionally uses fixed content and minimal dependencies so it can
 * also be used by the global application error handler.
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
}
