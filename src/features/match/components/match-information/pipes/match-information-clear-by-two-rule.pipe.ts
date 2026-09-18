import {Pipe, PipeTransform} from '@angular/core';
import {X01ClearByTwoRule} from '../../../../../data/model/x01/rules/x01-clear-by-two-rule';

/**
 * Formats a clear-by-two rule for Match Information.
 */
@Pipe({name: 'matchInformationClearByTwoRule'})
export class MatchInformationClearByTwoRulePipe implements PipeTransform {
  /**
   * Formats whether a clear-by-two rule is enabled and its limit.
   *
   * @param rule - Clear-by-two rule to format.
   * @returns `No` when disabled, otherwise `Yes - Limit N`.
   */
  transform(rule: X01ClearByTwoRule): string {
    return rule.enabled
      ? `Yes - Limit ${rule.limit}`
      : 'No';
  }
}
