import {Component, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {TextDialogData} from './text-dialog-data';

@Component({
  selector: 'app-text-dialog',
  imports: [
    MatIcon,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatDialogTitle
  ],
  templateUrl: './text-dialog.html',
  styleUrl: './text-dialog.scss'
})
export class TextDialog {
  private readonly data = inject<TextDialogData>(MAT_DIALOG_DATA);

  protected readonly title = this.data.title ?? '';
  protected readonly subtitle = this.data.subtitle ?? '';
  protected readonly contentText = this.data.contentText ?? '';
  protected readonly confirmText = this.data.confirmText ?? 'Ok';
  protected readonly cancelText = this.data.cancelText ?? 'Cancel';
  protected readonly isCancelable = this.data.isCancelable ?? false;
  protected readonly matIcon = this.data.matIcon ?? null;
}
