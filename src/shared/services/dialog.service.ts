import {ComponentType} from '@angular/cdk/portal';
import {inject, Injectable} from '@angular/core';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';

@Injectable({providedIn: 'root'})
export class DialogService {
  private readonly matDialog = inject(MatDialog);

  /**
   * Opens a dialog for the specified component.
   *
   * @param component - Component to render inside the dialog.
   * @param config - Optional dialog configuration.
   * @param stackable - Whether the dialog can be opened while another dialog is already open.
   * @returns Reference to the opened dialog, or null when prevented by stacking rules.
   */
  open<Component, Data = unknown, Result = unknown>(
    component: ComponentType<Component>,
    config?: MatDialogConfig<Data>,
    stackable: boolean = true
  ): MatDialogRef<Component, Result> | null {
    if (!stackable && this.isDialogOpen()) {
      return null;
    }

    return this.matDialog.open<Component, Data, Result>(component, {
      ...config,
      restoreFocus: false
    });
  }

  /**
   * @returns Whether a dialog is currently open.
   */
  private isDialogOpen(): boolean {
    return this.matDialog.openDialogs.length > 0;
  }
}
