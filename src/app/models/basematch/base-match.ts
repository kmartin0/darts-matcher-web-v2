import {MatchStatus} from './match-status';
import {MatchPlayer} from './match-player';
import {MatchType} from './match-type';

export interface BaseMatch<PlayerType extends MatchPlayer> {
  id: string;
  version: number;
  broadcastVersion: number;
  startDate: number;
  endDate: number;
  matchStatus: MatchStatus;
  players: PlayerType[]
  matchType: MatchType;
}
