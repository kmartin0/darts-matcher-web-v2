import {PlayerType} from '../../../../data/model/match/player-type';
import {X01BestOfType} from '../../../../data/model/x01/x01-best-of-type';

export enum X01ClearByTwoType {
  SETS = 'SETS',
  LEGS = 'LEGS',
  LEGS_FINAL_SET = 'LEGS_FINAL_SET',
}

export interface X01PlayerFormModel {
  playerName: string;
  playerType: PlayerType;
  threeDartAverage: number | null;
}

export interface CreateX01MatchFormModel {
  x01: number;
  bestOf: {
    bestOfType: X01BestOfType;
    sets: number;
    legs: number;
  };
  clearByTwo: {
    selectedTypes: X01ClearByTwoType[];
    setLimit: number;
    legLimit: number;
    finalSetLegLimit: number;
  };
  trackDoubles: boolean;
  players: X01PlayerFormModel[];
}

export function createEmptyPlayer(): X01PlayerFormModel {
  return {
    playerName: '',
    playerType: PlayerType.HUMAN,
    threeDartAverage: null,
  };
}

export function createInitialX01MatchFormModel(): CreateX01MatchFormModel {
  return {
    x01: 501,
    bestOf: {
      bestOfType: X01BestOfType.SETS,
      sets: 1,
      legs: 1,
    },
    clearByTwo: {
      selectedTypes: [],
      setLimit: 0,
      legLimit: 0,
      finalSetLegLimit: 0,
    },
    trackDoubles: false,
    players: [createEmptyPlayer()],
  };
}
