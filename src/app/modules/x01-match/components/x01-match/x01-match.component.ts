import {Component, DestroyRef, inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {NgIf} from '@angular/common';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ReactiveFormsModule} from '@angular/forms';
import {X01MatchInfoComponent} from '../x01-match-info/x01-match-info.component';
import {X01MatchPlayerCardsComponent} from '../x01-match-player-cards/x01-match-player-cards.component';
import {X01MatchLegTableComponent} from '../x01-match-leg-table/x01-match-leg-table.component';
import {X01ScoreInputComponent} from '../x01-score-input/x01-score-input.component';
import {SelectLegFormComponent} from '../select-leg-form/select-leg-form.component';
import {DartsMatcherWebSocketService} from '../../../../api/services/darts-matcher-web-socket.service';
import {firstValueFrom, takeUntil} from 'rxjs';
import {
  findLastPlayerScore,
  getLeg,
  getRemainingForCurrentPlayer,
  getRemainingForPlayer,
  getSet,
} from '../../../../shared/utils/x01-match.utils';
import {X01CheckoutService} from '../../../../shared/services/x01-checkout-service/x01-checkout-service';
import {DialogService} from '../../../../shared/services/dialog-service/dialog.service';
import {ApiWsErrorBody} from '../../../../api/error/api-ws-error-body';
import {ApiErrorEnum} from '../../../../api/error/api-error-enum';
import {DARTS_MATCHER_WS_DESTINATIONS} from '../../../../api/endpoints/darts-matcher-web-socket.endpoints';
import {ApiErrorBodyHandler} from '../../../../api/services/api-error-body-handler.service';
import {MatchStatus} from '../../../../models/basematch/match-status';
import {MatTooltip} from '@angular/material/tooltip';
import {
  X01EditScoreDialogResult
} from '../../../../shared/components/x01-edit-score-dialog/x01-edit-score-dialog.types';
import {X01EditTurn} from '../../../../models/x01-match/x01-edit-turn';
import {X01Turn} from '../../../../models/x01-match/x01-turn';
import {BaseComponent} from '../../../../shared/components/base/base.component';
import {X01Leg} from '../../../../models/x01-match/x01-leg';
import {X01MatchViewData, X01MatchViewDataTransformer} from './x01-match-view-data-transformer';

@Component({
  selector: 'app-x01-match',
  imports: [
    MatIconButton,
    MatIcon,
    ReactiveFormsModule,
    NgIf,
    X01MatchInfoComponent,
    X01MatchPlayerCardsComponent,
    X01MatchLegTableComponent,
    X01ScoreInputComponent,
    SelectLegFormComponent,
    MatTooltip,
  ],
  standalone: true,
  templateUrl: './x01-match.component.html',
  styleUrl: './x01-match.component.scss'
})
export class X01MatchComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() match: X01Match | null = null;
  @ViewChild('scoreInputComponent') scoreInputComponent!: X01ScoreInputComponent;
  viewData: X01MatchViewData;

  private webSocketService = inject(DartsMatcherWebSocketService);
  private checkoutService = inject(X01CheckoutService);
  private dialogService = inject(DialogService);
  private apiErrorBodyHandler = inject(ApiErrorBodyHandler);
  private destroyRef = inject(DestroyRef);
  private viewDataTransformer = inject(X01MatchViewDataTransformer);

  constructor() {
    super();
    this.viewData = this.viewDataTransformer.transform(null);
  }

  /**
   * Establishes a WebSocket connection and subscribes to the error queue after component initialization.
   */
  ngOnInit() {
    this.webSocketService.connect(this.destroyRef);
    this.subscribeErrorQueue();
  }

  /**
   * Watches for changes to `match` input to update view data and selected leg.
   * @param changes - Object containing changes to input properties
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['match']) {
      this.viewData = this.viewDataTransformer.transform(this.match);
    }
  }

  /**
   * Updates the view data for a new leg selection using the transformer.
   */
  onLegSelectionChange() {
    this.viewData = this.viewDataTransformer.updateForNewLegSelection(this.viewData, this.match);
  }

  /**
   * Handles a submitted score by checking match state and determining the next step.
   * Could result in publishing a turn directly, or opening dialogs for checkout or doubles.
   *
   * @param score - The score submitted by the user
   * @returns {Promise<void>} Promise that resolves after processing the score
   */
  async onSubmitScore(score: number): Promise<void> {
    if (!this.match) return;
    if (this.match.matchStatus === MatchStatus.CONCLUDED) {
      this.viewData.errorMsg = 'Match is concluded';
      return;
    }

    // Retrieve the current player's remaining score before the submitted score is applied.
    const remainingBeforeScore = getRemainingForCurrentPlayer(this.match);

    // Calculate the player's new remaining score after applying the submitted score.
    const remainingAfterScore = remainingBeforeScore - score;

    // Create the round score (if necessary prompts user for darts used and doubles missed). And publish the turn to the API via Websocket.
    this.createTurn(score, remainingAfterScore, this.match.matchSettings.trackDoubles).then(turn => {
      if (turn == null) return;
      this.publishX01MatchTurn(turn);
    });
  }

  /**
   * Deletes the last turn of the current match via WebSocket.
   */
  deleteLastTurn() {
    if (!this.match) return;

    this.webSocketService.publishX01DeleteLastTurn(this.match.id);
  }

  /**
   * Handles the result from editing a score dialog.
   * Creates an X01RoundScore object and uses it with the dialog result to create an X01EditTurn object and publishes it
   * to the API via Websocket.
   *
   * @param dialogResult The result containing the edited score and context details.
   */
  onEditScoreResult(dialogResult: X01EditScoreDialogResult) {
    if (!this.match) return;

    // Get the legEntry to edit, return if not found.
    const setEntry = getSet(this.match, dialogResult.set);
    const legEntry = getLeg(setEntry?.set ?? null, dialogResult.leg);
    if (!legEntry) return;

    // Calculate the remaining score by replacing the old score with the new score.
    const remainingBeforeEdit = getRemainingForPlayer(legEntry.leg, this.match.matchSettings.x01, dialogResult.playerId);
    const remainingAfterEdit = (remainingBeforeEdit + dialogResult.oldScore) - dialogResult.newScore;

    // When necessary prompt the user for darts used and doubles missed input. Use the result to publish the edited turn.
    this.createEditTurn(dialogResult, remainingAfterEdit, legEntry.leg).then(editTurn => {
      if (editTurn == null) return;
      this.webSocketService.publishX01EditTurn(dialogResult.matchId, editTurn);
    });
  }

  /**
   * Creates a new turn.
   *
   * @param {number} score - The score achieved during the turn.
   * @param {number} remainingAfterScore - The remaining score after this turn's score is applied.
   * @param {boolean} trackDoubles - Whether to prompt for doubles missed.
   * @returns {Promise<X01Turn | null>} - A promise that resolves to the created X01Turn or null if the turn was cancelled.
   */
  private async createTurn(score: number, remainingAfterScore: number, trackDoubles: boolean): Promise<X01Turn | null> {
    const dialogsResult = await this.openDialogsForCreateTurn(score, remainingAfterScore, trackDoubles);
    if (dialogsResult == null) return null;

    return {
      score: score,
      checkoutDartsUsed: dialogsResult.checkoutDartsUsed,
      doublesMissed: dialogsResult.doublesMissed
    };
  }

  /**
   * Opens dialog prompts to gather additional information when creating a new turn (darts used for checkout, doubles missed).
   *
   * @param {number} score - The score achieved during the turn.
   * @param {number} remainingAfterScore - The score left after the current score is deducted.
   * @param {boolean} trackDoubles - Whether to track doubles missed.
   * @returns {Promise<{ checkoutDartsUsed: number | null, doublesMissed: number } | null>} - A promise that resolves to the user input or null if the dialog was cancelled.
   */
  private async openDialogsForCreateTurn(score: number, remainingAfterScore: number, trackDoubles: boolean)
    : Promise<{ checkoutDartsUsed: number | null, doublesMissed: number | null } | null> {
    let checkoutDartsUsed: number | null | undefined = null;
    let doublesMissed: number | null | undefined = null;

    // On checkout prompt darts used.
    if (remainingAfterScore === 0) {
      checkoutDartsUsed = await this.openDartsUsedDialog(score);
      if (checkoutDartsUsed === undefined) return null;
    }

    // when in doubles range and double tracking is enabled prompt for doubles
    if (trackDoubles && remainingAfterScore <= 50) {
      doublesMissed = await this.openDoublesMissedDialog();
      if (doublesMissed === undefined) return null;
    }

    return {checkoutDartsUsed, doublesMissed};
  }

  /**
   * Creates an edit turn object using the result from an edit score dialog.
   *
   * @param {X01EditScoreDialogResult} dialogResult - The result from the edit score dialog.
   * @param {number} remainingAfterEdit - The score left after the new score is applied.
   * @param {X01Leg} leg - The current leg containing the turn being edited.
   * @returns {Promise<X01EditTurn | null>} - A promise that resolves to the edited turn data or null if cancelled.
   */
  private async createEditTurn(dialogResult: X01EditScoreDialogResult, remainingAfterEdit: number, leg: X01Leg): Promise<X01EditTurn | null> {
    const isLastRound = dialogResult.round === Number(Object.keys(leg.rounds).at(-1)); // Determine if the edit is for the last round
    const userPrompt = await this.openDialogsForEditTurn(dialogResult.newScore, remainingAfterEdit, leg, dialogResult.playerId, isLastRound);
    if (userPrompt == null) return null;

    return {
      playerId: dialogResult.playerId,
      set: dialogResult.set,
      leg: dialogResult.leg,
      round: dialogResult.round,
      score: dialogResult.newScore,
      checkoutDartsUsed: userPrompt.checkoutDartsUsed,
      doublesMissed: dialogResult.newDoublesMissed
    };
  }

  /**
   * Opens dialog prompts to gather additional data (checkout darts used) when editing an existing turn.
   *
   * @param {number} newScore - The updated score being set for the edited turn.
   * @param {number} remainingAfterEdit - The score left after the new score is applied.
   * @param {X01Leg} leg - The current leg of the match.
   * @param {string} playerId - The ID of the player whose turn is being edited.
   * @param {boolean} isLastRound - Whether this is the last round in the leg.
   * @returns {Promise<{ checkoutDartsUsed: number | null } | null>} - A promise that resolves to the user input or null if cancelled.
   */
  private async openDialogsForEditTurn(newScore: number, remainingAfterEdit: number, leg: X01Leg, playerId: string, isLastRound: boolean)
    : Promise<{ checkoutDartsUsed: number | null } | null> {
    let checkoutDartsUsed: number | null | undefined = null;

    if (remainingAfterEdit === 0) {
      // Use the actual last score (real checkout) to open the dialog
      let checkoutScore = isLastRound ? newScore : findLastPlayerScore(leg, playerId)?.score ?? null;
      if (!checkoutScore) return null;

      checkoutDartsUsed = await this.openDartsUsedDialog(checkoutScore);
    }

    // When checkoutDartsUsed is undefined the dialog was cancelled.
    return checkoutDartsUsed === undefined ? null : {checkoutDartsUsed};
  }

  /**
   * Opens a dialog prompting the user to input the number of missed doubles.
   * If a value is provided, it sends the full match turn data using the provided score and darts used.
   *
   * @returns {Promise<X01LegRoundScore | undefined>} The round score data or undefined if cancelled
   */
  private async openDoublesMissedDialog(): Promise<number | undefined> {
    const dialogRef = this.dialogService.openDoublesMissedDialog();
    if (!dialogRef) return undefined;

    const dialogResult$ = dialogRef.afterClosed().pipe(takeUntil(this.destroy$));
    return await firstValueFrom(dialogResult$, {defaultValue: undefined});
  }

  /**
   * Opens a dialog prompting the user to input the number of darts used to complete a checkout.
   * Retrieves the suggested checkout for the given score and passes it to the dialog.
   * If a value is provided, proceeds to prompt for missed doubles.
   *
   * @param score - The checkout score submitted
   * @returns {Promise<X01LegRoundScore | undefined>} The round score data or undefined if cancelled
   */
  private async openDartsUsedDialog(score: number): Promise<number | undefined> {
    const checkout = await this.checkoutService.getCheckout(score);
    const dialogRef = this.dialogService.openDartsUsedDialog(checkout ?? null);
    if (!dialogRef) return undefined;

    const dialogResult$ = dialogRef.afterClosed().pipe(takeUntil(this.destroy$));
    return await firstValueFrom(dialogResult$, {defaultValue: undefined});
  }

  /**
   * Sends a completed match turn to the api via WebSocket and clears the score input field.
   *
   * @param turn - The turn to publish
   */
  private publishX01MatchTurn(turn: X01Turn) {
    if (!this.match || !turn) return;

    this.webSocketService.publishX01AddTurn(this.match.id, turn);
    this.scoreInputComponent?.clearScoreInput();
  }

  /**
   * Subscribes to the websocket error queue. Delegates the errors to the ws error body handler.
   */
  private subscribeErrorQueue() {
    const sub = this.webSocketService.errorQueue$.subscribe({
      next: (apiWsErrorBody) => {
        this.handleApiWsErrorBody(apiWsErrorBody);
      }
    });
    this.subscription.add(sub);
  }

  /**
   * Handles errors coming from the websocket error queue.
   * Will only handle errors that are in the destinations relevant to this component.
   *
   * @param apiWsErrorBody - The error body to be handled.
   */
  private handleApiWsErrorBody(apiWsErrorBody: ApiWsErrorBody) {
    const errorDestinations = this.getErrorDestinations();

    if (errorDestinations.includes(apiWsErrorBody.destination)) {
      switch (apiWsErrorBody.error) {
        case ApiErrorEnum.RESOURCE_NOT_FOUND: {
          this.viewData.errorMsg = 'Couldn\'t find the match';
          break;
        }

        case ApiErrorEnum.INVALID_ARGUMENTS: {
          const errorKey = Object.keys(apiWsErrorBody.details ?? {})[0];
          this.viewData.errorMsg = apiWsErrorBody.details?.[errorKey];
          break;
        }

        case ApiErrorEnum.PROCESSING_LIMIT_REACHED: {
          this.viewData.errorMsg = 'Bot turn limit reached, press sync match to try again.'
          break;
        }

        default: {
          this.apiErrorBodyHandler.handleApiErrorBody(apiWsErrorBody);
        }
      }
    }
  }

  /**
   * Array of error destination that should be handled by this component.
   * @returns {LegSelection | null} The current set and leg numbers, or null if none are in play
   */
  private getErrorDestinations(): string[] {
    if (!this.match) return [];
    const matchId = this.match.id;

    return [
      DARTS_MATCHER_WS_DESTINATIONS.PUBLISH.X01_ADD_TURN(matchId),
      DARTS_MATCHER_WS_DESTINATIONS.PUBLISH.X01_EDIT_TURN(matchId),
      DARTS_MATCHER_WS_DESTINATIONS.PUBLISH.X01_DELETE_LAST_TURN(matchId),
    ];
  }
}
