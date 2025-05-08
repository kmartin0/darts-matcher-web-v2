import {X01LegRoundScore} from './x01-leg-round-score';

export interface X01LegRound {
  round: number;
  scores: Map<string, X01LegRoundScore>
}
