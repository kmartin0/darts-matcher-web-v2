import {Pipe, PipeTransform} from '@angular/core';
import {X01MatchSettings} from '../../../../../data/model/x01/match/x01-match-settings';
import {formatCount} from '../../../../../shared/utils/number.util';

@Pipe({
  name: 'clearByTwoFinalSetRule'
})
export class ClearByTwoFinalSetRulePipe implements PipeTransform {

  /**
   * Formats the final-set clear-by-two configuration.
   *
   * Returns an empty string when clear-by-two legs in the final set is disabled.
   *
   * @param bestOf - Best-of configuration containing the final-set rule.
   * @returns Formatted final-set clear-by-two configuration, or an empty string when disabled.
   */
  transform(bestOf: X01MatchSettings['bestOf']): string {
    const rule = bestOf.clearByTwoLegsInFinalSetRule;

    if (!rule.enabled) {
      return '';
    }

    return `Clear by two in final set, max ${formatCount(rule.limit, 'extra leg', 'extra legs')}`;
  }
}
