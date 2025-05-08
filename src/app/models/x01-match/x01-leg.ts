import {X01LegRound} from './x01-leg-round';

export interface X01Leg {
  leg: number;
  winner: string;
  throwsFirst: string;
  rounds: X01LegRound[];
}
