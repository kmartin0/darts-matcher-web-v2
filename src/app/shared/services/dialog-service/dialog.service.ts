import {inject, Injectable} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';
import {TextDialogData} from '../../components/text-dialog/text-dialog-data';
import {TextDialogComponent} from '../../components/text-dialog/text-dialog.component';
import {InternalErrorDialogComponent} from '../../components/internal-error-dialog/internal-error-dialog.component';
import {X01Checkout} from '../../../models/x01-match/x01-checkout';
import {
  NumberSelectionDialogComponent,
  NumberSelectionDialogData
} from '../../components/number-selection-dialog/number-selection-dialog.component';
import {X01EditScoreDialogComponent,} from '../../components/x01-edit-score-dialog/x01-edit-score-dialog.component';
import {
  X01EditScoreDialogData,
  X01EditScoreDialogResult
} from '../../components/x01-edit-score-dialog/x01-edit-score-dialog.types';
import {ConfirmDialogComponent, ConfirmDialogData} from '../../components/confirm-dialog/confirm-dialog.component';
import {ComponentType} from '@angular/cdk/portal';
import {
  LocalX01SettingsDialogComponent
} from '../../components/local-x01-settings-dialog/local-x01-settings-dialog.component';
import {
  LocalX01SettingsDialogData,
  LocalX01SettingsDialogResult
} from '../../components/local-x01-settings-dialog/local-x01-settings-dialog.types';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private matDialog = inject(MatDialog);

  public openTextDialog(
    dialogData: TextDialogData,
    stackable: boolean = true
  ): MatDialogRef<TextDialogComponent> | null {
    return this._open(TextDialogComponent, {data: dialogData}, stackable);
  }

  public openErrorDialog(
    errorTitle?: string,
    errorSubtitle?: string,
    errorMsg?: string,
    stackable: boolean = false
  ): MatDialogRef<TextDialogComponent> | null {
    const dialogData: TextDialogData = {
      title: errorTitle,
      subtitle: errorSubtitle,
      contentText: errorMsg,
      matIcon: 'error',
      isCancelable: false
    };

    return this.openTextDialog(dialogData, stackable);
  }

  public openInternalErrorDialog(stackable: boolean = false): MatDialogRef<InternalErrorDialogComponent> | null {
    return this._open(InternalErrorDialogComponent, undefined, stackable);
  }

  public openUriNotFoundErrorDialog(stackable: boolean = false): MatDialogRef<TextDialogComponent> | null {
    return this.openErrorDialog(
      'Error',
      'The uri you are trying to reach could not be found',
      'Please try again or contact us.',
      stackable
    );
  }

  public openServiceUnavailableErrorDialog(stackable: boolean = false): MatDialogRef<TextDialogComponent> | null {
    return this.openErrorDialog(
      'Could not make a connection',
      'Please try again or contact us.',
      undefined,
      stackable
    );
  }

  public openDartsUsedDialog(
    checkout: X01Checkout | null,
    stackable: boolean = false
  ): MatDialogRef<NumberSelectionDialogComponent, number> | null {
    const minDarts = checkout?.minDarts ?? 1;
    const maxDarts = 3;
    const dartsUsedOptions: number[] = [];
    for (let i = minDarts; i <= maxDarts; i++) {
      dartsUsedOptions.push(i);
    }
    const dialogData: NumberSelectionDialogData = {title: 'Darts Used', options: dartsUsedOptions};

    return this._open(NumberSelectionDialogComponent, {data: dialogData}, stackable);
  }

  public openDoublesMissedDialog(
    stackable: boolean = false
  ): MatDialogRef<NumberSelectionDialogComponent, number> | null {
    const dialogData: NumberSelectionDialogData = {title: 'Doubles Missed', options: [0, 1, 2, 3]};
    return this._open(NumberSelectionDialogComponent, {data: dialogData}, stackable);
  }

  public openX01EditScoreDialog(
    dialogData: X01EditScoreDialogData,
    stackable: boolean = false
  ): MatDialogRef<X01EditScoreDialogComponent, X01EditScoreDialogResult> | null {
    return this._open(X01EditScoreDialogComponent, {data: dialogData}, stackable);
  }

  public openConfirmDialog(
    dialogData: ConfirmDialogData,
    stackable: boolean = false
  ): MatDialogRef<ConfirmDialogComponent, boolean> | null {
    return this._open(ConfirmDialogComponent, {data: dialogData}, stackable);
  }

  public openLocalX01SettingsDialog(
    dialogData: LocalX01SettingsDialogData,
    stackable: boolean = false
  ): MatDialogRef<LocalX01SettingsDialogComponent, LocalX01SettingsDialogResult> | null {
    return this._open(LocalX01SettingsDialogComponent, {data: dialogData}, stackable);
  }

  /**
   * Opens a dialog for the specified component with optional configuration.
   *
   * @template T - The dialog component type to open.
   * @template D - The type of the dialog data passed in the config.
   * @param component - The component to render inside the dialog.
   * @param config - Optional MatDialog configuration object.
   * @param stackable - If false, prevents opening a new dialog when one is already open.
   * @returns A MatDialogRef for the opened dialog, or null if not opened due to stacking rules.
   */
  private _open<T, D = any>(
    component: ComponentType<T>,
    config?: MatDialogConfig<D>,
    stackable: boolean = true
  ): MatDialogRef<T> | null {
    if (!stackable && this.isDialogOpen()) return null;
    return this.matDialog.open(component, {...config, restoreFocus: false, autoFocus: false});
  }

  private isDialogOpen(): boolean {
    return !!this.matDialog.openDialogs?.length;
  }

}
