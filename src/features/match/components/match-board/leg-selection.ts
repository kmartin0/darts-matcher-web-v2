import {X01LegEntry} from '../../../../data/model/x01/leg/x01-leg-entry';
import {X01SetEntry} from '../../../../data/model/x01/set/x01-set-entry';

export interface LegSelection {
  setEntry: X01SetEntry;
  legEntry: X01LegEntry;
}
