import {ComponentType} from '@angular/cdk/portal';
import {inject, Injectable} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {firstValueFrom} from 'rxjs';
import {DialogResult} from '../types/dialog-result';

@Injectable({providedIn: 'root'})
export class DialogManagerService {
  private readonly matDialog = inject(MatDialog);

  /**
   * Opens a dialog for the specified component and resolves its result.
   *
   * Material dialog dismissals that do not provide an explicit result, such as
   * backdrop clicks or Escape, are normalized to a dismissed dialog result.
   * Opening can also resolve as dismissed when prevented by stacking rules.
   *
   * @param component - Component to render inside the dialog.
   * @param config - Optional dialog configuration.
   * @param stackable - Whether the dialog can be opened while another dialog is already open.
   * @returns Result of the dialog.
   */
  async open<Component, Data = unknown, Value = unknown>(
    component: ComponentType<Component>,
    config?: MatDialogConfig<Data>,
    stackable: boolean = true
  ): Promise<DialogResult<Value>> {
    // Prevent opening a non-stackable dialog while another dialog is already open.
    if (!stackable && this.isDialogOpen()) {
      return {
        status: 'dismissed'
      };
    }

    // Open the dialog while preserving the existing focus restoration behavior.
    const dialogRef = this.matDialog.open<Component, Data, DialogResult<Value>>(
      component,
      {...config, restoreFocus: false}
    );

    // Keep dialog keydown from reaching listeners on the window.
    dialogRef.keydownEvents().subscribe(event => event.stopPropagation());

    // Normalize Material dismissals, which close without an explicit result.
    return await firstValueFrom(dialogRef.afterClosed()) ?? {
      status: 'dismissed'
    };
  }

  /**
   * Checks whether a dialog is currently open.
   *
   * @returns Whether a dialog is currently open.
   */
  private isDialogOpen(): boolean {
    return this.matDialog.openDialogs.length > 0;
  }
}
