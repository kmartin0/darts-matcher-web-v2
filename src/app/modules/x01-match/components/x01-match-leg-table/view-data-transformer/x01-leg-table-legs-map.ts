import {X01LegTableRow} from '../x01-leg-table-data-source';
import {LegMap} from '../../../../../types/leg-map';

export interface X01LegTableLegsMap {
  legs: LegMap<X01LegTableRow[]>;
}
