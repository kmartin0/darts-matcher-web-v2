import {Pipe, PipeTransform} from '@angular/core';
import {X01Match} from '../../../../../data/model/x01/x01-match';
import {X01BestOfType} from '../../../../../data/model/x01/x01-best-of-type';
import {formatCount} from '../../../../../shared/utils/number.util';

@Pipe({
  name: 'x01BestOfSets',
  pure: true,
})
export class X01BestOfSetsPipe implements PipeTransform {

  /**
   * Formats the best-of-sets configuration for an X01 match.
   *
   * Returns an empty string when the match is not set-based.
   * When clear-by-two sets is enabled, the configured extra-set limit is included.
   *
   * @param match - Match to format the best-of-sets configuration for.
   * @returns Formatted best-of-sets configuration, or an empty string when not applicable.
   */
  transform(match: X01Match): string {
    const bestOf = match.matchSettings.bestOf;

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
