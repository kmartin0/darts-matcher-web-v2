import {PlayerType} from './player-type';
import {ResultType} from './result-type';

export interface MatchPlayer {
  playerId: string;
  playerName: string;
  initials: string;
  playerType: PlayerType;
  resultType: ResultType | null;
}
