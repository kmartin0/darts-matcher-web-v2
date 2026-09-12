import {Component, inject, signal} from '@angular/core';
import {form, FormField} from '@angular/forms/signals';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {FormError} from '../form-error/form-error';

import * as EditScoreFormDialogModel from './edit-score-form-dialog.model';
import {EDIT_SCORE_FORM_DIALOG_SCHEMA} from './edit-score-form-dialog.schema';
import {EditScoreFormDialogData} from './edit-score-form-dialog-data';

@Component({
  selector: 'app-edit-score-dialog',
  templateUrl: './edit-score-form-dialog.html',
  styleUrl: './edit-score-form-dialog.scss',
  imports: [
    FormField,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatFormField,
    MatInput,
    MatLabel,
    FormError,
    MatDialogClose
  ]
})
export class EditScoreFormDialog {
  private readonly dialogData = inject<EditScoreFormDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<EditScoreFormDialog, number>);

  private readonly formModel = signal<EditScoreFormDialogModel.FormModel>(
    EditScoreFormDialogModel.createInitialFormModel(this.dialogData.currentScore)
  );

  protected readonly editScoreForm = form(
    this.formModel,
    EDIT_SCORE_FORM_DIALOG_SCHEMA
  );

  protected readonly playerName = this.dialogData.playerName;
  protected readonly setNumber = this.dialogData.setNumber;
  protected readonly legNumber = this.dialogData.legNumber;
  protected readonly roundNumber = this.dialogData.roundNumber;

  /**
   * Submits the edited score and closes the dialog.
   */
  protected onSubmit(): void {
    if (this.editScoreForm().invalid()) {
      return;
    }

    this.dialogRef.close(this.formModel().score);
  }
}
