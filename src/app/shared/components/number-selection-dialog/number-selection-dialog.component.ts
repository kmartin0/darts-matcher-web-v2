import {Component, DestroyRef, Inject} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {KeydownEventDispatcherService} from '../../services/keydown-event-dispatcher/keydown-event-dispatcher.service';

export interface NumberSelectionDialogData {
  title: string;
  options: number[];
}

/**
 * A standalone dialog component that allows users to select a number
 * from a list of options using radio buttons or keyboard input.
 *
 * Handles numeric key presses for selection and enter/escape key for submitting and closing the dialog.
 */
@Component({
  selector: 'app-number-selection-dialog',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatRadioButton,
    MatRadioGroup,
    ReactiveFormsModule
  ],
  standalone: true,
  templateUrl: './number-selection-dialog.component.html',
  styleUrl: './number-selection-dialog.component.scss'
})
export class NumberSelectionDialogComponent {

  numberOptionsFormControl = new FormControl<number | null>(null);

  acceptedNumericKeyStrokes: string[] = [];
  acceptedSpecialKeyStrokes: string[] = ['Enter', 'Cancel'];

  /**
   * Creates and initializes the dialog with number selection data and sets up keyboard interaction.
   * Throws an error if `dialogData` is not provided.
   *
   * @param dialogData - Configuration for the dialog including title and number options
   * @param dialogRef - Reference to the currently open dialog instance
   * @param keydownEventDispatcher - Service to observe global keydown events
   * @param destroyRef - Angular destroy lifecycle reference for automatic cleanup
   */
  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: NumberSelectionDialogData,
              private dialogRef: MatDialogRef<NumberSelectionDialogComponent>,
              private keydownEventDispatcher: KeydownEventDispatcherService,
              private destroyRef: DestroyRef) {
    if (!dialogData) throw Error('Number Selection Dialog Data Missing.');

    this.initKeyDownListener();
    this.initAcceptedKeyStrokes();
  }

  /**
   * Submits the selected value and closes the dialog.
   */
  submitDialog() {
    this.dialogRef.close(this.numberOptionsFormControl.getRawValue() ?? 0);
  }

  /**
   * Cancels the dialog and returns `undefined`.
   */
  cancelDialog() {
    this.dialogRef.close(undefined);
  }

  /**
   * Subscribes to global keyboard events and handles numeric or special keys.
   */
  private initKeyDownListener() {
    this.keydownEventDispatcher.getKeyDownObservable(this.destroyRef)
      .subscribe(event => this.handleKeyboardEvent(event));
  }

  /**
   * Initializes the list of accepted numeric keystrokes based on the options provided to the dialog.
   * Sets the initial selection to the first option.
   */
  private initAcceptedKeyStrokes() {
    this.acceptedNumericKeyStrokes = this.dialogData.options.map(String);
    this.numberOptionsFormControl.setValue(this.dialogData.options[0]);
  }

  /**
   * Handles keyboard events and routes to the appropriate handler
   * based on whether the key is numeric or a special key.
   *
   * @param event - The raw keyboard event
   */
  private handleKeyboardEvent(event: KeyboardEvent) {
    if (event.repeat) return;

    if (this.acceptedNumericKeyStrokes.includes(event.key)) {
      this.onNumericKeyStroke(event);
      return;
    }

    if (this.acceptedSpecialKeyStrokes.includes(event.key)) {
      this.onSpecialKeyStroke(event);
      return;
    }
  }

  /**
   * Handles numeric keyboard input, setting the selected value.
   *
   * @param event - Keyboard event with a valid numeric key
   */
  private onNumericKeyStroke(event: KeyboardEvent) {
    event.preventDefault();
    const number = Number(event.key);
    if (!Number.isNaN(number)) this.setValue(Number(event.key));
  }

  /**
   * Handles special key strokes like Enter (submit) and Escape (cancel).
   *
   * @param event - Keyboard event with a special key
   */
  private onSpecialKeyStroke(event: KeyboardEvent) {
    event.preventDefault();

    switch (event.key) {
      case 'Enter': {
        this.submitDialog();
        break;
      }
      case 'Escape': {
        this.cancelDialog();
        break;
      }
    }
  }

  /**
   * Updates the selected number option if it is part of the allowed list.
   *
   * @param dartsUsed - Number to set as selected
   */
  private setValue(dartsUsed: number) {
    if (this.dialogData.options.includes(dartsUsed)) this.numberOptionsFormControl.setValue(dartsUsed);
  }
}
