import {PlayerMap} from '../../../../shared/types/player-map';
import {ResultType} from '../../base-match/result-type';
import {X01LegEntry} from '../leg/x01-leg-entry';

export interface X01Set {
  legs: X01LegEntry[];
  throwsFirst: string;
  result: PlayerMap<ResultType> | null;
}

/**
 * Gets a leg entry from a set by its leg number.
 *
 * @param set - Set containing the leg.
 * @param legNumber - Number of the leg to get.
 * @returns The matching leg entry, or null when no matching leg exists.
 */
export function getLegInSet(set: X01Set, legNumber: number): X01LegEntry | null {
  const legEntry = set.legs.find(
    legEntry => legEntry.legNumber === legNumber
  );

  return legEntry ?? null;
}

/**
 * Checks whether the specified leg is the last leg currently present in the set.
 *
 * @param set - Set containing the leg.
 * @param legNumber - Number of the leg to check.
 * @returns Whether the leg is the last leg currently present in the set.
 */
export function isLastLegInSet(set: X01Set, legNumber: number): boolean {
  return set.legs.at(-1)?.legNumber === legNumber;
}
