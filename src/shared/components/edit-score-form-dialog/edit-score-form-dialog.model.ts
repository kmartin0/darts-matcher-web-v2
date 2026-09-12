export interface FormModel {
  score: number;
}

/**
 * Creates the initial edit score form model.
 *
 * @param score - Initial score.
 * @returns Initial edit score form model.
 */
export function createInitialFormModel(score: number): FormModel {
  return {
    score: score
  };
}
