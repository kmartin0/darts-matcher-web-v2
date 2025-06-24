import {X01LegRound} from './x01-leg-round';

export interface X01Leg {
  leg: number;
  winner: string;
  throwsFirst: string;
  checkoutDartsUsed: number | null;
  rounds: X01LegRound[];
}
