import {PlayerMap} from '../../../../shared/types/player-map';
import {X01StandingsEntry} from '../standings/x01-standings-entry';

/**
 * X01 match history represented by chronologically ordered leg snapshots.
 */
export interface X01MatchTimeline {
  setEntries: ReadonlyMap<number, X01MatchTimelineSetEntry>;
}

export interface X01MatchTimelineSetEntry {
  setNumber: number;
  legEntries: ReadonlyMap<number, X01MatchTimelineLegEntry>;
}

/**
 * Match values through the identified leg, inclusive.
 */
export interface X01MatchTimelineLegEntry {
  legNumber: number;

  throwsFirst: string;
  winner: string | null;
  checkoutScore: number | null;

  players: PlayerMap<X01MatchTimelinePlayerEntry>;
}

/**
 * Player values at a leg snapshot.
 *
 * Standings and cumulative values include the snapshot's leg.
 * Leg values are scoped only to that leg.
 */
export interface X01MatchTimelinePlayerEntry {
  standing: X01StandingsEntry;
  cumulativeValues: X01PlayerCumulativeValues;
  legValues: X01PlayerLegValues;
}

/**
 * Player scoring totals through the entry's leg, inclusive.
 */
export interface X01PlayerCumulativeValues {
  pointsThrown: number;
  dartsThrown: number;
  pointsThrownFirstNine: number;
  dartsThrownFirstNine: number;
}

/**
 * Player values within the entry's leg only.
 */
export interface X01PlayerLegValues {
  pointsThrown: number;
  dartsThrown: number;
  remaining: number;
  lastScore: number | null;
  doublesMissed: number;
}
