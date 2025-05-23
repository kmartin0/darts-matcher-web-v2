import {PlayerMap} from '../../../../../types/player-map';
import {X01LegTableRow} from '../../x01-match-leg-table/x01-leg-table-data-source';
import {X01MatchPlayerLegStats} from './x01-match-player-leg-stats';


export interface X01LegViewData {
  playerStats: PlayerMap<X01MatchPlayerLegStats>,
  rounds: X01LegTableRow[]
}
