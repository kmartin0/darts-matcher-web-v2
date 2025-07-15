import {PlayerType} from '../../models/basematch/player-type';
import {X01ClearByTwoRule} from '../../models/x01-match/x01-clear-by-two-rule';
import {X01BestOfType} from '../../models/x01-match/x01-best-of-type';

export interface CreateMatchRequestDto {
  matchSettings: {
    x01: number;
    trackDoubles: boolean;
    bestOf: {
      sets: number;
      legs: number;
      bestOfType: X01BestOfType;
      clearByTwoSetsRule: X01ClearByTwoRule;
      clearByTwoLegsRule: X01ClearByTwoRule;
      clearByTwoLegsInFinalSetRule: X01ClearByTwoRule;
    }
  },
  players: {
    playerName: string;
    playerType: PlayerType;
    x01DartBotSettings?: {
      threeDartAverage: number;
    }
  } []
}
