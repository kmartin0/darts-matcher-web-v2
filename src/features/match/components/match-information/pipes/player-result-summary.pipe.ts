import {Pipe, PipeTransform} from '@angular/core';
import {MatchPlayer} from '../../../../../data/model/base-match/match-player';
import {MatchStatus} from '../../../../../data/model/base-match/match-status';
import {X01BestOfType} from '../../../../../data/model/x01/rules/x01-best-of-type';
import {X01StandingsEntry} from '../../../../../data/model/x01/standings/x01-standings-entry';

/**
 * Formats the player result summary displayed in Match Information.
 */
@Pipe({
  name: 'playerResultSummary'
})
export class PlayerResultSummaryPipe implements PipeTransform {

  /**
   * Formats a player's recorded result together with their standing.
   *
   * Examples: `2 (1)` while playing a set-based match or `WIN - 2`
   * after the match concludes. Missing standings are omitted. A dash is
   * returned when neither a result nor a standing is available.
   *
   * @param player - Player whose recorded result should be displayed.
   * @param standing - Player's current match standing, when available.
   * @param bestOfType - Whether the match is decided by sets or legs.
   * @param matchStatus - Current match status.
   * @returns Formatted player result summary.
   */
  transform(
    player: MatchPlayer,
    standing: X01StandingsEntry | undefined,
    bestOfType: X01BestOfType,
    matchStatus: MatchStatus
  ): string {
    const formattedStanding = this.formatStanding(standing, bestOfType, matchStatus);

    if (player.resultType === null) {
      return formattedStanding ?? '-';
    }

    return formattedStanding === null
      ? player.resultType
      : `${player.resultType} - ${formattedStanding}`;
  }

  /**
   * Formats the sets or legs won by a player.
   *
   * Set-based matches include legs won in the current set while in play.
   * Concluded set-based matches display only sets won.
   *
   * @param standing - Player's current match standing, when available.
   * @param bestOfType - Whether to display sets or legs won.
   * @param matchStatus - Current match status.
   * @returns Formatted standing, or null when no standing exists.
   */
  private formatStanding(
    standing: X01StandingsEntry | undefined,
    bestOfType: X01BestOfType,
    matchStatus: MatchStatus
  ): string | null {
    if (standing === undefined) {
      return null;
    }

    switch (bestOfType) {
      case X01BestOfType.SETS:
        return matchStatus === MatchStatus.IN_PLAY
          ? `${standing.setsWon} (${standing.legsWonInCurrentSet})`
          : `${standing.setsWon}`;

      case X01BestOfType.LEGS:
        return `${standing.legsWonInCurrentSet}`;
    }
  }
}
