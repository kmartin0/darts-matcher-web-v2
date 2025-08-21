import {X01MatchLegTableDataSource} from '../x01-match-leg-table-data-source';
import {X01MatchLegTableColumnDefinitions} from './x01-match-leg-table-column-definitions';
import {X01LegTableSetsMap} from './x01-match-leg-table-sets-map';

export interface X01MatchLegTableViewModel {
  columnDefinitions: X01MatchLegTableColumnDefinitions;
  displayedColumns: string[];
  matchTableDataSource: X01MatchLegTableDataSource;
  tables: X01LegTableSetsMap;
}

