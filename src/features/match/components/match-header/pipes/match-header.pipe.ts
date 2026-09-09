import {Pipe, PipeTransform} from '@angular/core';
import {X01Match} from '../../../../../data/model/x01/match/x01-match';
import {X01BestOfType} from '../../../../../data/model/x01/rules/x01-best-of-type';
import {X01MatchSettings} from '../../../../../data/model/x01/match/x01-match-settings';
import {formatCount} from '../../../../../shared/utils/number.util';

export interface MatchHeaderPipeData {
  matchSettings: X01MatchSettings;
  matchType: X01Match['matchType'];
}

/**
 * Formats match information for display in the match header.
 */
@Pipe({
  name: 'matchHeader'
})
export class MatchHeaderPipe implements PipeTransform {

  /**
   * Formats match information as a user-friendly match header.
   *
   * @param data - Match header data to format.
   * @returns Formatted match header.
   */
  transform(data: MatchHeaderPipeData): string {
    const matchSettings = data.matchSettings;
    const headerParts = [this.getBestOf(matchSettings)];

    if (this.hasClearByTwo(matchSettings)) {
      headerParts.push('Clear by two');
    }

    headerParts.push(`${data.matchType} (${matchSettings.x01})`);

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
      case X01BestOfType.SETS: {
        const formattedSets = formatCount(matchSettings.bestOf.sets, 'set', 'sets');

        return `Best of ${formattedSets} (BO${matchSettings.bestOf.legs})`;
      }

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
