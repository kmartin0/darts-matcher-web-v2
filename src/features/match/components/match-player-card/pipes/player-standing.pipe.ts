import {Pipe, PipeTransform} from '@angular/core';
import {X01BestOfType} from '../../../../../data/model/x01/rules/x01-best-of-type';

export interface PlayerStandingPipeData {
  bestOfType: X01BestOfType;
  setsWon: number;
  legsWon: number;
}

/**
 * Formats the player standing displayed in the Match Player Card.
 */
@Pipe({
  name: 'playerStanding'
})
export class PlayerStandingPipe implements PipeTransform {

  /**
   * Formats the sets and legs won according to the best-of type.
   *
   * Set-based matches display sets followed by legs in parentheses, for example `2 (1)`.
   * Leg-based matches display only legs, for example `3`.
   *
   * @param data - Best-of type and the sets and legs won.
   * @returns Formatted player standing.
   */
  transform(data: PlayerStandingPipeData): string {
    return data.bestOfType === X01BestOfType.SETS
      ? `${data.setsWon} (${data.legsWon})`
      : `${data.legsWon}`;
  }
}
