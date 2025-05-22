import {PlayerMap} from '../../../../../types/player-map';
import {X01MatchPlayerSummary} from './x01-match-player-summary';
import {X01SetViewData} from './x01-set-view-data';
import {X01MatchTableColumnDefinitions} from './x01-match-table-column-definitions';
import {X01MatchTableDataSource} from '../x01-match-table-data-source';


export interface X01MatchViewData {
  matchInformation: string,
  columnDefinitions: X01MatchTableColumnDefinitions,
  displayedColumns: string[],
  matchTableDataSource: X01MatchTableDataSource,
  playerSummaries: PlayerMap<X01MatchPlayerSummary>,
  sets: { [set: number]: X01SetViewData }
}
