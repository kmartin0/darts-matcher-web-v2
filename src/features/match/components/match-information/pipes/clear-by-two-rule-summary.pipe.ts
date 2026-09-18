import {Pipe, PipeTransform} from '@angular/core';
import {X01ClearByTwoRule} from '../../../../../data/model/x01/rules/x01-clear-by-two-rule';

/**
 * Formats the clear-by-two rule summary displayed in Match Information.
 */
@Pipe({
  name: 'clearByTwoRuleSummary'
})
export class ClearByTwoRuleSummaryPipe implements PipeTransform {

  /**
   * Formats whether a clear-by-two rule is enabled and its configured limit.
   *
   * Returns `No` when disabled or `Yes - Limit N` when enabled.
   *
   * @param rule - Clear-by-two rule to format.
   * @returns Formatted clear-by-two rule summary.
   */
  transform(rule: X01ClearByTwoRule): string {
    return rule.enabled
      ? `Yes - Limit ${rule.limit}`
      : 'No';
  }
}
