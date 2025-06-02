import {PlayerMap} from '../../../../../types/player-map';
import {X01PlayerCardLegStats} from './x01-player-card-leg-stats';

export interface X01PlayerCardLeg {
  startsLeg: string;
  players: PlayerMap<X01PlayerCardLegStats>;
}
