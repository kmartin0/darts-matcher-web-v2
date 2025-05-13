import {MatchStatus} from './match-status';
import {MatchPlayer} from './match-player';
import {MatchType} from './match-type';
import {ObjectId} from '../object-id';

export interface BaseMatch<PlayerType extends MatchPlayer> {
  id: ObjectId;
  startDate: Date;
  endDate: Date;
  matchStatus: MatchStatus;
  players: PlayerType[]
  matchType: MatchType;
}
