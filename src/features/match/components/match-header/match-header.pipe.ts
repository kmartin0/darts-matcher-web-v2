import {Pipe, PipeTransform} from '@angular/core';
import {X01Match} from '../../../../data/model/x01/x01-match';
import {X01MatchSettings} from '../../../../data/model/x01/x01-match-settings';
import {X01BestOfType} from '../../../../data/model/x01/x01-best-of-type';
import {formatCount} from '../../../../shared/utils/number.util';


/**
 * Formats match information for display in the match header.
 */
@Pipe({
  name: 'matchHeader'
})
export class MatchHeaderPipe implements PipeTransform {

  /**
   * Formats a match as a user-friendly match header.
   *
   * @param match - Match to format.
   * @returns Formatted match header, or null when no match is provided.
   */
  transform(match: X01Match): string {
    const matchSettings = match.matchSettings;
    const headerParts = [this.getBestOf(matchSettings)];

    // Include clear-by-two when any clear-by-two rule is enabled.
    if (this.hasClearByTwo(matchSettings)) {
      headerParts.push('Clear by two');
    }

    headerParts.push(`${match.matchType} (${matchSettings.x01})`);

    return headerParts.join(' | ');
  }

  /**
   * Formats the best-of settings for the match header.
   *
   * @param matchSettings - Match settings containing the best-of configuration.
   * @returns Formatted best-of description.
   */
  private getBestOf(matchSettings: X01MatchSettings): string {
    switch (matchSettings.bestOf.bestOfType) {
      case X01BestOfType.SETS:
        return `Best of ${formatCount(matchSettings.bestOf.sets, 'set', 'sets')} (BO${matchSettings.bestOf.legs})`;

      case X01BestOfType.LEGS:
        return `Best of ${formatCount(matchSettings.bestOf.legs, 'leg', 'legs')}`;
    }
  }

  /**
   * Checks whether any clear-by-two rule is enabled.
   *
   * @param matchSettings - Match settings containing the clear-by-two rules.
   * @returns Whether any clear-by-two rule is enabled.
   */
  private hasClearByTwo(matchSettings: X01MatchSettings): boolean {
    const bestOfSettings = matchSettings.bestOf;

    return bestOfSettings.clearByTwoSetsRule.enabled ||
      bestOfSettings.clearByTwoLegsRule.enabled ||
      bestOfSettings.clearByTwoLegsInFinalSetRule.enabled;
  }
}
