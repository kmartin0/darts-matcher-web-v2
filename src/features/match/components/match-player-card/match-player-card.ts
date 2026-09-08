import {Component, computed, input} from '@angular/core';
import {MatchPlayerCardData} from './match-player-card-data';
import {ResultType} from '../../../../data/model/match/result-type';
import {MatCard} from '@angular/material/card';
import {PlayerScorePipe} from './pipes/player-score.pipe';
import {SuggestedCheckoutPipe} from './pipes/suggested-checkout.pipe';

@Component({
  selector: 'app-match-player-card',
  templateUrl: './match-player-card.html',
  styleUrl: './match-player-card.scss',
  imports: [
    MatCard,
    PlayerScorePipe,
    SuggestedCheckoutPipe
  ]
})
export class MatchPlayerCard {
  readonly data = input.required<MatchPlayerCardData>();

  readonly winOrDraw = computed(() =>
    this.data().playerResult === ResultType.WIN ||
    this.data().playerResult === ResultType.DRAW
  );

  readonly isCurrentThrower = computed(() =>
    this.data().playerId === this.data().currentThrowerId
  );

  readonly isStartsLeg = computed(() =>
    this.data().startsLegPlayerId === this.data().playerId
  );
}
