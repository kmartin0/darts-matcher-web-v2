import {Pipe, PipeTransform} from '@angular/core';
import {X01MatchSettings} from '../../../../../data/model/x01/x01-match-settings';
import {X01BestOfType} from '../../../../../data/model/x01/x01-best-of-type';
import {formatCount} from '../../../../../shared/utils/number.util';

@Pipe({
  name: 'bestOfSetsRule'
})
export class BestOfSetsRulePipe implements PipeTransform {

  /**
   * Formats the best-of-sets configuration.
   *
   * Returns an empty string when the match is not set-based.
   * When clear-by-two sets is enabled, the configured extra-set limit is included.
   *
   * @param bestOf - Best-of configuration to format.
   * @returns Formatted best-of-sets configuration, or an empty string when not applicable.
   */
  transform(bestOf: X01MatchSettings['bestOf']): string {
    if (bestOf.bestOfType !== X01BestOfType.SETS) return '';

    const formattedBestOf =
      `Best of ${formatCount(bestOf.sets, 'set', 'sets')}`;

    const formattedClearByTwo =
      `Clear by two, max ${formatCount(
        bestOf.clearByTwoSetsRule.limit,
        'extra set',
        'extra sets'
      )}`;

    return bestOf.clearByTwoSetsRule.enabled
      ? `${formattedBestOf} - ${formattedClearByTwo}`
      : formattedBestOf;
  }
}
