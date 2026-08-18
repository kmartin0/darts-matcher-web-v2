import {ResultType} from '../match/result-type';
import {X01LegEntry} from './x01-leg-entry';
import {PlayerMap} from '../../../shared/types/player-map';

export interface X01Set {
  legs: X01LegEntry[];
  throwsFirst: string;
  result: PlayerMap<ResultType> | null;
}
