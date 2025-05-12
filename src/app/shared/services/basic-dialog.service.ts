import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {BasicDialogData} from '../components/basic-dialog/basic-dialog-data';
import {BasicDialogComponent} from '../components/basic-dialog/basic-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class BasicDialogService {
  public constructor(private matDialog: MatDialog) {
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

  public openInternalErrorDialog(stackable: boolean = false): MatDialogRef<BasicDialogComponent> | null {
    return this.openErrorDialog(
      'Error',
      'Something went wrong on our end',
      'Please try again or contact us.',
      stackable
    );
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

  private isDialogOpen(): boolean {
    return !!this.matDialog.openDialogs?.length;
  }

}
