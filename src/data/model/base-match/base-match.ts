import {MatchStatus} from './match-status';
import {MatchType} from './match-type';
import {MatchPlayer} from './match-player';

export interface BaseMatch<TPlayer extends MatchPlayer> {
  id: string;
  version: number;
  broadcastVersion: number;
  startDate: number; // Unix timestamp in seconds
  endDate: number | null; // Unix timestamp in seconds
  matchStatus: MatchStatus;
  rematchId: string | null;
  players: TPlayer[];
  matchType: MatchType;
}
