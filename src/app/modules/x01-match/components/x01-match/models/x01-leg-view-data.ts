import {PlayerMap} from '../../../../../types/player-map';
import {X01RoundTableRow} from '../x01-match-table-data-source';
import {X01MatchPlayerLegStats} from './x01-match-player-leg-stats';


export interface X01LegViewData {
  playerStats: PlayerMap<X01MatchPlayerLegStats>,
  rounds: X01RoundTableRow[]
}
