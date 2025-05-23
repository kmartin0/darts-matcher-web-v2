import {PlayerMap} from '../../../../../types/player-map';
import {X01PlayerCardLegData} from './x01-player-card-leg-data';
import {LegMap} from '../../../../../types/leg-map';

export interface X01PlayerCardSet {
  legs: LegMap<PlayerMap<X01PlayerCardLegData>>
}
