import {inject, Injectable} from '@angular/core';
import {FormBuilder, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {MatchForm, PlayerGroup} from './match-form';
import {CustomValidators} from '../../../../shared/validators/custom-validators';
import {X01BestOfType} from '../../../../models/x01-match/x01-best-of-type';
import {PlayerType} from '../../../../models/basematch/player-type';
import {ClearByTwoType} from '../../../../models/common/clear-by-two-type';

@Injectable({providedIn: 'root'})
export class MatchFormFactory {
  private fb = inject(FormBuilder);

  readonly x01Options = [301, 501];
  readonly minX01 = 101;
  readonly maxX01 = 1001;
  readonly minPlayerSize = 1;
  readonly maxPlayerSize = 4;
  readonly minSets = 1;
  readonly minLegs = 1;
  readonly maxSets = 49;
  readonly maxLegs = 49;
  readonly minClearByTwoLimit = 0;
  readonly maxClearByTwoLimit = 20;
  readonly botMinAvg = 3;
  readonly botMaxAvg = 167;
  readonly playerNameMinLength = 3;
  readonly playerNameMaxLength = 30;

  /**
   * Creates and returns a form group of type MatchForm used for configuring a match.
   *
   * @return FormGroup<MatchForm> - A FormGroup<MatchForm> instance with validators for each control.
   */
  createMatchFormGroup(): FormGroup<MatchForm> {
    return this.fb.nonNullable.group<MatchForm>({
      x01: this.fb.nonNullable.control(this.x01Options[1], [Validators.min(this.minX01), Validators.max(this.maxX01), Validators.required]),
      bestOf: this.fb.nonNullable.group({
        type: this.fb.nonNullable.control(X01BestOfType.SETS, [Validators.required]),
        sets: this.fb.nonNullable.control(this.minSets, [Validators.min(this.minSets), Validators.max(this.maxSets), Validators.required]),
        legs: this.fb.nonNullable.control(this.minLegs, [Validators.min(this.minLegs), Validators.max(this.maxLegs), Validators.required])
      }),
      clearByTwo: this.fb.nonNullable.group({
        selectedTypes: this.fb.nonNullable.control<ClearByTwoType[]>([], []),
        extraSetLimit: this.fb.nonNullable.control(0, []),
        extraLegLimit: this.fb.nonNullable.control(0, []),
        extraLegLimitFinalSet: this.fb.nonNullable.control(0, []),
      }),
      trackDoubles: this.fb.nonNullable.control(false, [Validators.required]),
      players: this.fb.nonNullable.array<FormGroup<PlayerGroup>>([], [
        CustomValidators.minLengthArray(this.minPlayerSize, 'player(s)'),
        CustomValidators.maxLengthArray(this.maxPlayerSize, 'player(s)'),
        CustomValidators.singleBotPlayerValidator(),
        CustomValidators.requireHumanWithBotValidator()
      ])
    });
  }

  /**
   * Creates and returns a form group of type PlayerGroup used for configuring a match player.
   *
   * @return FormGroup<PlayerGroup> - A FormGroup<PlayerGroup> instance with validators for each control.
   */
  createPlayerFormGroup(): FormGroup<PlayerGroup> {
    return this.fb.nonNullable.group({
      name: this.fb.nonNullable.control('', [Validators.minLength(this.playerNameMinLength), Validators.maxLength(this.playerNameMaxLength), Validators.required]),
      type: this.fb.nonNullable.control(PlayerType.HUMAN, [Validators.required]),
      avg: this.fb.control<number | null>(null)
    });
  }

  /**
   * Creates an array of validators used for validating bot player averages.
   *
   * @returns ValidatorFn[] - An array of functions for validating the dart bot avg control.
   */
  createBotValidators(): ValidatorFn[] {
    return [Validators.required, Validators.min(this.botMinAvg), Validators.max(this.botMaxAvg)];
  }

  createClearByTwoLimitValidators(): ValidatorFn[] {
    return [Validators.required, Validators.min(this.minClearByTwoLimit), Validators.max(this.maxClearByTwoLimit)];
  }
}
