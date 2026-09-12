export interface FormModel {
  number: number | null;
}

/**
 * Creates the initial number selection form model.
 *
 * @param number - Initially selected number.
 * @returns Initial number selection form model.
 */
export function createInitialFormModel(number: number | null = null): FormModel {
  return {
    number: number
  };
}
