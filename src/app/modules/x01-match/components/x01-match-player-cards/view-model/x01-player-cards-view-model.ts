import {PlayerMap} from '../../../../../types/player-map';
import {X01PlayerCardData} from './x01-player-card-data';
import {X01PlayerCardSet} from './x01-player-card-set';
import {SetMap} from '../../../../../types/set-map';

export interface X01PlayerCardsViewModel {
  playerInfo: PlayerMap<X01PlayerCardData>;
  sets: SetMap<X01PlayerCardSet>;
  currentPlayer: string | null;
}
