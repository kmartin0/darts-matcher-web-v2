import {Pipe, PipeTransform} from '@angular/core';
import {X01MatchSettings} from '../../../../../data/model/x01/match/x01-match-settings';
import {formatCount} from '../../../../../shared/utils/number.util';

/**
 * Formats the best-of-legs summary displayed by Recent Matches.
 */
@Pipe({
  name: 'bestOfLegsSummary'
})
export class BestOfLegsSummaryPipe implements PipeTransform {

  /**
   * Formats the number of legs and, when enabled, the clear-by-two limit.
   *
   * Examples: `Best of 5 legs` or `Best of 5 legs - Clear by two, max 2 extra legs`.
   *
   * @param bestOf - Best-of configuration to format.
   * @returns Formatted best-of-legs summary.
   */
  transform(bestOf: X01MatchSettings['bestOf']): string {
    const formattedBestOf = `Best of ${formatCount(bestOf.legs, 'leg', 'legs')}`;

    if (!bestOf.clearByTwoLegsRule.enabled) {
      return formattedBestOf;
    }

    const formattedClearByTwo =
      `Clear by two, max ${formatCount(bestOf.clearByTwoLegsRule.limit, 'extra leg', 'extra legs')}`;

    return `${formattedBestOf} - ${formattedClearByTwo}`;
  }
}
