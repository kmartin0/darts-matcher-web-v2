import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {BaseFormComponent} from '../../../../shared/components/base-form/base-form.component';
import {AbstractControl, FormArray, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatLabel, MatPrefix} from '@angular/material/form-field';
import {NgForOf} from '@angular/common';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatFormField, MatInput} from '@angular/material/input';
import {BestOfType} from '../../../../models/common/best-of-type';
import {PlayerType} from '../../../../models/basematch/player-type';
import {BestOfGroup, MatchForm, MatchFormResult, PlayerGroup} from './match-form';
import {startWith, Subscription} from 'rxjs';
import {ApiErrorBody} from '../../../../api/error/api-error-body';
import {FormErrorComponent} from '../../../../shared/components/form-error/form-error.component';
import {MatchFormFactory} from './match-form.factory';
import {TargetErrors} from '../../../../api/error/target-errors';
import {ErrorMessageUtil} from '../../../../shared/utils/validator-error-message.utils';

@Component({
  selector: 'app-match-form',
  imports: [
    MatRadioGroup,
    MatRadioButton,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatSlideToggle,
    MatCard,
    MatCardContent,
    MatIcon,
    MatTooltip,
    CdkDropList,
    NgForOf,
    CdkDrag,
    MatButton,
    MatPrefix,
    MatIconButton,
    CdkDragHandle,
    FormErrorComponent
  ],
  templateUrl: './match-form.component.html',
  styleUrl: './match-form.component.scss',
  standalone: true
})
export class MatchFormComponent extends BaseFormComponent<MatchFormResult> implements OnInit, OnDestroy {

  private playerSubscriptions = new Map<FormGroup<PlayerGroup>, Subscription>();
  private bestOfSubscription = new Subscription();

  protected readonly PlayerType = PlayerType;
  protected readonly BestOfType = BestOfType;

  matchForm!: FormGroup<MatchForm>;

  constructor(errorMessageUtil: ErrorMessageUtil, public matchFormFactory: MatchFormFactory) {
    super(errorMessageUtil);
    this.initMatchForm();
  }

  /**
   * Create a new form group and initialize the match form with it. Afterward add an empty player to the form.
   */
  private initMatchForm() {
    this.matchForm = this.matchFormFactory.createMatchFormGroup();
    this.addPlayer();
  }

  /**
   * Lifecycle hook that is called after the component's view has been initialized.
   * Subscribes to changes in the "bestOf.type" control to update form behavior.
   */
  ngOnInit() {
    this.subscribeBestOfListener();
  }

  /**
   * Lifecycle hook that is called when the component is about to be destroyed.
   * Unsubscribes from all active subscriptions.
   */
  ngOnDestroy() {
    this.playerSubscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });

    this.bestOfSubscription.unsubscribe();
  }

  /**
   * @returns FormGroup<MatchForm> the match form.
   */
  get form(): FormGroup<MatchForm> {
    return this.matchForm;
  }

  /**
   * @returns FormArray<FormGroup<PlayerGroup>> the players array containing a form group for each player from the match form.
   */
  get playersFormArray(): FormArray<FormGroup<PlayerGroup>> {
    return this.form.controls.players;
  }

  /**
   * @returns FormGroup<BestOfGroup> the best of form group from the match form.
   */
  get bestOfFormGroup(): FormGroup<BestOfGroup> {
    return this.form.controls.bestOf;
  }

  /**
   * @returns boolean - true when the maximum number of players has been reached, otherwise false.
   */
  isMaxPlayersReached(): boolean {
    return this.playersFormArray.getRawValue().length >= this.matchFormFactory.maxPlayerSize;
  }

  /**
   * @returns boolean - true when the minimum number of players has been reached, otherwise false.
   */
  isMinPlayersReached(): boolean {
    return this.playersFormArray.getRawValue().length <= this.matchFormFactory.minPlayerSize;
  }

  /**
   * Creates a new form group for a player and adds it to the players form array in the match form.
   */
  addPlayer() {
    const playerGroup = this.matchFormFactory.createPlayerFormGroup();
    this.subscribePlayerTypeChanges(playerGroup);
    this.playersFormArray.push(playerGroup);
  }

  /**
   * Removes a player from the players form array and unsubscribes the associated subscriptions.
   *
   * @param index - the index of player from the players form array to be removed.
   */
  removePlayer(index: number) {
    if (this.playersFormArray.length > 1) {
      const playerGroup = this.playersFormArray.at(index);
      this.playerSubscriptions.get(playerGroup)?.unsubscribe();
      this.playerSubscriptions.delete(playerGroup);
      this.playersFormArray.removeAt(index);
    }
  }

  /**
   * Handles the event when a player card is dropped and reorders the players in the form array.
   *
   * @param event - The `CdkDragDrop` event containing details of the drag and drop action.
   */
  onDropPlayerCard(event: CdkDragDrop<any>) {
    moveItemInArray(this.playersFormArray.controls, event.previousIndex, event.currentIndex);
  }

  /**
   * Resets the form, removing all players except for one, and cleaning up their subscriptions.
   * @param value – the new value for the form.
   */
  override resetForm(value?: any) {
    super.resetForm(value);

    // Reset the players array to one player.
    while (this.playersFormArray.length > 1) {
      const playerGroup = this.playersFormArray.at(0);
      this.playerSubscriptions.get(playerGroup)?.unsubscribe();
      this.playerSubscriptions.delete(playerGroup);
      this.playersFormArray.removeAt(0);
    }
  }

  /**
   * Add each invalid argument to the appropriate form control.
   *
   * @param apiError - The error response object returned from the API.
   */
  override handleInvalidArguments(apiError?: ApiErrorBody) {
    super.handleInvalidArguments(apiError);
    if (!apiError || !apiError.details) return;

    // Loop over the api errors. For each error use the error map to set the error to the appropriate control.
    const apiTargetErrors: TargetErrors = apiError?.details;
    Object.keys(apiTargetErrors).forEach(apiTargetKey => {
      const errorMsg = apiTargetErrors[apiTargetKey];
      const control = this.findControlForApiField(apiTargetKey);

      if (errorMsg) this.setError(control, errorMsg);
    })
  }

  /**
   * Matches api field errors to the correct control.
   *
   * @param apiTargetKey - The api field key from the error details object.
   */
  private findControlForApiField(apiTargetKey: string): AbstractControl | null {
    // Mapping the static api field keys to the form controls
    const errorMap: { [apiKey: string]: AbstractControl } = {
      'matchSettings.x01': this.form.controls.x01,
      'matchSettings.bestOf.legs': this.bestOfFormGroup.controls.legs,
      'matchSettings.bestOf.sets': this.bestOfFormGroup.controls.sets,
      'matchSettings.trackDoubles': this.form.controls.trackDoubles,
    };

    // Try finding the control using the static error map first.
    let control: AbstractControl | null = errorMap[apiTargetKey]

    // If the key doesn't match any of the static fields, try mapping to player array items.
    const playersPrefix = 'players[';
    if (!control && apiTargetKey.startsWith(playersPrefix)) {
      const playerErrorMap = (index: number): { [key: string]: AbstractControl | null } => {
        const playerGroup = this.playersFormArray.at(index);
        return {
          [`players[${index}].avg`]: playerGroup?.controls.avg,
          [`players[${index}].playerName`]: playerGroup?.controls.name,
        };
      };
      const index = Number(apiTargetKey.slice(playersPrefix.length, apiTargetKey.indexOf(']')));
      control = playerErrorMap(index)?.[apiTargetKey];
    }

    // return the control (or null if it could not be found)
    return control;
  }

  /**
   * Subscribes to changes in the best of setting.
   *
   * Whenever "LEGS" is selected, the "sets" control is disabled and set to 1 set.
   * Whenever "SETS" is selected, the "sets" control is enabled.
   */
  private subscribeBestOfListener() {
    const bestOfControl = this.form.controls.bestOf.controls;
    const bestOfTypeChange$ = bestOfControl.type.valueChanges.pipe(
      startWith(bestOfControl.type.value)
    );

    const subscription = bestOfTypeChange$.subscribe(bestOfType => {
      switch (bestOfType) {
        case BestOfType.LEGS: { // When best of type legs, disable sets control and set the match to 1 set.
          bestOfControl.sets.setValue(1);
          bestOfControl.sets.disable();
          break;
        }
        case BestOfType.SETS: // When best of type sets, enable sets control.
        default: {
          bestOfControl.sets.enable();
        }
      }
    });

    this.bestOfSubscription.add(subscription);
  }

  /**
   * Subscribes to changes in a player form group.
   *
   * Whenever the player type "HUMAN" is selected, the "avg" control is disabled, reset and cleared of its validators.
   * Whenever the player type "DART_BOT" is selected, the "avg" control is enabled and validators are set.
   */
  private subscribePlayerTypeChanges(playerGroup: FormGroup<PlayerGroup>) {
    const playerTypeChange$ = playerGroup.controls.type.valueChanges.pipe(
      startWith(playerGroup.getRawValue().type)
    );

    const avgControl = playerGroup.controls.avg;
    const subscription = playerTypeChange$.subscribe(playerType => {
      switch (playerType) {
        case PlayerType.DART_BOT: { // When player type dart bot; enable the control and add validators to it.
          avgControl.enable();
          avgControl.setValidators(this.matchFormFactory.createBotValidators());
          break;
        }
        case PlayerType.HUMAN: { // When player type human; disable, reset and clear the validators of the avg control.
          avgControl.setValue(null);
          avgControl.disable();
          avgControl.clearValidators();
        }
      }
    });

    this.playerSubscriptions.set(playerGroup, subscription);
  }
}
