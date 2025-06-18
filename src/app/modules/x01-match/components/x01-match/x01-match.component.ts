import {Component, DestroyRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {NgIf} from '@angular/common';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ReactiveFormsModule} from '@angular/forms';
import {X01MatchInfoComponent} from '../x01-match-info/x01-match-info.component';
import {X01MatchPlayerCardsComponent} from '../x01-match-player-cards/x01-match-player-cards.component';
import {X01MatchLegTableComponent} from '../x01-match-leg-table/x01-match-leg-table.component';
import {LegSelection} from '../../../../models/common/leg-selection';
import {X01ScoreInputComponent} from '../x01-score-input/x01-score-input.component';
import {SelectLegFormComponent} from '../select-leg-form/select-leg-form.component';
import {DartsMatcherWebSocketService} from '../../../../api/services/darts-matcher-web-socket.service';
import {firstValueFrom, takeUntil} from 'rxjs';
import {
  getLeg,
  getLegInPlay,
  getRemainingForCurrentPlayer,
  getRemainingForPlayer,
  getSet,
  getSetInPlay
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
import {X01LegRoundScore} from '../../../../models/x01-match/x01-leg-round-score';
import {X01EditTurn} from '../../../../models/x01-match/x01-edit-turn';
import {X01Turn} from '../../../../models/x01-match/x01-turn';
import {BaseComponent} from '../../../../shared/components/base/base.component';

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
  selectedLeg: LegSelection = {set: 0, leg: 0};
  errorMsg: string | undefined = undefined;
  editScoreMode: boolean = false;
  displayScoreInput: boolean = false;
  displayUndoScore: boolean = false;

  constructor(private webSocketService: DartsMatcherWebSocketService, private checkoutService: X01CheckoutService,
              private dialogService: DialogService, private apiErrorBodyHandler: ApiErrorBodyHandler, private destroyRef: DestroyRef) {
    super();
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
   * @returns {Promise<void>} Promise that resolves when changes are handled
   */
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['match']) {
      this.errorMsg = undefined;
      this.selectCurrentOrLastLeg();
    }
  }

  /**
   * Handles logic when the selected leg changes.
   * Updates visibility flags for score input and undo score controls.
   */
  onSelectedLegChange() {
    this.updateDisplayScoreInput();
    this.updateDisplayUndoScore();
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
      this.errorMsg = 'Match is concluded';
      return;
    }

    // Retrieve the current player's remaining score before the submitted score is applied.
    const remainingBeforeScore = getRemainingForCurrentPlayer(this.match);

    // Calculate the player's new remaining score after applying the submitted score.
    const remainingAfterScore = remainingBeforeScore - score;

    // Create the round score (if necessary prompts user for darts used and doubles missed). And publish the turn to the API via Websocket.
    this.createRoundScore(score, remainingAfterScore, this.match.matchSettings.trackDoubles).then(roundScore => {
      if (roundScore == null) return;
      this.publishX01MatchTurn(roundScore.score, roundScore.dartsUsed, roundScore.doublesMissed);
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

    // Get the leg to edit, return if not found.
    const set = getSet(this.match, dialogResult.set);
    const leg = getLeg(set, dialogResult.leg);
    if (!leg) return;

    // Calculate the remaining score by replacing the old score with the new score.
    const remainingBeforeEdit = getRemainingForPlayer(leg, this.match.matchSettings.x01, dialogResult.playerId);
    const remainingAfterEdit = (remainingBeforeEdit + dialogResult.oldScore) - dialogResult.newScore;

    // When necessary prompt the user for darts used and doubles missed input. Use the result to publish the edited turn.
    this.createRoundScore(dialogResult.newScore, remainingAfterEdit, this.match.matchSettings.trackDoubles).then(roundScore => {
      if (roundScore == null) return;
      this.webSocketService.publishX01EditTurn(dialogResult.matchId, this.createEditTurn(dialogResult, roundScore));
    });
  }

  /**
   * Handles the outcome of a submitted score by determining the appropriate follow-up action.
   *
   * Depending on the remaining score and whether double tracking is enabled, this method:
   * - Opens the "darts used" dialog if the player checked out (remaining score is 0).
   * - Opens the "doubles missed" dialog if double tracking is enabled and the remaining score is <= 50.
   * - Otherwise, callback a regular round (3 darts used, 0 doubles missed).
   *
   * @param score - The submitted score by the player.
   * @param remainingAfterScore - The player's score after applying the submitted value.
   * @param trackDoubles - Whether double tracking is enabled in the match settings.
   * @returns {Promise<X01LegRoundScore | null>} The round score data or null if cancelled
   */
  private async createRoundScore(score: number, remainingAfterScore: number, trackDoubles: boolean): Promise<X01LegRoundScore | null> {
    if (remainingAfterScore === 0) return this.openDartsUsedDialog(score, trackDoubles);
    else if (trackDoubles && remainingAfterScore <= 50) return this.openDoublesMissedDialog(score, 3);
    else return {score: score, dartsUsed: 3, doublesMissed: 0};
  }

  /**
   * Opens a dialog prompting the user to input the number of missed doubles.
   * If a value is provided, it sends the full match turn data using the provided score and darts used.
   *
   * @param score - The score thrown in the current turn
   * @param dartsUsed - The number of darts used during the turn
   * @returns {Promise<X01LegRoundScore | null>} The round score data or null if cancelled
   */
  private async openDoublesMissedDialog(score: number, dartsUsed: number): Promise<X01LegRoundScore | null> {
    const dialogRef = this.dialogService.openDoublesMissedDialog();
    if (!dialogRef) return null;

    const dialogResult$ = dialogRef.afterClosed().pipe(takeUntil(this.destroy$));
    const doublesMissed = await firstValueFrom(dialogResult$, {defaultValue: undefined});

    if (doublesMissed === undefined || doublesMissed === null) return null;

    return {score: score, dartsUsed: dartsUsed, doublesMissed: doublesMissed};
  }

  /**
   * Opens a dialog prompting the user to input the number of darts used to complete a checkout.
   * Retrieves the suggested checkout for the given score and passes it to the dialog.
   * If a value is provided, proceeds to prompt for missed doubles.
   *
   * @param score - The checkout score submitted
   * @param trackDoubles - Whether the match is tracking doubles
   * @returns {Promise<X01LegRoundScore | null>} The round score data or null if cancelled
   */
  private async openDartsUsedDialog(score: number, trackDoubles: boolean): Promise<X01LegRoundScore | null> {
    const checkout = await this.checkoutService.getCheckout(score);
    const dialogRef = this.dialogService.openDartsUsedDialog(checkout ?? null);
    if (!dialogRef) return null;

    const dialogResult$ = dialogRef.afterClosed().pipe(takeUntil(this.destroy$));
    const dartsUsed = await firstValueFrom(dialogResult$, {defaultValue: undefined});
    if (dartsUsed === undefined || dartsUsed === null) return null;

    if (trackDoubles) return await this.openDoublesMissedDialog(score, dartsUsed);
    else return {score: score, dartsUsed: dartsUsed, doublesMissed: 0};
  }

  /**
   * Creates an X01EditTurn object based on dialog result and round score.
   *
   * @param dialogResult X01EditScoreDialogResult - The dialog result containing match and player info.
   * @param roundScore X01LegRoundScore - The round score with darts used, doubles missed and the score.
   * @returns X01EditTurn - object representing the edited turn.
   */
  private createEditTurn(dialogResult: X01EditScoreDialogResult, roundScore: X01LegRoundScore): X01EditTurn {
    return {
      playerId: dialogResult.playerId,
      set: dialogResult.set,
      leg: dialogResult.leg,
      round: dialogResult.round,
      score: roundScore.score,
      dartsUsed: roundScore.dartsUsed,
      doublesMissed: roundScore.doublesMissed
    };
  }

  /**
   * Sends a completed match turn to the api via WebSocket and clears the score input field.
   *
   * @param score - The score achieved in the turn
   * @param dartsUsed - Number of darts used in the turn
   * @param doublesMissed - Number of missed double attempts
   */
  private publishX01MatchTurn(score: number, dartsUsed: number, doublesMissed: number) {
    if (!this.match) return;

    const turn: X01Turn = {
      score: score,
      dartsUsed: dartsUsed,
      doublesMissed: doublesMissed
    };

    this.webSocketService.publishX01AddTurn(this.match.id, turn);
    this.scoreInputComponent?.clearScoreInput();
  }

  /**
   * Updates the visibility of the score input.
   * The score input is shown only if the match is in progress and the selected leg matches the current leg in play.
   */
  private updateDisplayScoreInput() {
    if (!this.match) {
      this.displayScoreInput = false;
      return;
    }

    this.displayScoreInput =
      this.match.matchStatus === MatchStatus.IN_PLAY &&
      this.match.matchProgress.currentSet === this.selectedLeg.set &&
      this.match.matchProgress.currentLeg === this.selectedLeg.leg;
  }

  /**
   * Updates the visibility of the undo score control.
   * The undo option is shown only if the selected leg matches the last recorded set and leg in the match.
   */
  private updateDisplayUndoScore() {
    const lastSet = getSet(this.match, Math.max(...this.match?.sets.map(s => s.set) ?? []));
    const lastLeg = getLeg(lastSet, Math.max(...lastSet?.legs.map(l => l.leg) ?? []));

    this.displayUndoScore =
      lastSet?.set === this.selectedLeg.set &&
      lastLeg?.leg === this.selectedLeg.leg;
  }

  /**
   * Selects the current leg in play if available; otherwise selects the last leg in the match.
   * Updates the `selectedLeg` component property with the current set/leg number.
   */
  private selectCurrentOrLastLeg() {
    let selection: LegSelection = {set: 0, leg: 0};
    if (this.match) {
      const setAndLegInPlay = this.createSetAndLegInPlaySelection(this.match);
      if (setAndLegInPlay) { // Set the selection the current set and leg in play.
        selection = setAndLegInPlay;
      } else { // If no set or leg is in play. Get the last leg.
        const lastSet = this.match.sets.at(-1);
        const lastLeg = lastSet?.legs.at(-1);

        if (lastSet && lastLeg) {
          selection = {set: lastSet.set, leg: lastLeg.leg};
        }
      }
    }
    this.selectedLeg = selection;
    this.onSelectedLegChange();
  }

  /**
   * Retrieves the set and leg currently in play based on the match progress.
   *
   * @param match - The current match
   * @returns The current set and leg numbers, or null if none are in play
   */
  private createSetAndLegInPlaySelection(match: X01Match): LegSelection | null {
    const setInPlay = getSetInPlay(match);
    const legInPlay = getLegInPlay(match, setInPlay);
    return (setInPlay && legInPlay) ? {set: setInPlay.set, leg: legInPlay.leg} : null;
  }

  /**
   * Subscribes to the websocket error queue. Delegates the errors to the ws error body handler.
   */
  private subscribeErrorQueue() {
    const sub = this.webSocketService.getErrorQueue().subscribe({
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
          this.errorMsg = 'Couldn\'t find the match';
          break;
        }

        case ApiErrorEnum.INVALID_ARGUMENTS: {
          const errorKey = Object.keys(apiWsErrorBody.details ?? {})[0];
          this.errorMsg = apiWsErrorBody.details?.[errorKey];
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
      DARTS_MATCHER_WS_DESTINATIONS.PUBLISH.X01_DELETE_LAST_TURN(matchId)
    ];
  }
}
