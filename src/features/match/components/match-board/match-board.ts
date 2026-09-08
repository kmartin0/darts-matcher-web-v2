import {Component, computed, input} from '@angular/core';
import {X01Match} from '../../../../data/model/x01/x01-match';
import {MatchHeader} from '../match-header/match-header';
import {MatchPlayerCards} from '../match-player-cards/match-player-cards';
import {LegSelection} from './leg-selection';
import {X01CheckoutsMap} from '../../../../data/model/x01/x01-checkout';

@Component({
  selector: 'app-match-board',
  templateUrl: './match-board.html',
  styleUrl: './match-board.scss',
  imports: [
    MatchHeader,
    MatchPlayerCards
  ]
})
export class MatchBoard {
  readonly match = input.required<X01Match>();
  readonly checkouts = input.required<X01CheckoutsMap>();

  readonly legSelection = computed<LegSelection>(() => {
    const setEntry = this.match().sets.at(-1)!;
    const legEntry = setEntry.set.legs.at(-1)!;

    return {
      setEntry,
      legEntry
    };
  });
}
