import {Component, computed, input} from '@angular/core';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {MatCard, MatCardContent} from '@angular/material/card';
import {X01BestOfType} from '../../../../data/model/x01/rules/x01-best-of-type';

@Component({
  selector: 'app-match-statistics',
  imports: [
    MatCard,
    MatCardContent
  ],
  templateUrl: './match-statistics.html',
  styleUrl: './match-statistics.scss'
})
export class MatchStatistics {
  readonly match = input.required<X01Match>();

  /**
   * Whether the match is decided by sets.
   */
  protected readonly isBestOfSets = computed<boolean>(() =>
    this.match().matchSettings.bestOf.bestOfType === X01BestOfType.SETS
  );

  /**
   * Whether the match is tracking doubles.
   */
  protected readonly isTrackDoubles = computed<boolean>(() =>
    this.match().matchSettings.trackDoubles
  );
}
