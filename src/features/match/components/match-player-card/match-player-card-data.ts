import {X01Match} from '../../../../data/model/x01/x01-match';
import {X01Checkout} from '../../../../data/model/x01/x01-checkout';

export interface MatchPlayerCardData {
  playerId: string;
  name: string;
  playerResult: X01Match['players'][number]['resultType'];
  bestOfType: X01Match['matchSettings']['bestOf']['bestOfType'];
  setsWon: number;
  legsWonInCurrentSet: number;
  currentThrowerId: string | null;

  remaining: number;
  suggestedCheckout: X01Checkout | null;
  average: number | null;
  averageFirstNine: number | null;
  lastScore: number | null;
  dartsUsed: number;
  startsLegPlayerId: string;
}
