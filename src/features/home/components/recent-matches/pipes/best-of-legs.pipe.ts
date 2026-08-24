import {Pipe, PipeTransform} from '@angular/core';
import {X01Match} from '../../../../../data/model/x01/x01-match';
import {formatCount} from '../../../../../shared/utils/number.util';

@Pipe({
  name: 'bestOfLegs',
  pure: true,
})
export class BestOfLegsPipe implements PipeTransform {

  /**
   * Formats the best-of-legs configuration for a match.
   *
   * When clear-by-two legs is enabled, the configured extra-leg limit is included.
   *
   * @param match - Match to format the best-of-legs configuration for.
   * @returns Formatted best-of-legs configuration.
   */
  transform(match: X01Match): string {
    const bestOf = match.matchSettings.bestOf;

    const formattedBestOf =
      `Best of ${formatCount(bestOf.legs, 'leg', 'legs')}`;

    const formattedClearByTwo =
      `Clear by two, max ${formatCount(
        bestOf.clearByTwoLegsRule.limit,
        'extra leg',
        'extra legs'
      )}`;

    return bestOf.clearByTwoLegsRule.enabled
      ? `${formattedBestOf} - ${formattedClearByTwo}`
      : formattedBestOf;
  }
}
