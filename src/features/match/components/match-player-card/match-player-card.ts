import {Component, input} from '@angular/core';
import {MatCard} from '@angular/material/card';
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
}
