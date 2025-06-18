import {Component, Inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';

export interface X01MatchActionsDialogData {
  matchId: string;
}

export interface X01MatchActionsDialogResult {
  matchId: string;
  action: X01MatchDialogAction;
}

export enum X01MatchDialogAction {
  DELETE_MATCH = 'DELETE_MATCH', RESET_MATCH = 'RESET_MATCH'
}

@Component({
  selector: 'app-x01-match-dialog-actions',
  imports: [
    FormsModule,
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatIcon
  ],
  standalone: true,
  templateUrl: './x01-match-actions-dialog.component.html',
  styleUrl: './x01-match-actions-dialog.component.scss'
})
export class X01MatchActionsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: X01MatchActionsDialogData,
              private dialogRef: MatDialogRef<X01MatchActionsDialogComponent>,) {
    if (!dialogData) throw Error('Match Actions Dialog Data Missing.');
  }

  /**
   * Closes the dialog and returns a result indicating the user chose to delete the match.
   *
   * The result includes the match ID and the action type `DELETE_MATCH`.
   */
  submitDeleteMatch() {
    const deleteMatchResult: X01MatchActionsDialogResult = {
      matchId: this.dialogData.matchId,
      action: X01MatchDialogAction.DELETE_MATCH
    };

    this.dialogRef.close(deleteMatchResult);
  }

  /**
   * Closes the dialog and returns a result indicating the user chose to reset the match.
   *
   * The result includes the match ID and the action type `RESET_MATCH`.
   */
  submitResetMatch() {
    const resetMatchResult: X01MatchActionsDialogResult = {
      matchId: this.dialogData.matchId,
      action: X01MatchDialogAction.RESET_MATCH
    };

    this.dialogRef.close(resetMatchResult);
  }

  /**
   * Cancels the dialog and returns `undefined`.
   */
  cancelDialog() {
    this.dialogRef.close(undefined);
  }

}
