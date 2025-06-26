import {Injectable} from '@angular/core';
import {LegSelection} from '../../../../models/common/leg-selection';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {getLegInPlay, getSet, getSetInPlay} from '../../../../shared/utils/x01-match.utils';
import {MatchStatus} from '../../../../models/basematch/match-status';

export interface X01MatchViewData {
  legSelection: LegSelection | null;
  errorMsg: string | undefined;
  editScoreMode: boolean;
  displayScoreInput: boolean;
  displayUndoScore: boolean;
}

@Injectable({providedIn: 'root'})
export class X01MatchViewDataTransformer {

  /**
   * Transforms a match into a view data object for x01 match component rendering and state handling.
   * Initializes the leg selection based on the current or last leg in the match and sets default UI flags.
   *
   * @param match - The match object to transform, or null if unavailable.
   * @returns A X01MatchViewData object with leg selection and display flags.
   */
  transform(match: X01Match | null): X01MatchViewData {
    const legSelection: LegSelection | null = this.selectCurrentOrLastLeg(match);

    return {
      legSelection: legSelection,
      displayScoreInput: this.shouldDisplayScoreInput(match, legSelection),
      displayUndoScore: this.shouldDisplayUndoScore(match, legSelection),
      editScoreMode: false,
      errorMsg: undefined
    };
  }

  /**
   * Updates display flags based on a new leg selection.
   *
   * @param currentViewData - The current view data to update.
   * @param match - The match object.
   * @returns An X01MatchViewData with updated flags.
   */
  updateForNewLegSelection(currentViewData: X01MatchViewData, match: X01Match | null): X01MatchViewData {
    return {
      ...currentViewData,
      displayScoreInput: this.shouldDisplayScoreInput(match, currentViewData.legSelection),
      displayUndoScore: this.shouldDisplayUndoScore(match, currentViewData.legSelection)
    };
  }

  /**
   * Selects the current leg in play if available; otherwise selects the last leg in the match.
   *
   * @param match The match for which to select the current or last leg.
   * @returns {LegSelection} Object containing the selected leg and set.
   */
  private selectCurrentOrLastLeg(match: X01Match | null): LegSelection | null {
    if (match) {
      const inPlay = this.createLegInPlaySelection(match);
      if (inPlay) return inPlay;

      const last = this.createLastLegSelection(match);
      if (last) return last;
    }

    return null;
  }

  /**
   * Returns the current leg in play if both the set and leg in play can be determined.
   *
   * @param match - The match object containing the current state of sets and legs.
   * @returns A LegSelection representing the current set and leg in play, or null if not determinable.
   */
  private createLegInPlaySelection(match: X01Match): LegSelection | null {
    const setInPlayEntry = getSetInPlay(match);
    const legInPlayEntry = getLegInPlay(match, setInPlayEntry?.set ?? null);
    return (setInPlayEntry && legInPlayEntry) ? {setEntry: setInPlayEntry, legEntry: legInPlayEntry} : null;
  }

  /**
   * Returns the last leg in the match.
   *
   * @param match - The match object containing sets and legs.
   * @returns A LegSelection representing the last set and leg, or null if none are found.
   */
  private createLastLegSelection(match: X01Match): LegSelection | null {
    const lastSetEntry = match.sets.at(-1);
    const lastLegEntry = lastSetEntry?.set?.legs.at(-1);

    if (!lastSetEntry || !lastLegEntry) return null;

    return {setEntry: lastSetEntry, legEntry: lastLegEntry};
  }

  /**
   * Updates the visibility flag for the score input.
   * The score input is shown only if the match is in progress and the selected leg matches the current leg in play.
   */
  private shouldDisplayScoreInput(match: X01Match | null, legSelection: LegSelection | null): boolean {
    if (!match || !legSelection) return false;

    return match.matchStatus === MatchStatus.IN_PLAY &&
      match.matchProgress.currentSet === legSelection.setEntry.setNumber &&
      match.matchProgress.currentLeg === legSelection.legEntry.legNumber;
  }

  /**
   * Updates the visibility flag for the undo score control.
   * The undo option is shown only if the selected leg matches the last recorded set and leg in the match.
   */
  private shouldDisplayUndoScore(match: X01Match | null, legSelection: LegSelection | null): boolean {
    if (!match || !legSelection) return false;

    const lastSetEntry = match.sets.at(-1) ?? null;
    const lastLegEntry = lastSetEntry?.set?.legs.at(-1) ?? null;

    return lastSetEntry?.setNumber === legSelection.setEntry.setNumber &&
      lastLegEntry?.legNumber === legSelection.legEntry.legNumber;
  }
}
