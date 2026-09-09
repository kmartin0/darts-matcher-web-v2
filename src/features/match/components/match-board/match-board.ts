import {Component, input, linkedSignal, output, signal} from '@angular/core';
import {X01Match} from '../../../../data/model/x01/x01-match';
import {MatchHeader} from '../match-header/match-header';
import {MatchPlayerCards} from '../match-player-cards/match-player-cards';
import {LegSelection} from './leg-selection';
import {X01CheckoutsMap} from '../../../../data/model/x01/x01-checkout';
import {MatchEditControls} from '../match-edit-controls/match-edit-controls';

@Component({
  selector: 'app-match-board',
  templateUrl: './match-board.html',
  styleUrl: './match-board.scss',
  imports: [
    MatchHeader,
    MatchPlayerCards,
    MatchEditControls
  ]
})
export class MatchBoard {
  readonly match = input.required<X01Match>();
  readonly checkouts = input.required<X01CheckoutsMap>();

  readonly legSelection = linkedSignal<LegSelection>(() =>
    this.createLastLegSelection(this.match())
  );

  readonly deleteLastTurn = output<void>();

  readonly isEditMode = signal(false);

  /**
   * Updates the currently selected leg.
   *
   * @param legSelection - Leg selection to display.
   */
  onLegSelectionChange(legSelection: LegSelection): void {
    this.legSelection.set(legSelection);
  }

  /**
   * Toggles score editing mode.
   */
  onToggleEditMode(): void {
    this.isEditMode.update(isEditMode => !isEditMode);
  }

  /**
   * Creates a leg selection for the last leg in a match.
   *
   * @param match - Match containing the sets and legs.
   * @returns Selection containing the last set and leg.
   */
  private createLastLegSelection(match: X01Match): LegSelection {
    const setEntry = match.sets.at(-1)!;
    const legEntry = setEntry.set.legs.at(-1)!;

    return {
      setEntry,
      legEntry
    };
  }
}
