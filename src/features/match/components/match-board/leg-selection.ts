import {X01LegEntry} from '../../../../data/model/x01/leg/x01-leg-entry';
import {X01SetEntry} from '../../../../data/model/x01/set/x01-set-entry';
import {X01Match} from '../../../../data/model/x01/match/x01-match';

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

  return currentSetNumber === legSelection.setEntry.setNumber &&
    currentLegNumber === legSelection.legEntry.legNumber;
}

/**
 * Checks whether the last leg in the match is selected.
 *
 * @param match - Match containing the sets and legs.
 * @param legSelection - Currently selected leg.
 * @returns Whether the last match leg is selected.
 */
export function isLastLegSelected(match: X01Match, legSelection: LegSelection): boolean {
  const lastSetEntry = match.sets.at(-1);
  const lastLegEntry = lastSetEntry?.set.legs.at(-1);

  return legSelection.setEntry.setNumber === lastSetEntry?.setNumber &&
    legSelection.legEntry.legNumber === lastLegEntry?.legNumber;
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
