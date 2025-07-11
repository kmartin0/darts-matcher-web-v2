import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {BestOfType} from '../../../../models/common/best-of-type';
import {PlayerType} from '../../../../models/basematch/player-type';
import {ClearByTwoType} from '../../../../models/common/clear-by-two-type';

export interface MatchForm {
  x01: FormControl<number>;
  bestOf: FormGroup<BestOfGroup>;
  clearByTwo: FormGroup<ClearByTwoGroup>;
  trackDoubles: FormControl<boolean>;
  players: FormArray<FormGroup<PlayerGroup>>;
}

export interface BestOfGroup {
  type: FormControl<BestOfType>;
  sets: FormControl<number>;
  legs: FormControl<number>;
}

export interface ClearByTwoGroup {
  selectedTypes: FormControl<ClearByTwoType[]>;
  extraSetLimit: FormControl<number>;
  extraLegLimit: FormControl<number>;
  extraLegLimitFinalSet: FormControl<number>;
}

export interface PlayerGroup {
  name: FormControl<string>;
  type: FormControl<PlayerType>;
  avg: FormControl<number | null>;
}

export interface MatchFormResult {
  x01: number;
  bestOf: {
    type: BestOfType;
    sets: number;
    legs: number;
  };
  clearByTwo: {
    selectedTypes: ClearByTwoType[]
    extraSetLimit: number;
    extraLegLimit: number;
    extraLegLimitFinalSet: number;
  };
  trackDoubles: boolean;
  players: {
    name: string;
    type: PlayerType;
    avg: number | null;
  }[];
}
