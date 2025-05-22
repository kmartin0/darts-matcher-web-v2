import {X01Checkout} from '../../../../../models/x01-match/x01-checkout';

export interface X01MatchPlayerLegStats {
  legsWonInSet: number,
  setsWon: number,
  remainingInLeg: number,
  suggestedCheckout?: string,
  lastScore: number | undefined
}
