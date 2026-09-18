import {Pipe, PipeTransform} from '@angular/core';
import {X01MatchSettings} from '../../../../../data/model/x01/match/x01-match-settings';
import {X01BestOfType} from '../../../../../data/model/x01/rules/x01-best-of-type';
import {formatCount} from '../../../../../shared/utils/number.util';

/**
 * Formats the best-of-sets summary displayed by Recent Matches.
 */
@Pipe({
  name: 'bestOfSetsSummary'
})
export class BestOfSetsSummaryPipe implements PipeTransform {

  /**
   * Formats the number of sets and, when enabled, the clear-by-two limit.
   *
   * Examples: `Best of 3 sets` or `Best of 3 sets - Clear by two, max 2 extra sets`.
   * Returns an empty string when the match is decided by legs.
   *
   * @param bestOf - Best-of configuration to format.
   * @returns Formatted best-of-sets summary, or an empty string when not applicable.
   */
  transform(bestOf: X01MatchSettings['bestOf']): string {
    if (bestOf.bestOfType !== X01BestOfType.SETS) {
      return '';
    }

    const formattedBestOf = `Best of ${formatCount(bestOf.sets, 'set', 'sets')}`;

    if (!bestOf.clearByTwoSetsRule.enabled) {
      return formattedBestOf;
    }

    const formattedClearByTwo =
      `Clear by two, max ${formatCount(bestOf.clearByTwoSetsRule.limit, 'extra set', 'extra sets')}`;

    return `${formattedBestOf} - ${formattedClearByTwo}`;
  }
}
