import {Component, inject} from '@angular/core';
import {BaseComponent} from '../base/base.component';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {
  isLocalX01SettingsDialogData,
  LocalX01SettingsDialogData,
  LocalX01SettingsDialogResult
} from './local-x01-settings-dialog.types';
import {MatButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-local-x01-settings-dialog',
  imports: [
    MatDialogContent,
    MatButton,
    MatDialogActions,
    MatDialogTitle,
    MatCheckbox,
    ReactiveFormsModule
  ],
  standalone: true,
  templateUrl: './local-x01-settings-dialog.component.html',
  styleUrl: './local-x01-settings-dialog.component.scss'
})
export class LocalX01SettingsDialogComponent extends BaseComponent {

  dialogData: LocalX01SettingsDialogData = inject<LocalX01SettingsDialogData>(MAT_DIALOG_DATA);
  form!: FormGroup<{
    scoreFor: FormGroup<{ [key: string]: FormControl<boolean> }>;
  }>;

  private dialogRef = inject(MatDialogRef<LocalX01SettingsDialogComponent>);
  private formBuilder = inject(FormBuilder);

  constructor() {
    super();
    if (!isLocalX01SettingsDialogData(this.dialogData)) throw Error('Local X01 Settings Dialog Data Missing.');
    this.buildForm();
  }

  /**
   * Builds up the form, creating a checkbox for each match player. When no settings provided all players are checked.
   * Otherwise, only the players in the `scoreFor` array are checked.
   */
  private buildForm() {
    const scoreForControls: { [playerId: string]: FormControl<boolean> } = {};
    this.dialogData.players.forEach(player => {
      const isSelected = this.dialogData.localX01SettingsRecord.scoreFor == null
        ? true
        : this.dialogData.localX01SettingsRecord.scoreFor.includes(player.playerId);

      scoreForControls[player.playerId] = this.formBuilder.nonNullable.control(isSelected);
    });

    this.form = this.formBuilder.group({
      scoreFor: this.formBuilder.group(scoreForControls)
    });
  }

  /**
   * Gets the id's of all players that are checked. When all players are selected `scoreFor` is set to undefined.
   * Creates a `LocalX01SettingsDialogResult` and closes the dialog with the result.
   */
  submitDialog() {
    const selectedPlayers = Object.entries(this.form.getRawValue().scoreFor)
      .filter(([playerId, checked]) => checked)
      .map(([playerId, checked]) => playerId);

    const scoreForResult: string[] | undefined = selectedPlayers.length === this.dialogData.players.length
      ? undefined
      : selectedPlayers;

    const dialogResult: LocalX01SettingsDialogResult = {
      matchId: this.dialogData.localX01SettingsRecord?.matchId,
      scoreFor: scoreForResult
    };

    this.dialogRef.close(dialogResult);
  }

  /**
   * Cancel the dialog.
   */
  cancelDialog() {
    this.dialogRef.close();
  }
}
