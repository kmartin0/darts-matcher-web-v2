import {X01LegTableDataSource} from '../x01-leg-table-data-source';
import {X01MatchLegTableColumnDefinitions} from './x01-match-leg-table-column-definitions';
import {X01LegTableSetsMap} from './x01-match-leg-table-sets-map';

export interface X01MatchLegTableViewData {
  columnDefinitions: X01MatchLegTableColumnDefinitions;
  displayedColumns: string[];
  matchTableDataSource: X01LegTableDataSource;
  tables: X01LegTableSetsMap
}

