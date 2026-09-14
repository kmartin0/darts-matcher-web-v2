import {Component, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import {ConfirmDialogData} from './confirm-dialog-data';
import {DialogResult} from '../../types/dialog-result';

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

  protected readonly action = this.data.actionText;

  protected readonly dismissedResult: DialogResult<boolean> = {
    status: 'dismissed'
  };

  protected readonly confirmedResult: DialogResult<boolean> = {
    status: 'confirmed',
    value: true
  };
}
