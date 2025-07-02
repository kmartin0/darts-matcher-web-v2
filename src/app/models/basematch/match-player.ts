import {ResultType} from './result-type';
import {PlayerType} from './player-type';

export interface MatchPlayer {
  playerId: string;
  playerName: string;
  playerType: PlayerType;
  resultType: ResultType | null;
}
