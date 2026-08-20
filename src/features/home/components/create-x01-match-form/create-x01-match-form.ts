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
import {createX01MatchFormSchema, MAX_PLAYERS, MIN_PLAYERS} from './create-x01-match-form.schema';
import {FieldTree, form, FormField, FormRoot, ReadonlyFieldTree} from '@angular/forms/signals';

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
  readonly submitAction = input.required<CreateX01MatchFormModel.SubmitAction>();

  private readonly matchFormModel = signal(CreateX01MatchFormModel.createInitialFormModel());

  protected readonly x01Options = CreateX01MatchFormModel.X01_OPTIONS;
  protected readonly X01BestOfType = X01BestOfType;
  protected readonly X01ClearByTwoType = CreateX01MatchFormModel.ClearByTwoType;
  protected readonly PlayerType = PlayerType;

  readonly matchForm = form(
    this.matchFormModel,
    createX01MatchFormSchema,
    {
      submission: {
        action: async field => {
          const errors = await this.submitAction()(field().value());

          return errors?.map(error => ({
            fieldTree: this.resolveErrorTarget(field, error.target),
            kind: 'server',
            message: error.message,
          }));
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

  /**
   * Resolves a form error target to its corresponding Signal Forms field tree.
   *
   * @param field - Root field tree of the create X01 match form.
   * @param target - Form error target to resolve.
   * @returns The matching field tree, or undefined for root-level errors or invalid targets.
   */
  private resolveErrorTarget(
    field: FieldTree<CreateX01MatchFormModel.FormModel>,
    target: CreateX01MatchFormModel.FormErrorTarget
  ): ReadonlyFieldTree<unknown> | undefined {
    if (this.isPlayerErrorTarget(target)) {
      return this.resolvePlayerErrorTarget(field, target);
    }

    return this.resolveStaticErrorTarget(field, target);
  }


  /**
   * Resolves a static form error target to its corresponding field tree.
   *
   * @param field - Root field tree of the create X01 match form.
   * @param target - Static form error target to resolve.
   * @returns The matching field tree, or undefined for a root-level error.
   */
  private resolveStaticErrorTarget(
    field: FieldTree<CreateX01MatchFormModel.FormModel>,
    target: CreateX01MatchFormModel.StaticFormErrorTarget
  ): ReadonlyFieldTree<unknown> | undefined {
    switch (target) {
      case 'root':
        return undefined;
      case 'x01':
        return field.x01;
      case 'bestOf.sets':
        return field.bestOf.sets;
      case 'bestOf.legs':
        return field.bestOf.legs;
      case 'clearByTwo.setLimit':
        return field.clearByTwo.setLimit;
      case 'clearByTwo.legLimit':
        return field.clearByTwo.legLimit;
      case 'clearByTwo.finalSetLegLimit':
        return field.clearByTwo.finalSetLegLimit;
      case 'players':
        return field.players;
    }
  }

  /**
   * Resolves an indexed player error target to its corresponding field tree.
   *
   * @param field - Root field tree of the create X01 match form.
   * @param target - Player error target to resolve.
   * @returns The matching player field tree, or undefined if the player index or field is invalid.
   */
  private resolvePlayerErrorTarget(
    field: FieldTree<CreateX01MatchFormModel.FormModel>,
    target: CreateX01MatchFormModel.PlayerFormErrorTarget
  ): ReadonlyFieldTree<unknown> | undefined {
    const segments = target.split('.');
    const player = field.players[Number(segments[1])];

    if (!player) {
      return undefined;
    }

    switch (segments[2]) {
      case 'playerType':
        return player.playerType;
      case 'playerName':
        return player.playerName;
      case 'threeDartAverage':
        return player.threeDartAverage;
      default:
        return undefined;
    }
  }

  /**
   * Checks whether a form error target refers to an indexed player field.
   *
   * @param target - Form error target to check.
   * @returns True when the target is a player error target.
   */
  private isPlayerErrorTarget(
    target: CreateX01MatchFormModel.FormErrorTarget
  ): target is CreateX01MatchFormModel.PlayerFormErrorTarget {
    return target.startsWith('players.');
  }
}
