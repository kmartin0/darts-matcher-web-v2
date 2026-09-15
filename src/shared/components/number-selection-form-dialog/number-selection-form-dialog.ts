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
import {shouldIgnoreKeyDown} from '../../utils/keyboard.util';
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

  constructor() {
    this.dialogRef.keydownEvents().subscribe(event => this.onDialogKeyDown(event));
  }

  /**
   * Submits the selected number and closes the dialog with a confirmed result.
   */
  protected onSubmit(): void {
    const number = this.formModel().number;
    if (number === null) return;

    this.dialogRef.close({
      status: 'confirmed',
      value: number
    });
  }

  /**
   * Routes keyboard input for the active dialog.
   *
   * @param event - Keyboard event routed to the dialog.
   */
  private onDialogKeyDown(event: KeyboardEvent): void {
    if (shouldIgnoreKeyDown(event)) return;

    if (event.key === 'Enter') {
      this.onEnterKeyDown(event);
      return;
    }

    const option = this.mapKeyToOption(event.key);
    this.selectOptionFromKeyDown(event, option);
  }

  /**
   * Submits the selection on Enter unless a dialog button has focus.
   *
   * @param event - Enter key event to handle.
   */
  private onEnterKeyDown(event: KeyboardEvent): void {
    if (event.target instanceof HTMLButtonElement) return;

    event.preventDefault();
    this.onSubmit();
  }

  /**
   * Maps a keyboard key to an offered option.
   *
   * @param key - Keyboard key to map.
   * @returns The matching option, or `undefined` if none matches.
   */
  private mapKeyToOption(key: string): number | undefined {
    return this.dialogData.options.find(option => String(option) === key);
  }

  /**
   * Selects a mapped option and prevents the key's default action when an option was found.
   *
   * @param event - Keyboard event to handle.
   * @param option - Mapped option, or `undefined` when the key did not match.
   */
  private selectOptionFromKeyDown(
    event: KeyboardEvent,
    option: number | undefined
  ): void {
    if (option === undefined) return;

    event.preventDefault();
    this.formModel.set({number: option});
  }
}
