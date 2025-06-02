import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {X01Match} from '../../../../models/x01-match/x01-match';

@Component({
  selector: 'app-x01-match-info',
  imports: [],
  standalone: true,
  templateUrl: './x01-match-info.component.html',
  styleUrl: './x01-match-info.component.scss'
})
export class X01MatchInfoComponent implements OnChanges {
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
    const bestOf = matchSettings.bestOf.sets > 1
      ? `Best of ${matchSettings.bestOf.sets} sets (BO${matchSettings.bestOf.legs})`
      : `Best of ${matchSettings.bestOf.legs} legs`;

    const matchType = this.match.matchType;
    const x01 = matchSettings.x01;
    this.matchInfoHeader = `${bestOf} | ${matchType} (${x01})`;
  }
}
