import {BaseMatch} from '../../base-match/base-match';
import {PlayerMap} from '../../../../shared/types/player-map';
import {X01LegEntry} from '../leg/x01-leg-entry';
import {getLegInSet, isLastLegInSet} from '../set/x01-set';
import {X01SetEntry} from '../set/x01-set-entry';
import {X01StandingsEntry} from '../standings/x01-standings-entry';
import {X01MatchPlayer} from './x01-match-player';
import {X01MatchProgress} from './x01-match-progress';
import {X01MatchSettings} from './x01-match-settings';

export interface X01Match extends BaseMatch<X01MatchPlayer> {
  matchSettings: X01MatchSettings;
  sets: X01SetEntry[];
  matchProgress: X01MatchProgress;
  standings: PlayerMap<X01StandingsEntry>;
}

/**
 * Gets a set entry from a match by its set number.
 *
 * @param match - Match containing the set.
 * @param setNumber - Number of the set to get.
 * @returns The matching set entry, or null when no matching set exists.
 */
export function getSetInMatch(match: X01Match, setNumber: number): X01SetEntry | null {
  const setEntry = match.sets.find(
    setEntry => setEntry.setNumber === setNumber
  );

  return setEntry ?? null;
}

/**
 * Gets a leg entry from a match by its set and leg numbers.
 *
 * @param match - Match containing the leg.
 * @param setNumber - Number of the set containing the leg.
 * @param legNumber - Number of the leg to get.
 * @returns The matching leg entry, or null when the set or leg does not exist.
 */
export function getLegInMatch(match: X01Match, setNumber: number, legNumber: number): X01LegEntry | null {
  const setEntry = getSetInMatch(match, setNumber);
  if (setEntry === null) return null;

  return getLegInSet(setEntry.set, legNumber);
}

/**
 * Checks whether the specified leg is the last leg currently present in the match.
 *
 * @param match - Match containing the leg.
 * @param setNumber - Number of the set containing the leg.
 * @param legNumber - Number of the leg to check.
 * @returns Whether the leg is the last leg currently present in the match.
 */
export function isLastLegInMatch(match: X01Match, setNumber: number, legNumber: number): boolean {
  const lastSetEntry = match.sets.at(-1);

  return (
    lastSetEntry?.setNumber === setNumber &&
    isLastLegInSet(lastSetEntry.set, legNumber)
  );
}
