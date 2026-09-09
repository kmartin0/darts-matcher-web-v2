import {Pipe, PipeTransform} from '@angular/core';
import {X01BestOfType} from '../../../../../data/model/x01/rules/x01-best-of-type';

export interface PlayerScorePipeData {
  bestOfType: X01BestOfType;
  setsWon: number;
  legsWonInCurrentSet: number;
}

/**
 * Formats a player's match score.
 */
@Pipe({
  name: 'playerScore'
})
export class PlayerScorePipe implements PipeTransform {

  /**
   * Formats a player's match score according to the best-of type.
   *
   * @param data - Score data to format.
   * @returns Formatted player match score.
   */
  transform(data: PlayerScorePipeData): string {
    return data.bestOfType === X01BestOfType.SETS
      ? `${data.setsWon} (${data.legsWonInCurrentSet})`
      : `${data.legsWonInCurrentSet}`;
  }
}
