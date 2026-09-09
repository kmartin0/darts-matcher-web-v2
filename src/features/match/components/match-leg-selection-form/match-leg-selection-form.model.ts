import {LegSelection} from '../match-board/leg-selection';

export namespace MatchLegSelectionFormModel {
  export interface FormModel {
    legSelection: LegSelection | null;
  }

  export function createInitialFormModel(legSelection: LegSelection | null = null): FormModel {
    return {
      legSelection: legSelection
    };
  }
}
