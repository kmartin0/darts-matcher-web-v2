import {Component, input, linkedSignal, output, signal} from '@angular/core';
import {X01CheckoutsMap} from '../../../../data/model/x01/checkout/x01-checkout';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {MatchEditControls} from '../match-edit-controls/match-edit-controls';
import {MatchHeader} from '../match-header/match-header';
import {MatchPlayerCards} from '../match-player-cards/match-player-cards';
import {LegSelection} from './leg-selection';

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

  readonly deleteLastTurn = output<void>();

  protected readonly legSelection = linkedSignal<LegSelection>(() =>
    this.createLastLegSelection(this.match())
  );

  protected readonly isEditMode = signal<boolean>(false);

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
   * Creates a leg selection for the last leg in a match.
   *
   * @param match - Match containing the sets and legs.
   * @returns Selection containing the last set and leg.
   */
  private createLastLegSelection(match: X01Match): LegSelection {
    const setEntry = match.sets.at(-1)!;
    const legEntry = setEntry.set.legs.at(-1)!;

    return {
      setEntry: setEntry,
      legEntry: legEntry
    };
  }
}
