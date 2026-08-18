import {Component, input, output, signal} from '@angular/core';
import {PlayerType} from '../../../../data/model/match/player-type';
import {X01BestOfType} from '../../../../data/model/x01/x01-best-of-type';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {FormError} from '../../../../shared/components/form-error/form-error';
import {MatFormField, MatInput, MatLabel, MatPrefix} from '@angular/material/input';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {MatCheckbox} from '@angular/material/checkbox';
import {CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatTooltip} from '@angular/material/tooltip';
import {
  createEmptyPlayer,
  createInitialX01MatchFormModel,
  CreateX01MatchFormModel,
  X01ClearByTwoType,
  X01PlayerFormModel
} from './create-x01-match-form.model';
import {createX01MatchFormSchema, MAX_PLAYERS, MIN_PLAYERS} from './create-x01-match-form.schema';
import {form, FormField, FormRoot} from '@angular/forms/signals';

@Component({
  selector: 'app-create-x01-match-form',
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
  templateUrl: './create-x01-match-form.html',
  styleUrl: './create-x01-match-form.scss',
})
export class CreateX01MatchForm {
  readonly loading = input(false);
  readonly createMatch = output<CreateX01MatchFormModel>();

  protected readonly x01Options = [301, 501];
  protected readonly X01BestOfType = X01BestOfType;
  protected readonly X01ClearByTwoType = X01ClearByTwoType;
  protected readonly PlayerType = PlayerType;

  private readonly formModel =
    signal<CreateX01MatchFormModel>(createInitialX01MatchFormModel());

  protected readonly matchForm = form(this.formModel, createX01MatchFormSchema, {
      submission: {
        action: async field => {
          this.createMatch.emit(field().value());
        },
      },
    },
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
      players: [...model.players, createEmptyPlayer()],
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
  protected onDropPlayerCard(event: CdkDragDrop<X01PlayerFormModel[]>): void {
    this.formModel.update(model => {
      const players = [...model.players];

      moveItemInArray(players, event.previousIndex, event.currentIndex);

      return {...model, players};
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

    /*
     * Bug workaround: https://github.com/angular/angular/issues/69677
     * Due to a Signal Forms bug, the radio group can lose its visual checked state after drag and drop.
     * Workaround: Bind the radio group with [value] instead of [formField], so the field value must be updated manually.
     */
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
          selectedTypes => selectedTypes.filter(type => type === X01ClearByTwoType.LEGS),
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
  protected onClearByTwoTypeChange(type: X01ClearByTwoType, enabled: boolean): void {
    switch (type) {
      case X01ClearByTwoType.SETS:
        this.matchForm.clearByTwo.setLimit().value.set(enabled ? 1 : 0);
        break;

      case X01ClearByTwoType.LEGS:
        this.matchForm.clearByTwo.legLimit().value.set(enabled ? 1 : 0);
        break;

      case X01ClearByTwoType.LEGS_FINAL_SET:
        this.matchForm.clearByTwo.finalSetLegLimit().value.set(enabled ? 1 : 0);
        break;
    }
  }

  /**
   * @returns Whether the maximum player count has been reached.
   */
  protected isMaxPlayersReached(): boolean {
    return this.formModel().players.length >= MAX_PLAYERS;
  }

  /**
   * @returns Whether the minimum player count has been reached.
   */
  protected isMinPlayersReached(): boolean {
    return this.formModel().players.length <= MIN_PLAYERS;
  }

  /**
   * @returns Whether a dart bot player is present.
   */
  protected hasBotPlayer(): boolean {
    return this.formModel().players
      .some(player => player.playerType === PlayerType.DART_BOT);
  }

  /**
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
