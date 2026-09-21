import {X01Leg} from '../../../../data/model/x01/leg/x01-leg';
import {X01BestOfType} from '../../../../data/model/x01/rules/x01-best-of-type';
import {X01StandingsEntry} from '../../../../data/model/x01/standings/x01-standings-entry';

/**
 * Data required to render a single leg in the match timeline.
 */
export interface MatchTimelineLegCardData {
  setNumber: number;
  legNumber: number;

  x01: number;
  bestOfType: X01BestOfType;
  trackDoubles: boolean;

  leg: X01Leg;
  players: MatchTimelineLegCardPlayerData[];
}

/**
 * Player identity and cumulative standing through the displayed leg.
 *
 * Leg wins are scoped to the set containing that leg.
 */
export interface MatchTimelineLegCardPlayerData {
  playerId: string;
  initials: string;
  standing: X01StandingsEntry;
}
