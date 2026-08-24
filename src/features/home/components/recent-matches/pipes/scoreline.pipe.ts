import {Pipe, PipeTransform} from '@angular/core';
import {X01Match} from '../../../../../data/model/x01/x01-match';
import {X01BestOfType} from '../../../../../data/model/x01/x01-best-of-type';

@Pipe({
  name: 'scoreline',
  pure: true,
})
export class ScorelinePipe implements PipeTransform {

  /**
   * Formats the current scoreline for a match.
   *
   * The score is based on sets or legs won, depending on the match best-of type.
   * Example: "John [2] vs Jane [1]".
   *
   * @param match - Match to format the scoreline for.
   * @returns Formatted match scoreline.
   */
  transform(match: X01Match): string {
    const bestOfType = match.matchSettings.bestOf.bestOfType;

    return match.players
      .map(player => {
        const standing = match.standings[player.playerId];
        const score = bestOfType === X01BestOfType.SETS
          ? standing?.setsWon ?? 0
          : standing?.legsWonInCurrentSet ?? 0;

        return `${player.playerName} [${score}]`;
      })
      .join(' vs ');
  }
}
