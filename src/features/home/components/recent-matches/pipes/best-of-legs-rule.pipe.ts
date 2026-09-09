import {Pipe, PipeTransform} from '@angular/core';
import {X01MatchSettings} from '../../../../../data/model/x01/match/x01-match-settings';
import {formatCount} from '../../../../../shared/utils/number.util';

@Pipe({
  name: 'bestOfLegsRule'
})
export class BestOfLegsRulePipe implements PipeTransform {

  /**
   * Formats the best-of-legs configuration.
   *
   * When clear-by-two legs is enabled, the configured extra-leg limit is included.
   *
   * @param bestOf - Best-of configuration to format.
   * @returns Formatted best-of-legs configuration.
   */
  transform(bestOf: X01MatchSettings['bestOf']): string {
    const formattedBestOf = `Best of ${formatCount(bestOf.legs, 'leg', 'legs')}`;

    if (!bestOf.clearByTwoLegsRule.enabled) {
      return formattedBestOf;
    }

    const formattedClearByTwo = `Clear by two, max ${formatCount(bestOf.clearByTwoLegsRule.limit, 'extra leg', 'extra legs')}`;

    return `${formattedBestOf} - ${formattedClearByTwo}`;
  }
}
