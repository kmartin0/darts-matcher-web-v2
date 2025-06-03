import {Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild} from '@angular/core';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {NgIf} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ReactiveFormsModule} from '@angular/forms';
import {X01MatchInfoComponent} from '../x01-match-info/x01-match-info.component';
import {X01MatchPlayerCardsComponent} from '../x01-match-player-cards/x01-match-player-cards.component';
import {X01MatchLegTableComponent} from '../x01-match-leg-table/x01-match-leg-table.component';
import {LegSelection} from '../../../../models/common/leg-selection';
import {X01ScoreInputComponent} from '../x01-score-input/x01-score-input.component';
import {SelectLegFormComponent} from '../select-leg-form/select-leg-form.component';
import {DartsMatcherWebsocketService} from '../../../../api/services/darts-matcher-websocket.service';
import {Subscription} from 'rxjs';
import {getLegInPlay, getRemainingForCurrentPlayer, getSetInPlay} from '../../../../shared/utils/x01-match.utils';
import {X01CheckoutService} from '../../../../shared/services/x01-checkout-service/x01-checkout-service';
import {DialogService} from '../../../../shared/services/dialog-service/dialog.service';

@Component({
  selector: 'app-x01-match',
  imports: [
    MatIconButton,
    MatIcon,
    MatButton,
    ReactiveFormsModule,
    NgIf,
    X01MatchInfoComponent,
    X01MatchPlayerCardsComponent,
    X01MatchLegTableComponent,
    X01ScoreInputComponent,
    SelectLegFormComponent
  ],
  standalone: true,
  templateUrl: './x01-match.component.html',
  styleUrl: './x01-match.component.scss'
})
export class X01MatchComponent implements OnChanges, OnDestroy {
  @Input() match: X01Match | null = null;
  @ViewChild('scoreInputComponent') scoreInputComponent!: X01ScoreInputComponent;
  private subscription = new Subscription();
  selectedLeg: LegSelection = {set: 0, leg: 0};

  constructor(private websocketService: DartsMatcherWebsocketService, private checkoutService: X01CheckoutService,
              private dialogService: DialogService) {
  }

  /**
   * Watches for changes to `match` input to update view data and selected leg.
   * @param changes - Object containing changes to input properties
   */
  async ngOnChanges(changes: SimpleChanges) {
    if (changes['match']) {
      this.selectCurrentOrLastLeg();
    }
  }

  /**
   * Cleans up all active subscriptions just before the component is destroyed.
   */
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Handles a submitted score by checking match state and determining the next step.
   * Could result in sending a turn directly, or opening dialogs for checkout or doubles.
   *
   * @param score - The score submitted by the user
   */
  async submitScore(score: number) {
    if (!this.match) return;

    // Retrieve the current player's remaining score before the submitted score is applied.
    const remainingBeforeScore = getRemainingForCurrentPlayer(this.match);
    if (remainingBeforeScore == null) throw new Error('Remaining for current player not found.');

    // Calculate the player's new remaining score after applying the submitted score.
    const remainingAfterScore = remainingBeforeScore - score;

    // When a player has checked out open the darts used dialog. When a player could've hit a double and double tracking
    // is enabled open doubles missed dialog. Otherwise, send the submitted score.
    if (remainingAfterScore === 0) await this.openDartsUsedDialog(score);
    else if (this.match.matchSettings.trackDoubles && remainingAfterScore <= 50) this.openDoublesMissedDialog(score, 3);
    else this.sendX01MatchTurn(score, 3, 0);
  }

  /**
   * Opens a dialog prompting the user to input the number of missed doubles.
   * If a value is provided, it sends the full match turn data using the provided score and darts used.
   *
   * @param score - The score thrown in the current turn
   * @param dartsUsed - The number of darts used during the turn
   */
  private openDoublesMissedDialog(score: number, dartsUsed: number) {
    const dialogRef = this.dialogService.openDoublesMissedDialog();
    this.subscription.add(dialogRef.afterClosed().subscribe((doublesMissed: number | undefined) => {
      if (doublesMissed === undefined || doublesMissed === null) return;

      this.sendX01MatchTurn(score, dartsUsed, doublesMissed);
    }));
  }

  /**
   * Opens a dialog prompting the user to input the number of darts used to complete a checkout.
   * Retrieves the suggested checkout for the given score and passes it to the dialog.
   * If a value is provided, proceeds to prompt for missed doubles.
   *
   * @param score - The checkout score submitted
   */
  private async openDartsUsedDialog(score: number) {
    const checkout = await this.checkoutService.getCheckout(score);
    const dialogRef = this.dialogService.openDartsUsedDialog(checkout ?? null);
    this.subscription.add(dialogRef.afterClosed().subscribe((dartsUsed: number | undefined) => {
      if (dartsUsed === undefined || dartsUsed === null) return;

      this.match?.matchSettings.trackDoubles ? this.openDoublesMissedDialog(score, dartsUsed) : this.sendX01MatchTurn(score, dartsUsed, 0);
    }));
  }

  /**
   * Sends a completed match turn to the api via WebSocket and clears the score input field.
   *
   * @param score - The score achieved in the turn
   * @param dartsUsed - Number of darts used in the turn
   * @param doublesMissed - Number of missed double attempts
   */
  private sendX01MatchTurn(score: number, dartsUsed: number, doublesMissed: number) {
    if (!this.match) return;

    this.websocketService.publishX01MatchTurn({
      matchId: this.match.id,
      score: score,
      dartsUsed: dartsUsed,
      doublesMissed: doublesMissed
    });

    this.scoreInputComponent?.clearScoreInput();
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

}
