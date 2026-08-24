import {PlayerType} from '../model/match/player-type';
import {X01BestOfType} from '../model/x01/x01-best-of-type';
import {X01ClearByTwoRule} from '../model/x01/x01-clear-by-two-rule';

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
