import {Component, input, signal} from '@angular/core';
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
import * as CreateX01MatchFormModel from './create-x01-match-form.model';
import * as CreateX01MatchFormErrorMapper from './create-x01-match-form-error.mapper';
import {createX01MatchFormSchema, MAX_PLAYERS, MIN_PLAYERS} from './create-x01-match-form.schema';
import {FieldTree, form, FormField, FormOptions, FormRoot, TreeValidationResult} from '@angular/forms/signals';
import {mapFormSubmitErrors} from '../../../../shared/forms/form-submit';

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
  readonly submitAction = input.required<CreateX01MatchFormModel.SubmitAction>();

  private readonly matchFormModel = signal(CreateX01MatchFormModel.createInitialFormModel());

  protected readonly x01Options = CreateX01MatchFormModel.X01_OPTIONS;
  protected readonly X01BestOfType = X01BestOfType;
  protected readonly X01ClearByTwoType = CreateX01MatchFormModel.ClearByTwoType;
  protected readonly PlayerType = PlayerType;

  readonly matchForm = form(this.matchFormModel, createX01MatchFormSchema, this.createFormOptions());

  /**
   * Creates the Signal Forms options for the create X01 match form.
   *
   * @returns Form options containing the submission action.
   */
  private createFormOptions(): FormOptions<CreateX01MatchFormModel.FormModel> {
    return {
      submission: {
        action: fieldTree => this.submit(fieldTree),
      },
    };
  }

  /**
   * Submits the current form model and maps returned submission errors
   * to Signal Forms validation results.
   *
   * @param fieldTree - Root field tree of the create X01 match form.
   * @returns Signal Forms validation results for the submission.
   */
  private async submit(fieldTree: FieldTree<CreateX01MatchFormModel.FormModel>): Promise<TreeValidationResult> {
    const errors = await this.submitAction()(fieldTree().value());

    return mapFormSubmitErrors(
      fieldTree,
      errors,
      CreateX01MatchFormErrorMapper.mapErrorTargetToFieldTree,
    );
  }

  /**
   * Adds a new player when the maximum player count has not been reached.
   */
  protected addPlayer(): void {
    if (this.isMaxPlayersReached()) {
      return;
    }

    this.matchFormModel.update(model => ({
      ...model,
      players: [...model.players, CreateX01MatchFormModel.createEmptyPlayer()],
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
      index >= this.matchFormModel().players.length
    ) {
      return;
    }

    this.matchFormModel.update(model => ({
      ...model,
      players: model.players.filter((_, playerIndex) => playerIndex !== index),
    }));
  }

  /**
   * Reorders the players according to a drag-and-drop event.
   *
   * @param event - Drag-and-drop event containing the previous and new player indexes.
   */
  protected onDropPlayerCard(event: CdkDragDrop<CreateX01MatchFormModel.PlayerFormModel[]>): void {
    this.matchFormModel.update(model => {
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
    if (index < 0 || index >= this.matchFormModel().players.length) {
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
          selectedTypes => selectedTypes.filter(type => type === this.X01ClearByTwoType.LEGS),
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
  protected onClearByTwoTypeChange(type: CreateX01MatchFormModel.ClearByTwoType, enabled: boolean): void {
    switch (type) {
      case this.X01ClearByTwoType.SETS:
        this.matchForm.clearByTwo.setLimit().value.set(enabled ? 1 : 0);
        break;

      case this.X01ClearByTwoType.LEGS:
        this.matchForm.clearByTwo.legLimit().value.set(enabled ? 1 : 0);
        break;

      case this.X01ClearByTwoType.LEGS_FINAL_SET:
        this.matchForm.clearByTwo.finalSetLegLimit().value.set(enabled ? 1 : 0);
        break;
    }
  }

  /**
   * @returns Whether the maximum player count has been reached.
   */
  protected isMaxPlayersReached(): boolean {
    return this.matchFormModel().players.length >= MAX_PLAYERS;
  }

  /**
   * @returns Whether the minimum player count has been reached.
   */
  protected isMinPlayersReached(): boolean {
    return this.matchFormModel().players.length <= MIN_PLAYERS;
  }

  /**
   * @returns Whether a dart bot player is present.
   */
  protected hasBotPlayer(): boolean {
    return this.matchFormModel().players
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
