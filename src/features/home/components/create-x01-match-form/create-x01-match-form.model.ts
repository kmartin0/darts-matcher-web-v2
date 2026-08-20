import {PlayerType} from '../../../../data/model/match/player-type';
import {X01BestOfType} from '../../../../data/model/x01/x01-best-of-type';
import {FormSubmitAction, FormSubmitError} from '../../../../shared/forms/form-submit';

export enum ClearByTwoType {
  SETS = 'SETS',
  LEGS = 'LEGS',
  LEGS_FINAL_SET = 'LEGS_FINAL_SET',
}

export const X01_OPTIONS = [301, 501] as const;

export interface PlayerFormModel {
  playerName: string;
  playerType: PlayerType;
  threeDartAverage: number | null;
}

export interface FormModel {
  x01: number;
  bestOf: {
    bestOfType: X01BestOfType;
    sets: number;
    legs: number;
  };
  clearByTwo: {
    selectedTypes: ClearByTwoType[];
    setLimit: number;
    legLimit: number;
    finalSetLegLimit: number;
  };
  trackDoubles: boolean;
  players: PlayerFormModel[];
}

export function createEmptyPlayer(): PlayerFormModel {
  return {
    playerName: '',
    playerType: PlayerType.HUMAN,
    threeDartAverage: null,
  };
}

export function createInitialFormModel(): FormModel {
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

export type StaticFormErrorTarget =
  | 'root'
  | 'x01'
  | 'bestOf.sets'
  | 'bestOf.legs'
  | 'clearByTwo.setLimit'
  | 'clearByTwo.legLimit'
  | 'clearByTwo.finalSetLegLimit'
  | 'players';

export type PlayerFormErrorTarget =
  | `players.${number}.playerType`
  | `players.${number}.playerName`
  | `players.${number}.threeDartAverage`;

export type FormErrorTarget =
  | StaticFormErrorTarget
  | PlayerFormErrorTarget;

export type SubmitError = FormSubmitError<FormErrorTarget>;

export type SubmitAction = FormSubmitAction<FormModel, FormErrorTarget>;
