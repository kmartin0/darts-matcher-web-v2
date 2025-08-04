import {MatchStatus} from './match-status';
import {MatchPlayer} from './match-player';
import {MatchType} from './match-type';

export interface BaseMatch<PlayerType extends MatchPlayer> {
  id: string;
  version: number;
  broadcastVersion: number;
  startDate: number; // Unix timestamp in seconds
  endDate: number | null; // Unix timestamp in seconds
  matchStatus: MatchStatus;
  players: PlayerType[];
  matchType: MatchType;
}
