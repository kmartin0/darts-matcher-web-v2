import {ResultType} from '../../base-match/result-type';
import {X01LegEntry} from '../leg/x01-leg-entry';
import {PlayerMap} from '../../../../shared/types/player-map';

export interface X01Set {
  legs: X01LegEntry[];
  throwsFirst: string;
  result: PlayerMap<ResultType> | null;
}
