import {Component, computed, input, output} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {X01Match} from '../../../../data/model/x01/x01-match';
import {LegSelection} from '../match-board/leg-selection';
import {MatchLegSelectionForm} from '../match-leg-selection-form/match-leg-selection-form';

@Component({
  selector: 'app-match-edit-controls',
  templateUrl: './match-edit-controls.html',
  imports: [
    MatIconButton,
    MatTooltip,
    MatIcon,
    MatchLegSelectionForm
  ],
  styleUrl: './match-edit-controls.scss'
})
export class MatchEditControls {
  readonly match = input.required<X01Match>();
  readonly legSelection = input.required<LegSelection>();

  readonly legSelectionChange = output<LegSelection>();
  readonly deleteLastTurn = output<void>();
  readonly toggleEditMode = output<void>();

  readonly canUndoScore = computed(() => {
    return this.matchContainsAnyTurn(this.match()) && this.isLastLegSelected(this.match(), this.legSelection());
  });

  /**
   * Checks whether the match contains at least one turn.
   *
   * @param match - Match to check.
   * @returns Whether the match contains at least one turn.
   */
  private matchContainsAnyTurn(match: X01Match): boolean {
    return match.sets.some(setEntry =>
      setEntry.set.legs.some(legEntry =>
        legEntry.leg.rounds.some(roundEntry =>
          Object.keys(roundEntry.round.turns).length > 0
        )
      )
    );
  }

  /**
   * Checks whether the currently selected leg is the last leg in the match.
   *
   * @param match - Match containing the sets and legs.
   * @param legSelection - Currently selected leg.
   * @returns Whether the selected leg is the last leg.
   */
  private isLastLegSelected(match: X01Match, legSelection: LegSelection): boolean {
    const lastSetEntry = match.sets.at(-1);
    const lastLegEntry = lastSetEntry?.set.legs.at(-1);

    return legSelection.setEntry.setNumber === lastSetEntry?.setNumber &&
      legSelection.legEntry.legNumber === lastLegEntry?.legNumber;
  }
}
