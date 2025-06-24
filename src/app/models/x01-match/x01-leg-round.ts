import {X01LegRoundScore} from './x01-leg-round-score';
import {PlayerMap} from '../../types/player-map';

export interface X01LegRound {
  scores: PlayerMap<X01LegRoundScore>
}
