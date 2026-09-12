import {inject, Injectable} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {EditScoreFormDialog} from '../components/edit-score-form-dialog/edit-score-form-dialog';
import {EditScoreFormDialogData} from '../components/edit-score-form-dialog/edit-score-form-dialog-data';
import {DialogManagerService} from './dialog-manager.service';
import {X01Checkout} from '../../data/model/x01/checkout/x01-checkout';
import {NumberSelectionFormDialog} from '../components/number-selection-form-dialog/number-selection-form-dialog';
import {
  NumberSelectionFormDialogData
} from '../components/number-selection-form-dialog/number-selection-form-dialog-data';

@Injectable({providedIn: 'root'})
export class MatchDialogService {
  private readonly dialogManagerService = inject(DialogManagerService);

  /**
   * Opens the edit score dialog.
   *
   * @param data - Data used to initialize the edit score form.
   * @param stackable - Whether the dialog can be opened while another dialog is already open.
   * @returns Reference to the opened dialog, or null when prevented by stacking rules.
   */
  openEditScoreDialog(data: EditScoreFormDialogData, stackable: boolean = false): MatDialogRef<EditScoreFormDialog, number> | null {
    return this.dialogManagerService.open(
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
   * @returns Reference to the opened dialog, or null when prevented by stacking rules.
   */
  openCheckoutDartsUsedDialog(checkout: X01Checkout | null, stackable: boolean = false): MatDialogRef<NumberSelectionFormDialog, number> | null {
    const minDarts = checkout?.minDarts ?? 1;
    const maxDarts = 3;
    const options: number[] = [];

    for (let dartsUsed = minDarts; dartsUsed <= maxDarts; dartsUsed++) {
      options.push(dartsUsed);
    }

    const data: NumberSelectionFormDialogData = {
      title: 'Darts Used',
      options: options
    };

    return this.dialogManagerService.open(
      NumberSelectionFormDialog,
      {data: data},
      stackable
    );
  }

  /**
   * Opens the doubles missed dialog.
   *
   * @param stackable - Whether the dialog can be opened while another dialog is already open.
   * @returns Reference to the opened dialog, or null when prevented by stacking rules.
   */
  openDoublesMissedDialog(stackable: boolean = false): MatDialogRef<NumberSelectionFormDialog, number> | null {
    const data: NumberSelectionFormDialogData = {
      title: 'Doubles Missed',
      options: [0, 1, 2, 3]
    };

    return this.dialogManagerService.open(
      NumberSelectionFormDialog,
      {data: data},
      stackable
    );
  }
}
