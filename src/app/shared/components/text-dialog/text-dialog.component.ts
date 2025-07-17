import {Component, inject} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent} from '@angular/material/dialog';
import {TextDialogData} from './text-dialog-data';

import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-text-dialog',
  imports: [
    MatIcon,
    MatDialogContent,
    MatDialogActions,
    MatDialogActions,
    MatButton,
    MatDialogClose
],
  standalone: true,
  templateUrl: './text-dialog.component.html',
  styleUrl: './text-dialog.component.scss'
})
export class TextDialogComponent {

  public data = inject<TextDialogData>(MAT_DIALOG_DATA);

  get title(): string {
    return this?.data.title ?? '';
  }

  get subTitle(): string {
    return this?.data.subtitle ?? '';
  }

  get contentText(): string {
    return this?.data.contentText ?? '';
  }

  get confirmText(): string {
    return this?.data.confirmText ?? 'Ok';
  }

  get cancelText(): string {
    return this?.data.cancelText ?? 'Cancel';
  }

  get isCancelable(): boolean {
    return this?.data.isCancelable;
  }

  get matIcon(): string | null {
    return this?.data.matIcon ?? null;
  }

}
