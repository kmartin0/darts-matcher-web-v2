import {Component, DestroyRef, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatInput} from '@angular/material/input';
import {MatLabel} from '@angular/material/form-field';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {FormErrorComponent} from '../form-error/form-error.component';
import {
  isX01EditScoreDialogData,
  X01EditScoreDialogData,
  X01EditScoreDialogResult
} from './x01-edit-score-dialog.types';
import {KeydownEventDispatcherService} from '../../services/keydown-event-dispatcher/keydown-event-dispatcher.service';
import {BaseComponent} from '../base/base.component';
import {NgIf} from '@angular/common';
import {CustomValidators} from '../../validators/custom-validators';

@Component({
  selector: 'app-x01-edit-score-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatButton,
    MatDialogActions,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    FormErrorComponent,
    NgIf
  ],
  standalone: true,
  templateUrl: './x01-edit-score-dialog.component.html',
  styleUrl: './x01-edit-score-dialog.component.scss'
})
export class X01EditScoreDialogComponent extends BaseComponent {

  scoreFormControl = new FormControl<string | undefined>(undefined, {
    validators: [Validators.required, CustomValidators.isNumber, Validators.min(0), Validators.max(180)]
  });

  doublesMissedFormControl = new FormControl<string | undefined>(undefined, {
    validators: [Validators.required, CustomValidators.isNumber, Validators.min(0), Validators.max(3)]
  });

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: X01EditScoreDialogData,
              private dialogRef: MatDialogRef<X01EditScoreDialogComponent>,
              private keydownDispatcherService: KeydownEventDispatcherService,
              private destroyRef: DestroyRef) {
    if (!isX01EditScoreDialogData(dialogData)) throw Error('X01 Edit Score Dialog Data Missing.');
    super();
    this.scoreFormControl.setValue(dialogData.currentScore.toString());
    this.doublesMissedFormControl.setValue(dialogData.doublesMissed?.toString());
    this.initEnterKeyListener();
  }

  initEnterKeyListener() {
    const keyDownSub = this.keydownDispatcherService.getKeyDownObservable(this.destroyRef, this.dialogRef).subscribe(event => {
      if (event.key === 'Enter') this.submitDialog();
    });
    this.subscription.add(keyDownSub);
  }

  submitDialog() {
    if (!this.isFormValid()) return;

    const result: X01EditScoreDialogResult = {
      playerId: this.dialogData.playerId,
      matchId: this.dialogData.matchId,
      set: this.dialogData.set,
      leg: this.dialogData.leg,
      round: this.dialogData.round,
      oldScore: this.dialogData.currentScore,
      newScore: Number(this.scoreFormControl.value) || 0,
      oldDoublesMissed: this.dialogData.doublesMissed,
      newDoublesMissed: Number(this.doublesMissedFormControl.value) || 0
    };
    this.dialogRef.close(result);
  }

  cancelDialog() {
    this.dialogRef.close();
  }

  private isFormValid(): boolean {
    const scoreValid = this.scoreFormControl.valid;
    const doublesMissedValid = this.dialogData.doublesMissed == null || this.doublesMissedFormControl.valid;

    return scoreValid && doublesMissedValid;
  }

}
