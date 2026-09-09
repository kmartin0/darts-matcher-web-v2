import {Component, computed, input} from '@angular/core';
import {MatCard} from '@angular/material/card';
import {ResultType} from '../../../../data/model/base-match/result-type';
import {MatchPlayerCardData} from './match-player-card-data';
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

  protected readonly isWinOrDraw = computed<boolean>(() =>
    this.data().playerResult === ResultType.WIN ||
    this.data().playerResult === ResultType.DRAW
  );

  protected readonly isCurrentThrower = computed<boolean>(() =>
    this.data().playerId === this.data().currentThrowerId
  );

  protected readonly isLegStarter = computed<boolean>(() =>
    this.data().startsLegPlayerId === this.data().playerId
  );
}
