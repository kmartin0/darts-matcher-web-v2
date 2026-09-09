import {Component, computed, input} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {FormField, FormRoot} from '@angular/forms/signals';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatFormField, MatInput, MatLabel, MatPrefix} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatTooltip} from '@angular/material/tooltip';
import {PlayerType} from '../../../../data/model/base-match/player-type';
import {X01BestOfType} from '../../../../data/model/x01/rules/x01-best-of-type';
import {FormError} from '../../../../shared/components/form-error/form-error';
import {createSubmittingForm} from '../../../../shared/forms/submitting-form.factory';
import * as CreateMatchFormErrorResolver from './create-match-form-error.resolver';
import * as CreateMatchFormModel from './create-match-form.model';
import {CREATE_MATCH_FORM_SCHEMA, MAX_PLAYERS, MIN_PLAYERS} from './create-match-form.schema';

@Component({
  selector: 'app-create-match-form',
  imports: [
    MatRadioGroup,
    FormError,
    MatRadioButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatCheckbox,
    MatIcon,
    MatIconButton,
    CdkDragHandle,
    CdkDropList,
    MatCard,
    MatCardContent,
    CdkDrag,
    MatTooltip,
    MatButton,
    MatPrefix,
    FormRoot,
    FormField
  ],
  templateUrl: './create-match-form.html',
  styleUrl: './create-match-form.scss',
})
export class CreateMatchForm {
  readonly submitAction = input.required<CreateMatchFormModel.SubmitAction>();

  private readonly submittingForm = createSubmittingForm({
    createInitialModel: CreateMatchFormModel.createInitialFormModel,
    schema: CREATE_MATCH_FORM_SCHEMA,
    submitAction: this.submitAction,
    formErrorTargetResolver: CreateMatchFormErrorResolver.resolveTargetFieldTree,
  });

  protected readonly matchForm = this.submittingForm.form;
  private readonly formModel = this.submittingForm.formModel;

  protected readonly x01Options = CreateMatchFormModel.X01_OPTIONS;
  protected readonly BestOfType = X01BestOfType;
  protected readonly ClearByTwoType = CreateMatchFormModel.ClearByTwoType;
  protected readonly PlayerType = PlayerType;

  protected readonly isMaxPlayersReached = computed<boolean>(() =>
    this.formModel().players.length >= MAX_PLAYERS
  );

  protected readonly isMinPlayersReached = computed<boolean>(() =>
    this.formModel().players.length <= MIN_PLAYERS
  );

  protected readonly hasBotPlayer = computed<boolean>(() =>
    this.formModel().players.some(player => player.playerType === PlayerType.DART_BOT)
  );

  /**
   * Adds a new player when the maximum player count has not been reached.
   */
  protected addPlayer(): void {
    if (this.isMaxPlayersReached()) {
      return;
    }

    this.formModel.update(model => ({
      ...model,
      players: [...model.players, CreateMatchFormModel.createEmptyPlayer()],
    }));
  }

  /**
   * Removes the player at the given index when the minimum player count allows it.
   *
   * @param index - Index of the player to remove.
   */
  protected removePlayer(index: number): void {
    if (
      this.isMinPlayersReached() ||
      index < 0 ||
      index >= this.formModel().players.length
    ) {
      return;
    }

    this.formModel.update(model => ({
      ...model,
      players: model.players.filter((_, playerIndex) => playerIndex !== index),
    }));
  }

  /**
   * Reorders the players according to a drag-and-drop event.
   *
   * @param event - Drag-and-drop event containing the previous and new player indexes.
   */
  protected onDropPlayerCard(event: CdkDragDrop<CreateMatchFormModel.PlayerFormModel[]>): void {
    this.formModel.update(model => {
      const players = [...model.players];

      moveItemInArray(players, event.previousIndex, event.currentIndex);

      return {...model, players: players};
    });
  }

  /**
   * Handles a change to a player's type.
   *
   * @param index - Index of the player being changed.
   * @param playerType - Newly selected player type.
   */
  protected onPlayerTypeChange(index: number, playerType: PlayerType): void {
    if (index < 0 || index >= this.formModel().players.length) {
      return;
    }

    switch (playerType) {
      case PlayerType.HUMAN:
        this.matchForm.players[index].threeDartAverage().value.set(null);
        break;

      case PlayerType.DART_BOT:
        break;
    }

    // Workaround for https://github.com/angular/angular/issues/69677:
    // binding the radio group with [value] requires updating the field manually after drag and drop.
    const player = this.matchForm.players[index];
    player.playerType().value.set(playerType);
    player.playerType().markAsDirty();
  }

  /**
   * Handles a change to the best-of type and resets settings that are not applicable to the new type.
   *
   * @param bestOfType - Newly selected best-of type.
   */
  protected onBestOfTypeChange(bestOfType: X01BestOfType): void {
    switch (bestOfType) {
      case X01BestOfType.SETS:
        break;

      case X01BestOfType.LEGS:
        this.matchForm.bestOf.sets().value.set(1);

        this.matchForm.clearByTwo.selectedTypes().value.update(
          selectedTypes => selectedTypes.filter(
            type => type === CreateMatchFormModel.ClearByTwoType.LEGS
          ),
        );

        this.matchForm.clearByTwo.setLimit().value.set(0);
        this.matchForm.clearByTwo.finalSetLegLimit().value.set(0);
        break;
    }
  }

  /**
   * Handles enabling or disabling a clear-by-two rule and updates its corresponding limit.
   *
   * @param type - Clear-by-two rule being changed.
   * @param enabled - Whether the rule is enabled.
   */
  protected onClearByTwoTypeChange(type: CreateMatchFormModel.ClearByTwoType, enabled: boolean): void {
    switch (type) {
      case CreateMatchFormModel.ClearByTwoType.SETS:
        this.matchForm.clearByTwo.setLimit().value.set(enabled ? 1 : 0);
        break;

      case CreateMatchFormModel.ClearByTwoType.LEGS:
        this.matchForm.clearByTwo.legLimit().value.set(enabled ? 1 : 0);
        break;

      case CreateMatchFormModel.ClearByTwoType.LEGS_FINAL_SET:
        this.matchForm.clearByTwo.finalSetLegLimit().value.set(enabled ? 1 : 0);
        break;
    }
  }

  /**
   * Gets the Material icon for a player type.
   *
   * @param playerType - Player type to get the icon for.
   * @returns Material icon name for the player type.
   */
  protected getPlayerIcon(playerType: PlayerType): string {
    switch (playerType) {
      case PlayerType.HUMAN:
        return 'account_circle';

      case PlayerType.DART_BOT:
        return 'smart_toy';
    }
  }

  /**
   * Gets the tooltip for a player type.
   *
   * @param playerType - Player type to get the tooltip for.
   * @returns Tooltip text for the player type.
   */
  protected getPlayerTooltip(playerType: PlayerType): string {
    switch (playerType) {
      case PlayerType.HUMAN:
        return 'Human Player';

      case PlayerType.DART_BOT:
        return 'Dart Bot';
    }
  }
}
