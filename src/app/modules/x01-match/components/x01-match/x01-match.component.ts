import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {NgIf} from '@angular/common';
import {MatOptgroup, MatOption, MatSelect} from '@angular/material/select';
import {MatFormField} from '@angular/material/input';
import {MatLabel} from '@angular/material/form-field';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {X01MatchInfoComponent} from '../x01-match-info/x01-match-info.component';
import {X01MatchPlayerCardsComponent} from '../x01-match-player-cards/x01-match-player-cards.component';
import {X01MatchLegTableComponent} from '../x01-match-leg-table/x01-match-leg-table.component';
import {LegSelection} from '../../../../models/common/leg-selection';

@Component({
  selector: 'app-x01-match',
  imports: [
    MatFormField,
    MatSelect,
    MatLabel,
    MatOption,
    MatOptgroup,
    MatIconButton,
    MatIcon,
    MatButton,
    ReactiveFormsModule,
    NgIf,
    X01MatchInfoComponent,
    X01MatchPlayerCardsComponent,
    X01MatchLegTableComponent
  ],
  standalone: true,
  templateUrl: './x01-match.component.html',
  styleUrl: './x01-match.component.scss'
})
export class X01MatchComponent implements OnChanges {
  @Input() match: X01Match | null = null;
  readonly selectedLegControl = new FormControl<LegSelection>({set: 0, leg: 0});

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
   * Selects the current leg in play if available; otherwise selects the last leg in the match.
   * Sets the selected leg control to update the dropdown and table accordingly.
   */
  selectCurrentOrLastLeg() {
    let selection: LegSelection = {set: 0, leg: 0};
    if (this.match) {
      const setAndLegInPlay = this.getSetAndLegInPlay(this.match);
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

    this.selectedLegControl.setValue(selection);
  }

  /**
   * Retrieves the set and leg currently in play based on the match progress.
   *
   * @param match - The current X01Match object
   * @returns The current set and leg numbers, or undefined if none in play
   */
  getSetAndLegInPlay(match: X01Match): LegSelection | undefined {
    const matchProgress = match.matchProgress;
    const setInPlay = match.sets.find(set => set.set === matchProgress.currentSet);
    const legInPlay = setInPlay?.legs.find(leg => leg.leg === matchProgress.currentLeg);

    if (!setInPlay || !legInPlay) return undefined;

    return {set: setInPlay.set, leg: legInPlay.leg};
  }

  /**
   * Compares two leg selection objects for equality.
   * Used by Angular Material select to correctly match selected option.
   *
   * @param option - Option leg selection object
   * @param selection - Currently selected leg selection object
   * @returns True if both selections have the same set and leg numbers, false otherwise
   */
  compareLegSelection(option: { set: number; leg: number }, selection: { set: number; leg: number }): boolean {
    return option?.set === selection?.set && option?.leg === selection?.leg;
  }

}
