import {Pipe, PipeTransform} from '@angular/core';
import {X01Match} from '../../../../../data/model/x01/x01-match';
import {X01BestOfType} from '../../../../../data/model/x01/x01-best-of-type';

export interface ScorelinePipeData {
  players: X01Match['players'];
  standings: X01Match['standings'];
  matchSettings: {
    bestOf: {
      bestOfType: X01BestOfType;
    };
  };
}

@Pipe({
  name: 'scoreline'
})
export class ScorelinePipe implements PipeTransform {

  /**
   * Formats the current match scoreline.
   *
   * The score is based on sets or legs won, depending on the match best-of type.
   * Example: "John [2] vs Jane [1]".
   *
   * @param data - Match data required to format the scoreline.
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
