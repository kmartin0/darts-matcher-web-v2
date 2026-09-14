import {Component, inject, signal} from '@angular/core';
import {form, FormField} from '@angular/forms/signals';
import {MatButton} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {DialogResult} from '../../types/dialog-result';
import {NumberSelectionFormDialogData} from './number-selection-form-dialog-data';
import * as NumberSelectionFormDialogModel from './number-selection-form-dialog.model';
import {NUMBER_SELECTION_FORM_DIALOG_SCHEMA} from './number-selection-form-dialog.schema';

@Component({
  selector: 'app-number-selection-form-dialog',
  imports: [
    FormField,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatRadioGroup,
    MatRadioButton
  ],
  templateUrl: './number-selection-form-dialog.html',
  styleUrl: './number-selection-form-dialog.scss'
})
export class NumberSelectionFormDialog {
  protected readonly dialogData = inject<NumberSelectionFormDialogData>(MAT_DIALOG_DATA);

  private readonly dialogRef =
    inject<MatDialogRef<NumberSelectionFormDialog, DialogResult<number>>>(MatDialogRef);

  private readonly formModel = signal<NumberSelectionFormDialogModel.FormModel>(
    NumberSelectionFormDialogModel.createInitialFormModel(
      this.dialogData.options.at(0) ?? null
    )
  );

  protected readonly numberSelectionForm = form(
    this.formModel,
    NUMBER_SELECTION_FORM_DIALOG_SCHEMA
  );

  protected readonly dismissedResult: DialogResult<number> = {
    status: 'dismissed'
  };

  /**
   * Submits the selected number and closes the dialog with a confirmed result.
   */
  protected onSubmit(): void {
    const number = this.formModel().number;

    if (number === null) {
      return;
    }

    this.dialogRef.close({
      status: 'confirmed',
      value: number
    });
  }
}
