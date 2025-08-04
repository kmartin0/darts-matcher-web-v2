import {ResultType} from '../basematch/result-type';
import {PlayerMap} from '../../types/player-map';
import {X01LegEntry} from './x01-leg-entry';

export interface X01Set {
  legs: X01LegEntry[];
  throwsFirst: string;
  result: PlayerMap<ResultType> | null;
}
