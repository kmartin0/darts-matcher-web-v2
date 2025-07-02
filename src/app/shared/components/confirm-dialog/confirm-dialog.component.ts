import {Component, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {BaseComponent} from '../base/base.component';

export interface ConfirmDialogData {
  action: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle
  ],
  standalone: true,
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent extends BaseComponent {

  public dialogData = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  constructor() {
    super();
    if (!this.dialogData) throw Error('Confirm Dialog Data Missing.');
  }

  /**
   * Closes the dialog with boolean true result to reflect confirmation.
   */
  submitDialog() {
    this.dialogRef.close(true);
  }

  /**
   * Closes the dialog with boolean false result to reflect cancellation.
   */
  cancelDialog() {
    this.dialogRef.close(false);
  }

}
