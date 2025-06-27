import {X01MatchSettings} from './x01-match-settings';
import {X01MatchProgress} from './x01-match-progress';
import {BaseMatch} from '../basematch/base-match';
import {X01MatchPlayer} from './x01-match-player';
import {X01SetEntry} from './x01-set-entry';

export interface X01Match extends BaseMatch<X01MatchPlayer> {
  matchSettings: X01MatchSettings;
  sets: X01SetEntry[];
  matchProgress: X01MatchProgress;
}
