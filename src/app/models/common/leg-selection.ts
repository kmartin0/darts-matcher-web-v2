import {X01LegEntry} from '../x01-match/x01-leg-entry';
import {X01SetEntry} from '../x01-match/x01-set-entry';

export interface LegSelection {
  setEntry: X01SetEntry,
  legEntry: X01LegEntry
}
