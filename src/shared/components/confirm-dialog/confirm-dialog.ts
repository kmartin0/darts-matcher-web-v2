import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import {ConfirmDialogData} from './confirm-dialog-data';
import {MatButton} from '@angular/material/button';


@Component({
  selector: 'app-confirm-dialog',
  imports: [
    MatDialogContent,
    MatDialogTitle,
    MatDialogActions,
    MatButton,
    MatDialogClose
  ],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss'
})
export class ConfirmDialog {
  private readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

  protected readonly action = this.data.action;
}
