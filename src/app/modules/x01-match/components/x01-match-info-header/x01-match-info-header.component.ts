import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {BaseComponent} from '../../../../shared/components/base/base.component';
import {X01BestOfType} from '../../../../models/x01-match/x01-best-of-type';
import {X01MatchSettings} from '../../../../models/x01-match/x01-match-settings';

@Component({
  selector: 'app-x01-match-info-header',
  imports: [],
  standalone: true,
  templateUrl: './x01-match-info-header.component.html',
  styleUrl: './x01-match-info-header.component.scss'
})
export class X01MatchInfoHeaderComponent extends BaseComponent implements OnChanges {
  @Input() match: X01Match | null = null;
  matchInfoHeader: string | null = null;

  /**
   * Watches for changes to `match` input to update match info header.
   * @param changes - Object containing changes to input properties
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['match']) {
      this.updateMatchInfoHeader();
    }
  }

  /**
   * Initializes the match information header with a user-friendly string describing
   * the match format, best-of settings, match type, starting score (x01).
   * If there is no match, the string will be set to null.
   */
  private updateMatchInfoHeader() {
    if (!this.match) {
      this.matchInfoHeader = null;
      return;
    }

    const matchSettings = this.match.matchSettings;
    const bestOfStr = this.getBestOfStr(matchSettings);
    const clearByTwoStr = this.getClearByTwoStr(matchSettings);
    const matchType = this.match.matchType;
    const x01 = matchSettings.x01;

    const headerParts: string[] = [];
    headerParts.push(bestOfStr);
    if (clearByTwoStr) headerParts.push(clearByTwoStr);
    headerParts.push(`${matchType} (${x01})`);

    this.matchInfoHeader = headerParts.join(' | ');
  }

  private getBestOfStr(matchSettings: X01MatchSettings) {
    switch (matchSettings.bestOf.bestOfType) {
      case X01BestOfType.SETS: {
        const setLabel = matchSettings.bestOf.sets === 1 ? 'set' : 'sets';
        return `Best of ${matchSettings.bestOf.sets} ${setLabel} (BO${matchSettings.bestOf.legs})`;
      }
      case X01BestOfType.LEGS: {
        const legLabel = matchSettings.bestOf.legs === 1 ? 'leg' : 'legs';
        return `Best of ${matchSettings.bestOf.legs} ${legLabel}`;
      }
    }
  }

  private getClearByTwoStr(matchSettings: X01MatchSettings) {
    const bestOfSettings = matchSettings.bestOf;

    return (bestOfSettings.clearByTwoSetsRule.enabled ||
      bestOfSettings.clearByTwoLegsRule.enabled ||
      bestOfSettings.clearByTwoLegsInFinalSetRule.enabled
    ) ? 'Clear by two' : null;
  }
}
