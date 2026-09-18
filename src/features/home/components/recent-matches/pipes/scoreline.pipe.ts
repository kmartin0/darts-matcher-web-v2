import {Pipe, PipeTransform} from '@angular/core';
import {X01Match} from '../../../../../data/model/x01/match/x01-match';
import {X01BestOfType} from '../../../../../data/model/x01/rules/x01-best-of-type';

export interface ScorelinePipeData {
  players: X01Match['players'];
  standings: X01Match['standings'];
  matchSettings: {
    bestOf: {
      bestOfType: X01BestOfType;
    };
  };
}

/**
 * Formats the match scoreline displayed by Recent Matches.
 */
@Pipe({
  name: 'scoreline'
})
export class ScorelinePipe implements PipeTransform {

  /**
   * Formats each player's sets or legs won according to the best-of type.
   *
   * Example: `John [2] vs Jane [1]`.
   * A player without a standing is displayed with a score of zero.
   *
   * @param data - Players, standings, and best-of type to format.
   * @returns Formatted match scoreline.
   */
  transform(data: ScorelinePipeData): string {
    const bestOfType = data.matchSettings.bestOf.bestOfType;

    return data.players
      .map(player => {
        const standing = data.standings[player.playerId];
        const score = bestOfType === X01BestOfType.SETS
          ? standing?.setsWon ?? 0
          : standing?.legsWonInCurrentSet ?? 0;

        return `${player.playerName} [${score}]`;
      })
      .join(' vs ');
  }
}
