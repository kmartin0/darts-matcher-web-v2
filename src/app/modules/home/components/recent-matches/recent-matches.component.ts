import {Component, inject, OnInit} from '@angular/core';
import {AppEndpoints} from '../../../../core/app.endpoints';
import {MatIconAnchor, MatIconButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {RecentMatchesService} from '../../../../shared/services/recent-matches-service/recent-matches.service';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {BaseComponent} from '../../../../shared/components/base/base.component';
import {DatePipe, NgIf} from '@angular/common';
import {MatExpansionModule,} from '@angular/material/expansion';
import {X01BestOfType} from '../../../../models/x01-match/x01-best-of-type';
import {X01PlayerStanding} from '../../../../models/common/x01-player-standing';
import {RecentMatchViewData} from './recent-match-view-data';
import {epochSecondsToDate} from '../../../../shared/utils/number.utils';
import {MatList, MatListItem} from '@angular/material/list';
import {MatTooltip} from '@angular/material/tooltip';
import {DialogService} from '../../../../shared/services/dialog-service/dialog.service';
import {ConfirmDialogData} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import {X01MatchService} from '../../../../shared/services/x01-match-service/x01-match.service';

@Component({
  selector: 'app-recent-matches',
  imports: [
    MatIcon,
    RouterLink,
    DatePipe,
    MatExpansionModule,
    MatList,
    MatListItem,
    MatIconAnchor,
    MatTooltip,
    MatIconButton,
    NgIf,
  ],
  standalone: true,
  templateUrl: './recent-matches.component.html',
  styleUrl: './recent-matches.component.scss'
})
export class RecentMatchesComponent extends BaseComponent implements OnInit {
  protected readonly AppEndpoints = AppEndpoints;
  protected recentMatches: X01Match[] | null = null;
  protected viewData: RecentMatchViewData[] = [];
  protected matchesLoaded = false;

  private recentMatchesService = inject(RecentMatchesService);
  private dialogService = inject(DialogService);
  private matchService = inject(X01MatchService);

  /**
   * Initialize recent matches from local storage and fetch their details on init.
   */
  ngOnInit() {
    this.initializeRecentMatches();
  }

  /**
   * Remove a match from the recent matches storage and viewdata.
   *
   * @param matchId The match id to remove
   */
  removeFromRecentMatches(matchId: string) {
    const dialogData: ConfirmDialogData = {action: 'Remove this match from recents'};
    const dialogRef = this.dialogService.openConfirmDialog(dialogData);
    const sub = dialogRef?.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.recentMatchesService.removeMatch(matchId);
        this.viewData = this.viewData.filter(recentMatchViewData => recentMatchViewData.matchId !== matchId);
      }
    });
    this.subscription.add(sub);
  }

  /**
   * Initializes the list of recent matches by retrieving the recent matches from the recent matches service.
   * On retrieval initialize `recentMatches` and `viewData`.
   */
  private initializeRecentMatches() {
    const sub = this.recentMatchesService.getRecentMatches().subscribe(recentMatches => {
      this.recentMatches = recentMatches.filter(recentMatch => recentMatch != null);
      this.initViewData();
      this.matchesLoaded = true;
    });
    this.subscription.add(sub);
  }

  /**
   * Initializes the `viewData` array by transforming `recentMatches` into
   * a preformatted user-friendly text fields.
   *
   * Sets an empty array if no matches are available.
   */
  private initViewData() {
    if (!this.recentMatches) {
      this.viewData = [];
      return;
    }

    // Map each match from `recentMatches` to `RecentMatchViewData` and add them to `viewData`.
    this.viewData = Array.from(
      this.recentMatches.map(match => {
        return {
          matchId: match.id,
          startDate: epochSecondsToDate(match.startDate),
          formattedScoreline: this.formatScoreline(this.matchService.createStandings(match), match.matchSettings.bestOf.bestOfType),
          formattedBestOfSets: this.formatBestOfSets(match),
          formattedBestOfLegs: this.formatBestOfLegs(match),
          formattedClearByTwoInFinalSet: this.formattedClearByTwoInFinalSet(match)
        };
      })
    );
  }

  /**
   * Returns a formatted scoreline string for a given player standings map.
   *
   * The scoreline is based on either sets or legs won, depending on `bestOfType`.
   * Example output: `"John [2] vs Jane [1]"`.
   *
   * @param playerStandings - A map of player ID to their current match standing.
   * @param bestOfType - Determines whether to show set or leg wins.
   * @returns A formatted scoreline string.
   */
  private formatScoreline(playerStandings: Map<string, X01PlayerStanding>, bestOfType: X01BestOfType) {
    return Array.from(playerStandings.values()).map(playerStanding => {
      const score = bestOfType === X01BestOfType.SETS ? playerStanding.setsWon : playerStanding.legsWon;
      return `${playerStanding.playerName} [${score}]`;
    }).join(' vs ');
  }

  /**
   * Returns a formatted string describing the "Best of Sets" and 'Clear by two sets (if enabled)' configuration.
   *
   * If the match is not set-based, an empty string is returned.
   * Example output: `"Clear by two, max 2 extra sets"`.
   *
   * @param match - The match to extract best-of set settings from.
   * @returns A user-friendly description of the best-of sets configuration.
   */
  private formatBestOfSets(match: X01Match): string {
    const bestOf = match.matchSettings.bestOf;
    if (bestOf.bestOfType !== X01BestOfType.SETS) return '';

    const bestOfSets = bestOf.sets;
    const clearByTwoLimit = bestOf.clearByTwoSetsRule.limit;

    const formattedBestOf = `Best of ${bestOfSets} ${bestOfSets === 1 ? 'set' : 'sets'}`;
    const formattedClearByTwo = `Clear by two, max ${clearByTwoLimit} extra ${clearByTwoLimit === 1 ? 'set' : 'sets'}`;

    return bestOf.clearByTwoSetsRule.enabled ? `${formattedBestOf} - ${formattedClearByTwo}` : formattedBestOf;
  }

  /**
   * Returns a formatted string describing the "Best of legs" and 'Clear by two legs (if enabled)' configuration.
   *
   * Example output: `"Clear by two, max 2 extra legs"`.
   *
   * @param match - The match to extract best-of set settings from.
   * @returns A user-friendly description of the best-of legs configuration.
   */
  private formatBestOfLegs(match: X01Match): string {
    const bestOf = match.matchSettings.bestOf;

    const bestOfLegs = bestOf.legs;
    const clearByTwoLimit = bestOf.clearByTwoLegsRule.limit;

    const formattedBestOf = `Best of ${bestOfLegs} ${bestOfLegs === 1 ? 'leg' : 'legs'}`;
    const formattedClearByTwo = `Clear by two, max ${clearByTwoLimit} extra ${clearByTwoLimit === 1 ? 'leg' : 'legs'}`;

    return bestOf.clearByTwoLegsRule.enabled ? `${formattedBestOf} - ${formattedClearByTwo}` : formattedBestOf;
  }

  /**
   * Returns a formatted string describing the 'Clear by two legs in final set (if enabled)' configuration.
   *
   * If the Clear by two legs in final set not enabled, an empty string is returned.
   * Example output: `"Clear by two in final set, max 2 extra legs"`.
   *
   * @param match - The match to extract best-of set settings from.
   * @returns A user-friendly description of the clear by two in final set configuration.
   */
  private formattedClearByTwoInFinalSet(match: X01Match): string {
    const bestOf = match.matchSettings.bestOf;
    if (!bestOf.clearByTwoLegsInFinalSetRule.enabled) return '';

    const clearByTwoLimit = bestOf.clearByTwoLegsInFinalSetRule.limit;
    return `Clear by two in final set, max ${clearByTwoLimit} extra ${clearByTwoLimit === 1 ? 'leg' : 'legs'}`;
  }
}
