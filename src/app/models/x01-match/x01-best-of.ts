import {X01ClearByTwoRule} from './x01-clear-by-two-rule';

export interface X01BestOf {
  sets: number;
  legs: number;
  clearByTwoSetsRule: X01ClearByTwoRule;
  clearByTwoLegsRule: X01ClearByTwoRule;
  clearByTwoLegsInFinalSetRule: X01ClearByTwoRule;
}
