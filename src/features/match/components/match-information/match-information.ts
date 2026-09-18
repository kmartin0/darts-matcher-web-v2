import {Component, computed, input} from '@angular/core';
import {MatCard, MatCardContent} from '@angular/material/card';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {MatchInformationPlayerResultPipe} from './pipes/match-information-player-result.pipe';
import {X01BestOfType} from '../../../../data/model/x01/rules/x01-best-of-type';
import {MatchInformationBestOfTypePipe} from './pipes/match-information-best-of-type.pipe';
import {MatchInformationClearByTwoRulePipe} from './pipes/match-information-clear-by-two-rule.pipe';
import {interval, map} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatchInformationDurationPipe} from './pipes/match-information-duration.pipe';
import {MatchInformationDatePipe} from './pipes/match-information-date.pipe';

@Component({
  selector: 'app-match-information',
  imports: [
    MatCard,
    MatCardContent,
    MatchInformationPlayerResultPipe,
    MatchInformationBestOfTypePipe,
    MatchInformationClearByTwoRulePipe,
    MatchInformationDurationPipe,
    MatchInformationDatePipe
  ],
  templateUrl: './match-information.html',
  styleUrl: './match-information.scss'
})
export class MatchInformation {
  readonly match = input.required<X01Match>();

  /**
   * Whether the match is decided by sets.
   */
  protected readonly isBestOfSets = computed<boolean>(() =>
    this.match().matchSettings.bestOf.bestOfType === X01BestOfType.SETS
  );

  /**
   * Current Unix timestamp, updated once per minute.
   */
  private readonly currentEpochSeconds = toSignal(
    interval(60_000).pipe(
      map(() => Math.floor(Date.now() / 1000))
    ),
    {initialValue: Math.floor(Date.now() / 1000)}
  );

  /**
   * Match duration in seconds.
   *
   * Calculates the duration through the recorded end timestamp when available,
   * or through the current timestamp while the match is still in play.
   */
  protected readonly matchDurationInSeconds = computed<number>(() => {
    const startTimestamp = this.match().startDate;
    const durationEndTimestamp =
      this.match().endDate ?? this.currentEpochSeconds();

    return Math.max(0, durationEndTimestamp - startTimestamp);
  });

  /**
   * Number of completed sets in the match.
   */
  protected readonly setsPlayed = computed<number>(() =>
    this.match().sets.filter(setEntry => setEntry.set.result !== null).length
  );

  /**
   * Number of completed legs across all sets in the match.
   */
  protected readonly legsPlayed = computed<number>(() =>
    this.match().sets
      .flatMap(setEntry => setEntry.set.legs)
      .filter(legEntry => legEntry.leg.winner !== null)
      .length
  );
}
