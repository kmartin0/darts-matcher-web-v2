import {Pipe, PipeTransform} from '@angular/core';
import {X01Match} from '../../../../../data/model/x01/x01-match';
import {formatCount} from '../../../../../shared/utils/number.util';

@Pipe({
  name: 'x01ClearByTwoFinalSet',
  pure: true,
})
export class X01ClearByTwoFinalSetPipe implements PipeTransform {

  /**
   * Formats the final-set clear-by-two configuration for an X01 match.
   *
   * Returns an empty string when clear-by-two legs in the final set is disabled.
   *
   * @param match - Match to format the final-set clear-by-two configuration for.
   * @returns Formatted final-set clear-by-two configuration, or an empty string when disabled.
   */
  transform(match: X01Match): string {
    const rule = match.matchSettings.bestOf.clearByTwoLegsInFinalSetRule;

    if (!rule.enabled) return '';

    return `Clear by two in final set, max ${formatCount(
      rule.limit,
      'extra leg',
      'extra legs'
    )}`;
  }
}
