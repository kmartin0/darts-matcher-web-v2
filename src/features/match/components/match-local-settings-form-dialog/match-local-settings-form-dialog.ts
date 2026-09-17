import {Component, inject, signal} from '@angular/core';
import {form, FormField} from '@angular/forms/signals';
import {MatButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {LocalMatchSettings} from '../../../../data/model/settings/local-match-settings';
import {DialogResult} from '../../../../shared/types/dialog-result';
import {MatchLocalSettingsFormDialogData} from './match-local-settings-form-dialog-data';
import * as MatchLocalSettingsFormDialogModel from './match-local-settings-form-dialog.model';
import {MATCH_LOCAL_SETTING_FORM_DIALOG_SCHEMA} from './match-local-settings-form-dialog.schema';

@Component({
  selector: 'app-match-local-settings-form-dialog',
  imports: [
    FormField,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatCheckbox
  ],
  templateUrl: './match-local-settings-form-dialog.html',
  styleUrl: './match-local-settings-form-dialog.scss'
})
export class MatchLocalSettingsFormDialog {
  protected readonly dialogData = inject<MatchLocalSettingsFormDialogData>(MAT_DIALOG_DATA);

  private readonly dialogRef = inject<MatDialogRef<MatchLocalSettingsFormDialog, DialogResult<LocalMatchSettings>>>(MatDialogRef);

  private readonly formModel = signal<MatchLocalSettingsFormDialogModel.FormModel>(
    MatchLocalSettingsFormDialogModel.createInitialFormModel(
      this.dialogData.players,
      this.dialogData.localMatchSettings
    )
  );

  protected readonly matchLocalSettingsForm = form(
    this.formModel, MATCH_LOCAL_SETTING_FORM_DIALOG_SCHEMA
  );

  protected readonly dismissedResult: DialogResult<LocalMatchSettings> = {status: 'dismissed'};

  /**
   * Submits the selected players and closes the dialog with the updated settings.
   */
  protected onSubmit(): void {
    const scoreForPlayerIds = this.formModel().playerSelections
      .filter(playerSelection => playerSelection.selected)
      .map(playerSelection => playerSelection.playerId);

    this.dialogRef.close({
      status: 'confirmed',
      value: {
        ...this.dialogData.localMatchSettings,
        scoreForPlayerIds: scoreForPlayerIds
      }
    });
  }
}
