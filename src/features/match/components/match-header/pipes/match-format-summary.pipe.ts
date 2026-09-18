import {Pipe, PipeTransform} from '@angular/core';
import {X01Match} from '../../../../../data/model/x01/match/x01-match';
import {X01BestOfType} from '../../../../../data/model/x01/rules/x01-best-of-type';
import {X01MatchSettings} from '../../../../../data/model/x01/match/x01-match-settings';
import {formatCount} from '../../../../../shared/utils/number.util';

export interface MatchFormatSummaryPipeData {
  matchSettings: X01MatchSettings;
  matchType: X01Match['matchType'];
}

/**
 * Formats the match format summary displayed in the Match Header.
 */
@Pipe({
  name: 'matchFormatSummary'
})
export class MatchFormatSummaryPipe implements PipeTransform {

  /**
   * Formats the best-of configuration, clear-by-two state, match type, and starting score.
   *
   * Examples:
   * `Best of 5 legs | X01 (501)`
   * `Best of 3 sets (BO5) | Clear by two | X01 (501)`
   *
   * @param data - Match settings and match type to format.
   * @returns Formatted match format summary.
   */
  transform(data: MatchFormatSummaryPipeData): string {
    const matchSettings = data.matchSettings;
    const summaryParts = [this.getBestOf(matchSettings)];

    if (this.hasClearByTwo(matchSettings)) {
      summaryParts.push('Clear by two');
    }

    summaryParts.push(`${data.matchType} (${matchSettings.x01})`);

    return summaryParts.join(' | ');
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
