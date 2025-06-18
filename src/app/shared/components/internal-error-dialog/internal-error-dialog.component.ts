import {Component} from '@angular/core';
import {MatDialogActions, MatDialogClose, MatDialogContent} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {BaseComponent} from '../base/base.component';

/**
 * Dialog component with static text specific for internal errors. Angular component lifecycle may be disrupted in certain
 * application errors (such as template errors). This is why a static internal error dialog is made instead of using
 * the basic dialog component.
 */
@Component({
  selector: 'app-internal-error-dialog',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatIcon
  ],
  standalone: true,
  templateUrl: './internal-error-dialog.component.html',
  styleUrl: './internal-error-dialog.component.scss'
})
export class InternalErrorDialogComponent extends BaseComponent {

}
