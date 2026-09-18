import {Pipe, PipeTransform} from '@angular/core';
import {X01MatchSettings} from '../../../../../data/model/x01/match/x01-match-settings';
import {formatCount} from '../../../../../shared/utils/number.util';

/**
 * Formats the final-set clear-by-two summary displayed by Recent Matches.
 */
@Pipe({
  name: 'finalSetClearByTwoSummary'
})
export class FinalSetClearByTwoSummaryPipe implements PipeTransform {

  /**
   * Formats the final-set clear-by-two rule and its extra-leg limit.
   *
   * Example: `Clear by two in final set, max 2 extra legs`.
   * Returns an empty string when the rule is disabled.
   *
   * @param bestOf - Best-of configuration containing the final-set rule.
   * @returns Formatted final-set clear-by-two summary, or an empty string when disabled.
   */
  transform(bestOf: X01MatchSettings['bestOf']): string {
    const rule = bestOf.clearByTwoLegsInFinalSetRule;

    if (!rule.enabled) {
      return '';
    }

    return `Clear by two in final set, max ${formatCount(rule.limit, 'extra leg', 'extra legs')}`;
  }
}
