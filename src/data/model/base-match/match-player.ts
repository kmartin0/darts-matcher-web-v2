import {PlayerType} from './player-type';
import {ResultType} from './result-type';

export interface MatchPlayer {
  playerId: string;
  playerName: string;
  playerType: PlayerType;
  resultType: ResultType | null;
}

/**
 * Gets a player's tag from their number in match player order.
 *
 * @param playerNumber - One-based player number.
 * @returns Player tag, such as `P1`.
 */
export function getPlayerTag(playerNumber: number): string {
  return `P${playerNumber}`;
}
