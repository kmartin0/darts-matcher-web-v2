import {LegSelection} from '../match-board/leg-selection';

export interface FormModel {
  legSelection: LegSelection | null;
}

/**
 * Creates the initial leg selection form model.
 *
 * @param legSelection - Initial leg selection.
 * @returns Initial leg selection form model.
 */
export function createInitialFormModel(legSelection: LegSelection | null = null): FormModel {
  return {
    legSelection: legSelection
  };
}
