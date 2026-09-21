import {Pipe, PipeTransform} from '@angular/core';
import {getPlayerTag} from '../../../../../data/model/base-match/match-player';

/**
 * Formats a player number as a player tag.
 */
@Pipe({name: 'playerTag'})
export class PlayerTagPipe implements PipeTransform {
  /**
   * Formats a one-based player number.
   *
   * @param playerNumber - One-based player number.
   * @returns Player tag, such as `P1`.
   */
  transform(playerNumber: number): string {
    return getPlayerTag(playerNumber);
  }
}
