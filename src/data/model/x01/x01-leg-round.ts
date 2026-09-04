import {X01Turn} from './x01-turn';
import {PlayerMap} from '../../../shared/types/player-map';

export interface X01LegRound {
  turns: PlayerMap<X01Turn>
}
