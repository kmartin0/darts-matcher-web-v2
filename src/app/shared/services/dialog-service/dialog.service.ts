import {Injectable, NgZone} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {BasicDialogData} from '../../components/basic-dialog/basic-dialog-data';
import {BasicDialogComponent} from '../../components/basic-dialog/basic-dialog.component';
import {InternalErrorDialogComponent} from '../../components/internal-error-dialog/internal-error-dialog.component';
import {X01CheckoutService} from '../x01-checkout-service/x01-checkout-service';
import {X01Checkout} from '../../../models/x01-match/x01-checkout';
import {
  NumberSelectionDialogComponent, NumberSelectionDialogData
} from '../../components/number-selection-dialog/number-selection-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  public constructor(private matDialog: MatDialog, private checkoutService: X01CheckoutService) {
  }

  public openBasicDialog(dialogData: BasicDialogData, stackable: boolean = false): MatDialogRef<BasicDialogComponent> | null {
    // When a dialog is marked stackable always open, otherwise only open if no other dialog is open.
    if (stackable || !this.isDialogOpen()) {
      return this.matDialog.open(BasicDialogComponent, {data: dialogData});
    }

    return null;
  }

  public openErrorDialog(errorTitle?: string, errorSubtitle?: string, errorMsg?: string, stackable: boolean = false): MatDialogRef<BasicDialogComponent> | null {
    const dialogData: BasicDialogData = {
      title: errorTitle,
      subtitle: errorSubtitle,
      contentText: errorMsg,
      matIcon: 'error',
      isCancelable: false
    };

    return this.openBasicDialog(dialogData, stackable);
  }

  public openInternalErrorDialog(stackable: boolean = false): MatDialogRef<InternalErrorDialogComponent> | null {
    if (!this.isDialogOpen()) return this.matDialog.open(InternalErrorDialogComponent);

    return null;
  }

  public openUriNotFoundErrorDialog(stackable: boolean = false): MatDialogRef<BasicDialogComponent> | null {
    return this.openErrorDialog(
      'The uri you are trying to reach could not be found',
      'Please try again or contact us.',
      undefined,
      stackable
    );
  }

  public openServiceUnavailableErrorDialog(stackable: boolean = false): MatDialogRef<BasicDialogComponent> | null {
    return this.openErrorDialog(
      'Could not make a connection',
      'Please try again or contact us.',
      undefined,
      stackable
    );
  }

  public openDartsUsedDialog(checkout: X01Checkout | null): MatDialogRef<NumberSelectionDialogComponent> {
    const minDarts = checkout?.minDarts ?? 1;
    const maxDarts = 3;
    const dartsUsedOptions: number[] = [];
    for (let i = minDarts; i <= maxDarts; i++) {
      dartsUsedOptions.push(i);
    }
    const dialogData: NumberSelectionDialogData = {title: 'Darts Used', options: dartsUsedOptions};

    return this.matDialog.open(NumberSelectionDialogComponent, {data: dialogData});
  }

  public openDoublesMissedDialog(): MatDialogRef<NumberSelectionDialogComponent> {
    const dialogData: NumberSelectionDialogData = {title: 'Doubles Missed', options: [0, 1, 2, 3]};

    return this.matDialog.open(NumberSelectionDialogComponent, {data: dialogData});
  }

  private isDialogOpen(): boolean {
    return !!this.matDialog.openDialogs?.length;
  }

}
