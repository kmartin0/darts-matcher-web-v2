import {ResultType} from './result-type';
import {ObjectId} from '../object-id';

export interface MatchPlayer {
  playerId: ObjectId;
  playerName: string;
  resultType: ResultType;
}
