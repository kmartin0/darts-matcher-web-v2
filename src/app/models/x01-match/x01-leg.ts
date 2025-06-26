import {X01LegRoundEntry} from './x01-leg-round-entry';

export interface X01Leg {
  leg: number;
  winner: string;
  throwsFirst: string;
  checkoutDartsUsed: number | null;
  rounds: X01LegRoundEntry[];
}
