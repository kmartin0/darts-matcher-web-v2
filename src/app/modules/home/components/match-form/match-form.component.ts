import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {BaseFormComponent} from '../../../../shared/components/base-form/base-form.component';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatError, MatLabel, MatPrefix} from '@angular/material/form-field';
import {NgForOf} from '@angular/common';
import {CustomValidators} from '../../../../shared/validators/custom-validators';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatFormField, MatInput} from '@angular/material/input'
import {BestOfType} from '../../../../models/best-of-type';
import {PlayerType} from '../../../../models/player-type';
import {BestOfGroup, MatchForm, MatchFormResult, PlayerGroup} from './match-form';
import {startWith, Subscription} from 'rxjs';
import {MatFormErrorDirective} from '../../../../shared/directives/mat-form-error-directive/mat-form-error.directive';

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
    MatFormErrorDirective,
    MatError
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
  protected readonly x01Options = [301, 501];
  protected readonly minPlayerSize = 1;
  protected readonly maxPlayerSize = 4;

  matchForm = this.fb.nonNullable.group<MatchForm>({
    x01: this.fb.nonNullable.control(501, [Validators.min(101), Validators.max(1001), Validators.required]),
    bestOf: this.fb.nonNullable.group({
      type: this.fb.nonNullable.control(BestOfType.SETS, [Validators.required]),
      sets: this.fb.nonNullable.control(1, [Validators.min(1), Validators.required]),
      legs: this.fb.nonNullable.control(1, [Validators.min(1), Validators.required])
    }),
    trackCheckouts: this.fb.nonNullable.control(false, Validators.required),
    players: this.fb.nonNullable.array([this.createPlayerFormGroup()], [CustomValidators.minLengthArray(this.minPlayerSize, "player(s)"), CustomValidators.maxLengthArray(this.maxPlayerSize, "player(s)")])
  });

  constructor(fb: FormBuilder) {
    super(fb);
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
   * Subscribes to changes in the best of setting.
   *
   * Whenever "LEGS" is selected, the "sets" control is disabled and set to 1 set.
   * Whenever "SETS" is selected, the "sets" control is enabled.
   */
  subscribeBestOfListener() {
    const bestOfControl = this.form.controls.bestOf.controls;
    const bestOfTypeChange$ = bestOfControl.type.valueChanges.pipe(
      startWith(bestOfControl.type.value)
    );

    const subscription = bestOfTypeChange$.subscribe(bestOfType => {
      switch (bestOfType) {
        case BestOfType.LEGS: {
          bestOfControl.sets.setValue(1);
          bestOfControl.sets.disable();
          break;
        }
        case BestOfType.SETS:
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
  subscribePlayerTypeChanges(playerGroup: FormGroup<PlayerGroup>) {
    const playerTypeChange$ = playerGroup.controls.type.valueChanges.pipe(
      startWith(playerGroup.getRawValue().type)
    );

    const avgControl = playerGroup.controls.avg;
    const subscription = playerTypeChange$.subscribe(playerType => {
      switch (playerType) {
        case PlayerType.DART_BOT: {
          avgControl.enable();
          avgControl.setValidators([Validators.required, Validators.min(1), Validators.max(180)]);
          break;
        }
        case PlayerType.HUMAN: {
          avgControl.setValue(null);
          avgControl.disable();
          avgControl.clearValidators();
        }
      }
    });
    this.playerSubscriptions.set(playerGroup, subscription);
  }

  /**
   * @returns boolean - true when the maximum number of players has been reached, otherwise false.
   */
  isMaxPlayersReached(): boolean {
    return this.playersFormArray.getRawValue().length >= this.maxPlayerSize;
  }

  /**
   * @returns boolean - true when the minimum number of players has been reached, otherwise false.
   */
  isMinPlayersReached(): boolean {
    return this.playersFormArray.getRawValue().length <= this.minPlayerSize;
  }

  /**
   * @returns FormGroup<PlayerGroup> a new player form group the validators for each control.
   */
  createPlayerFormGroup(): FormGroup<PlayerGroup> {
    const playerGroup: FormGroup<PlayerGroup> = this.fb.nonNullable.group({
      name: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(4), Validators.maxLength(18)]),
      type: this.fb.nonNullable.control(PlayerType.HUMAN, Validators.required),
      avg: this.fb.control<number | null>(null)
    });

    this.subscribePlayerTypeChanges(playerGroup);

    return playerGroup;
  }

  /**
   * Creates a new form group for a player and adds it to the players form array in the match form.
   */
  addPlayer() {
    const playerGroup = this.createPlayerFormGroup();
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
}
