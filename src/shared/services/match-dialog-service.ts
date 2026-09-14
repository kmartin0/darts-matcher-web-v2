import {inject, Injectable} from '@angular/core';
import {X01Checkout} from '../../data/model/x01/checkout/x01-checkout';
import {EditScoreFormDialog} from '../components/edit-score-form-dialog/edit-score-form-dialog';
import {EditScoreFormDialogData} from '../components/edit-score-form-dialog/edit-score-form-dialog-data';
import {NumberSelectionFormDialog} from '../components/number-selection-form-dialog/number-selection-form-dialog';
import {
  NumberSelectionFormDialogData
} from '../components/number-selection-form-dialog/number-selection-form-dialog-data';
import {DialogResult} from '../types/dialog-result';
import {DialogManagerService} from './dialog-manager.service';

@Injectable({providedIn: 'root'})
export class MatchDialogService {
  private readonly dialogManagerService = inject(DialogManagerService);

  /**
   * Opens the edit score dialog.
   *
   * @param data - Data used to initialize the edit score form.
   * @param stackable - Whether the dialog can be opened while another dialog is already open.
   * @returns Result of the edit score dialog.
   */
  openEditScoreDialog(data: EditScoreFormDialogData, stackable: boolean = false): Promise<DialogResult<number>> {
    return this.dialogManagerService.open<EditScoreFormDialog, EditScoreFormDialogData, number>(
      EditScoreFormDialog,
      {data: data},
      stackable
    );
  }

  /**
   * Opens the checkout darts used dialog.
   *
   * Uses the checkout's minimum darts to determine the available options,
   * defaulting to one dart when no checkout is available.
   *
   * @param checkout - Checkout used to determine the minimum number of darts.
   * @param stackable - Whether the dialog can be opened while another dialog is already open.
   * @returns Result of the checkout darts used dialog.
   */
  openCheckoutDartsUsedDialog(checkout: X01Checkout, stackable: boolean = false): Promise<DialogResult<number>> {
    const minDarts = checkout.minDarts;
    const maxDarts = 3;
    const options: number[] = [];

    for (let dartsUsed = minDarts; dartsUsed <= maxDarts; dartsUsed++) {
      options.push(dartsUsed);
    }

    const data: NumberSelectionFormDialogData = {
      title: 'Darts Used',
      options: options
    };

    return this.dialogManagerService.open<NumberSelectionFormDialog, NumberSelectionFormDialogData, number>(
      NumberSelectionFormDialog,
      {data: data},
      stackable
    );
  }

  /**
   * Opens the doubles missed dialog.
   *
   * @param stackable - Whether the dialog can be opened while another dialog is already open.
   * @returns Result of the doubles missed dialog.
   */
  openDoublesMissedDialog(stackable: boolean = false): Promise<DialogResult<number>> {
    const data: NumberSelectionFormDialogData = {
      title: 'Doubles Missed',
      options: [0, 1, 2, 3]
    };

    return this.dialogManagerService.open<NumberSelectionFormDialog, NumberSelectionFormDialogData, number>(
      NumberSelectionFormDialog,
      {data: data},
      stackable
    );
  }
}
