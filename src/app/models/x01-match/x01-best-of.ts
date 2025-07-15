import {X01ClearByTwoRule} from './x01-clear-by-two-rule';
import {X01BestOfType} from './x01-best-of-type';

export interface X01BestOf {
  sets: number;
  legs: number;
  bestOfType: X01BestOfType
  clearByTwoSetsRule: X01ClearByTwoRule;
  clearByTwoLegsRule: X01ClearByTwoRule;
  clearByTwoLegsInFinalSetRule: X01ClearByTwoRule;
}
