import {Component, computed, input, linkedSignal, output, signal, viewChild} from '@angular/core';
import {X01CheckoutsMap} from '../../../../data/model/x01/checkout/x01-checkout';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {MatchEditControls} from '../match-edit-controls/match-edit-controls';
import {MatchHeader} from '../match-header/match-header';
import {MatchPlayerCards} from '../match-player-cards/match-player-cards';
import {isCurrentLegSelected, isCurrentOrLastLegSelected, LegSelection} from './leg-selection';
import {MatchScoreTable} from '../match-score-table/match-score-table';
import {MatchScoreTableEditTarget} from '../match-score-table/match-score-table-edit-target';
import {MatchScoreInput} from '../match-score-input/match-score-input';
import {ErrorMessage} from '../../../../shared/components/error-message/error-message';
import {MatchStatus} from '../../../../data/model/base-match/match-status';

@Component({
  selector: 'app-match-board',
  templateUrl: './match-board.html',
  styleUrl: './match-board.scss',
  imports: [
    MatchHeader,
    MatchPlayerCards,
    MatchEditControls,
    MatchScoreTable,
    MatchScoreInput,
    ErrorMessage
  ]
})
export class MatchBoard {
  readonly match = input.required<X01Match>();
  readonly checkouts = input.required<X01CheckoutsMap>();
  readonly scoreInputError = input<string | null>(null);

  readonly deleteLastTurn = output<void>();
  readonly editTurn = output<MatchScoreTableEditTarget>();
  readonly submitScore = output<number>();

  private readonly scoreInput = viewChild(MatchScoreInput);

  protected readonly legSelection = linkedSignal<X01Match, LegSelection>({
    source: this.match,
    computation: (currentMatch, previous) => {
      const previousMatch = previous?.source;
      const previousLegSelection = previous?.value;

      return this.createLegSelection(currentMatch, previousMatch, previousLegSelection);
    }
  });

  protected readonly isEditMode = signal<boolean>(false);

  protected readonly isScoreInputVisible = computed<boolean>(() => {
    const match = this.match();

    return match.matchStatus === MatchStatus.IN_PLAY && isCurrentLegSelected(match, this.legSelection());
  });

  /**
   * Clears the currently entered score.
   */
  clearScoreInput(): void {
    this.scoreInput()?.clear();
  }

  /**
   * Updates the currently selected leg.
   *
   * @param legSelection - Leg selection to display.
   */
  protected onLegSelectionChange(legSelection: LegSelection): void {
    this.legSelection.set(legSelection);
  }

  /**
   * Toggles score editing mode.
   */
  protected onToggleEditMode(): void {
    this.isEditMode.update(isEditMode => !isEditMode);
  }

  /**
   * Resolves the leg selection for a new match snapshot.
   *
   * Continues following the latest leg when the previous current leg was selected.
   * Otherwise preserves the deliberately selected leg using entries from the new match snapshot.
   *
   * @param match - Updated match.
   * @param previousMatch - Previous match snapshot.
   * @param previousLegSelection - Previous leg selection.
   * @returns Leg selection for the updated match.
   */
  private createLegSelection(match: X01Match, previousMatch: X01Match | undefined, previousLegSelection: LegSelection | undefined): LegSelection {
    // When there is no previous selection, create a leg selection for the last leg.
    if (previousMatch === undefined || previousLegSelection === undefined) {
      return this.createLegSelectionForLastLeg(match);
    }

    // When the previous leg selection was the leg in play, create a leg selection for the last leg.
    if (isCurrentOrLastLegSelected(previousMatch, previousLegSelection)) {
      return this.createLegSelectionForLastLeg(match);
    }

    // Otherwise preserve the previous leg selection using entries from the updated match.
    const previousLegSelectionFromMatch = this.createLegSelectionForLeg(
      match,
      previousLegSelection.setEntry.setNumber,
      previousLegSelection.legEntry.legNumber
    );

    return previousLegSelectionFromMatch ?? this.createLegSelectionForLastLeg(match);
  }

  /**
   * Creates a leg selection for the given set and leg numbers.
   *
   * @param match - Match containing the sets and legs.
   * @param setNumber - Set number to select.
   * @param legNumber - Leg number to select within the set.
   * @returns Matching leg selection, or null when the set or leg does not exist.
   */
  private createLegSelectionForLeg(match: X01Match, setNumber: number, legNumber: number): LegSelection | null {
    const setEntry = match.sets.find(setEntry => setEntry.setNumber === setNumber);
    const legEntry = setEntry?.set.legs.find(legEntry => legEntry.legNumber === legNumber);

    if (setEntry === undefined || legEntry === undefined) {
      return null;
    }

    return {
      setEntry: setEntry,
      legEntry: legEntry
    };
  }

  /**
   * Creates a leg selection for the last leg in a match.
   *
   * @param match - Match containing the sets and legs.
   * @returns Selection containing the last set and leg.
   */
  private createLegSelectionForLastLeg(match: X01Match): LegSelection {
    const setEntry = match.sets.at(-1)!;
    const legEntry = setEntry.set.legs.at(-1)!;

    return {
      setEntry: setEntry,
      legEntry: legEntry
    };
  }
}
