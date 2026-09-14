import {Component, computed, input} from '@angular/core';
import {X01CheckoutsMap} from '../../../../data/model/x01/checkout/x01-checkout';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {LegSelection} from '../match-board/leg-selection';
import {MatchPlayerCard} from '../match-player-card/match-player-card';
import {MatchPlayerCardData} from '../match-player-card/match-player-card-data';
import {resolveMatchPlayerCards} from './match-player-cards.resolver';

@Component({
  selector: 'app-match-player-cards',
  imports: [
    MatchPlayerCard
  ],
  templateUrl: './match-player-cards.html',
  styleUrl: './match-player-cards.scss'
})
export class MatchPlayerCards {
  readonly match = input.required<X01Match>();
  readonly legSelection = input.required<LegSelection>();
  readonly checkouts = input.required<X01CheckoutsMap>();

  protected readonly playerCards = computed<MatchPlayerCardData[]>(() =>
    resolveMatchPlayerCards(
      this.match(),
      this.legSelection(),
      this.checkouts()
    )
  );
}
