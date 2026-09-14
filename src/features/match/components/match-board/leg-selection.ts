import {X01LegEntry} from '../../../../data/model/x01/leg/x01-leg-entry';
import {isLastLegInMatch, X01Match} from '../../../../data/model/x01/match/x01-match';
import {X01SetEntry} from '../../../../data/model/x01/set/x01-set-entry';

export interface LegSelection {
  setEntry: X01SetEntry;
  legEntry: X01LegEntry;
}

/**
 * Checks whether the current match leg is selected.
 *
 * @param match - Match containing the current match progress.
 * @param legSelection - Currently selected leg.
 * @returns Whether the current match leg is selected.
 */
export function isCurrentLegSelected(match: X01Match, legSelection: LegSelection): boolean {
  const currentSetNumber = match.matchProgress.currentSet;
  const currentLegNumber = match.matchProgress.currentLeg;

  if (currentSetNumber === null || currentLegNumber === null) {
    return false;
  }

  return (
    currentSetNumber === legSelection.setEntry.setNumber &&
    currentLegNumber === legSelection.legEntry.legNumber
  );
}

/**
 * Checks whether the last leg currently present in the match is selected.
 *
 * @param match - Match containing the sets and legs.
 * @param legSelection - Currently selected leg.
 * @returns Whether the last leg currently present in the match is selected.
 */
export function isLastLegSelected(match: X01Match, legSelection: LegSelection): boolean {
  return isLastLegInMatch(
    match,
    legSelection.setEntry.setNumber,
    legSelection.legEntry.legNumber
  );
}

/**
 * Checks whether the current match leg is selected, or the last leg when there is no current leg.
 *
 * @param match - Match containing the current match progress, sets and legs.
 * @param legSelection - Currently selected leg.
 * @returns Whether the current or last match leg is selected.
 */
export function isCurrentOrLastLegSelected(match: X01Match, legSelection: LegSelection): boolean {
  if (match.matchProgress.currentLeg !== null) {
    return isCurrentLegSelected(match, legSelection);
  }

  return isLastLegSelected(match, legSelection);
}

/**
 * Checks whether the specified set and leg are selected.
 *
 * @param legSelection - Currently selected leg.
 * @param setNumber - Number of the set to check.
 * @param legNumber - Number of the leg to check.
 * @returns Whether the specified set and leg are selected.
 */
export function isLegSelected(legSelection: LegSelection, setNumber: number, legNumber: number): boolean {
  return (
    legSelection.setEntry.setNumber === setNumber &&
    legSelection.legEntry.legNumber === legNumber
  );
}

/**
 * Checks whether two selections refer to the same leg.
 *
 * @param first - First leg selection.
 * @param second - Second leg selection.
 * @returns Whether both selections refer to the same leg.
 */
export function isSameLegSelected(first: LegSelection, second: LegSelection): boolean {
  return (
    first.setEntry.setNumber === second.setEntry.setNumber &&
    first.legEntry.legNumber === second.legEntry.legNumber
  );
}
