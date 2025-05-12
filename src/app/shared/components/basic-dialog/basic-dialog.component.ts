import {Component, Inject} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import {BasicDialogData} from './basic-dialog-data';
import {NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-basic-dialog',
  imports: [
    MatIcon,
    NgIf,
    MatDialogContent,
    MatDialogActions,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    MatDialogTitle
  ],
  standalone: true,
  templateUrl: './basic-dialog.component.html',
  styleUrl: './basic-dialog.component.scss'
})
export class BasicDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: BasicDialogData) {
  }

  get title(): string {
    return this.data.title ?? '';
  }

  get subTitle(): string {
    return this.data.subtitle ?? '';
  }

  get contentText(): string {
    return this.data.contentText ?? '';
  }

  get confirmText(): string {
    return this.data.confirmText ?? 'Ok';
  }

  get cancelText(): string {
    return this.data.cancelText ?? 'Cancel';
  }

  get isCancelable(): boolean {
    return this.data.isCancelable;
  }

  get matIcon(): string | null {
    return this.data.matIcon ?? null;
  }

}
