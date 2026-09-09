import {X01BestOf} from '../rules/x01-best-of';

export interface X01MatchSettings {
  x01: number;
  trackDoubles: boolean;
  bestOf: X01BestOf;
}
