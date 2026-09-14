import {inject, Injectable} from '@angular/core';
import {MAX_DOUBLE_SCORE} from '../../../data/model/dartboard/dartboard-section';
import {X01Checkout, X01CheckoutsMap} from '../../../data/model/x01/checkout/x01-checkout';
import {getLastTurnForPlayerInLeg, isLastRoundForPlayerInLeg, X01Leg} from '../../../data/model/x01/leg/x01-leg';
import {getLegInMatch, X01Match} from '../../../data/model/x01/match/x01-match';
import {isMatchProgressInPlay} from '../../../data/model/x01/match/x01-match-progress';
import {X01Turn} from '../../../data/model/x01/round/x01-turn';
import {MatchDialogService} from '../../../shared/services/match-dialog-service';
import {DialogResult} from '../../../shared/types/dialog-result';
import {MatchScoreTableEditTarget} from '../components/match-score-table/match-score-table-edit-target';
import {CreateTurnInput, EditTurnInput, TurnInput} from '../model/turn-input';

@Injectable({providedIn: 'root'})
export class MatchTurnInputService {
  private readonly matchDialogService = inject(MatchDialogService);

  /**
   * Resolves the input required to create a new turn for the current thrower.
   *
   * @param score - Score for the new turn.
   * @param match - Match to create the turn for.
   * @param checkouts - Available checkout suggestions.
   * @returns The resolved create-turn input, or null when required match data
   * cannot be resolved or the dialog flow is dismissed.
   */
  async resolveCreateTurnInput(
    score: number,
    match: X01Match,
    checkouts: X01CheckoutsMap
  ): Promise<CreateTurnInput | null> {
    // Resolve the current thrower and leg.
    const matchProgress = match.matchProgress;
    if (!isMatchProgressInPlay(matchProgress)) return null;

    const currentThrowerId = matchProgress.currentThrower;

    const legEntry = getLegInMatch(match, matchProgress.currentSet, matchProgress.currentLeg);
    if (legEntry === null) return null;

    // Calculate the player's remaining score after applying the turn.
    const lastTurn = getLastTurnForPlayerInLeg(legEntry.leg, currentThrowerId);

    const remainingBeforeTurn = lastTurn?.remaining ?? match.matchSettings.x01;
    const remainingAfterTurn = remainingBeforeTurn - score;

    // Resolve the checkout that applies to the turn.
    const checkout = this.resolveCheckout(score, remainingAfterTurn, checkouts);

    // Run the shared turn dialogs.
    return this.runTurnDialogs(score, checkout, match.matchSettings.trackDoubles, remainingAfterTurn);
  }

  /**
   * Resolves the input required to edit an existing turn.
   *
   * @param editTarget - Turn selected for editing.
   * @param match - Match containing the edited turn.
   * @param checkouts - Available checkout suggestions.
   * @returns The resolved edit-turn input, or null when required match data
   * cannot be resolved or the dialog flow is dismissed.
   */
  async resolveEditTurnInput(
    editTarget: MatchScoreTableEditTarget,
    match: X01Match,
    checkouts: X01CheckoutsMap
  ): Promise<EditTurnInput | null> {
    // Resolve the leg and player's last turn.
    const legEntry = getLegInMatch(match, editTarget.setNumber, editTarget.legNumber);
    if (legEntry === null) return null;

    const lastTurn = getLastTurnForPlayerInLeg(legEntry.leg, editTarget.playerId);
    if (lastTurn === null) return null;

    // Run the edit-specific dialog flow.
    const turnInput = await this.runEditTurnDialogs(editTarget, match, legEntry.leg, lastTurn, checkouts);
    if (turnInput === null) return null;

    // Build the input required to edit the turn.
    return {
      playerId: editTarget.playerId,
      setNumber: editTarget.setNumber,
      legNumber: editTarget.legNumber,
      roundNumber: editTarget.roundNumber,
      score: turnInput.score,
      checkoutDartsUsed: turnInput.checkoutDartsUsed,
      doublesMissed: turnInput.doublesMissed
    };
  }

  /**
   * Runs the edit-specific turn dialogs.
   *
   * Opens the score dialog, resolves the resulting checkout and then runs the
   * dialogs shared with create-turn input.
   *
   * @param editTarget - Turn selected for editing.
   * @param match - Match containing the edited turn.
   * @param leg - Leg containing the edited turn.
   * @param lastTurn - Player's last turn in the leg before the edit.
   * @param checkouts - Available checkout suggestions.
   * @returns The resolved turn input, or null when the dialog flow is dismissed.
   */
  private async runEditTurnDialogs(
    editTarget: MatchScoreTableEditTarget,
    match: X01Match,
    leg: X01Leg,
    lastTurn: X01Turn,
    checkouts: X01CheckoutsMap
  ): Promise<TurnInput | null> {
    // Open the edit-score dialog.
    const scoreResult = await this.openEditScoreDialog(editTarget);
    if (scoreResult.status === 'dismissed') return null;

    const newScore = scoreResult.value;

    // Calculate the player's remaining score after applying the edit.
    const remainingAfterEdit = lastTurn.remaining + editTarget.currentTurn.score - newScore;

    // Resolve the score representing the checkout after the edit.
    const checkoutScore = isLastRoundForPlayerInLeg(leg, editTarget.playerId, editTarget.roundNumber)
      ? newScore
      : lastTurn.score;

    const checkout = this.resolveCheckout(checkoutScore, remainingAfterEdit, checkouts);

    // Run the shared turn dialogs.
    return this.runTurnDialogs(newScore, checkout, match.matchSettings.trackDoubles, remainingAfterEdit);
  }

  /**
   * Runs the dialogs shared by create-turn and edit-turn input.
   *
   * @param score - Score to include in the resolved turn input.
   * @param checkout - Checkout that applies to the turn, if any.
   * @param trackDoubles - Whether doubles missed are tracked for the match.
   * @param remaining - Remaining score after applying the turn.
   * @returns The resolved turn input, or null when the dialog flow is dismissed.
   */
  private async runTurnDialogs(
    score: number,
    checkout: X01Checkout | null,
    trackDoubles: boolean,
    remaining: number
  ): Promise<TurnInput | null> {
    // Resolve checkout darts used.
    const checkoutDartsUsedResult = await this.resolveCheckoutDartsUsed(checkout);
    if (checkoutDartsUsedResult.status === 'dismissed') return null;

    // Resolve doubles missed.
    const doublesMissedResult = await this.resolveDoublesMissed(trackDoubles, remaining);
    if (doublesMissedResult.status === 'dismissed') return null;

    return {
      score: score,
      checkoutDartsUsed: checkoutDartsUsedResult.value,
      doublesMissed: doublesMissedResult.value
    };
  }

  /**
   * Resolves a checkout for the supplied score when the resulting remaining
   * score finishes the leg.
   *
   * @param score - Score representing the checkout.
   * @param remaining - Remaining score after applying the turn.
   * @param checkouts - Available checkout suggestions.
   * @returns The matching checkout, or null when no checkout applies.
   */
  private resolveCheckout(score: number, remaining: number, checkouts: X01CheckoutsMap): X01Checkout | null {
    if (remaining !== 0) {
      return null;
    }

    return checkouts.get(score) ?? null;
  }

  /**
   * Opens the edit-score dialog for a turn.
   *
   * @param editTarget - Turn selected for editing.
   * @returns Result of the edit-score dialog.
   */
  private openEditScoreDialog(editTarget: MatchScoreTableEditTarget): Promise<DialogResult<number>> {
    return this.matchDialogService.openEditScoreDialog({
      playerName: editTarget.playerName,
      setNumber: editTarget.setNumber,
      legNumber: editTarget.legNumber,
      roundNumber: editTarget.roundNumber,
      currentScore: editTarget.currentTurn.score
    });
  }

  /**
   * Resolves the checkout darts used for a turn.
   *
   * When no checkout applies, the value resolves to null without opening a dialog.
   *
   * @param checkout - Checkout that applies to the turn, if any.
   * @returns Resolved checkout darts used, or a dismissed result when the dialog is dismissed.
   */
  private async resolveCheckoutDartsUsed(checkout: X01Checkout | null): Promise<DialogResult<number | null>> {
    if (checkout === null) {
      return {status: 'confirmed', value: null};
    }

    return this.matchDialogService.openCheckoutDartsUsedDialog(checkout);
  }

  /**
   * Resolves the doubles missed for a turn.
   *
   * When doubles are not tracked, the value resolves to null. When no double
   * can be attempted, the value resolves to zero without opening a dialog.
   *
   * @param trackDoubles - Whether doubles missed are tracked for the match.
   * @param remaining - Remaining score after applying the turn.
   * @returns Resolved doubles missed, or a dismissed result when the dialog is dismissed.
   */
  private async resolveDoublesMissed(trackDoubles: boolean, remaining: number): Promise<DialogResult<number | null>> {
    if (!trackDoubles) {
      return {status: 'confirmed', value: null};
    }

    if (remaining > MAX_DOUBLE_SCORE) {
      return {status: 'confirmed', value: 0};
    }

    return this.matchDialogService.openDoublesMissedDialog();
  }
}
