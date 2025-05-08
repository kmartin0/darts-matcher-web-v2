import {X01Leg} from './x01-leg';
import {ResultType} from '../basematch/result-type';

export interface X01Set {
  set: number;
  legs: X01Leg[];
  throwsFirst: string;
  result: Map<string, ResultType>;
}
