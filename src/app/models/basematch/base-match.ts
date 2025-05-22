import {MatchStatus} from './match-status';
import {MatchPlayer} from './match-player';
import {MatchType} from './match-type';

export interface BaseMatch<PlayerType extends MatchPlayer> {
  id: string;
  startDate: Date;
  endDate: Date;
  matchStatus: MatchStatus;
  players: PlayerType[]
  matchType: MatchType;
}
