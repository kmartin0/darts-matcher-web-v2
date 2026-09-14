import {X01Checkout} from '../../../../data/model/x01/checkout/x01-checkout';
import {X01BestOfType} from '../../../../data/model/x01/rules/x01-best-of-type';

export interface MatchPlayerCardData {
  playerId: string;
  name: string;
  bestOfType: X01BestOfType;

  isWinOrDraw: boolean;
  setsWon: number;
  legsWon: number;

  isCurrentThrower: boolean;
  startsLeg: boolean;
  remaining: number;
  suggestedCheckout: X01Checkout | null;
  average: number | null;
  averageFirstNine: number | null;
  lastScore: number | null;
  dartsUsed: number;
}
