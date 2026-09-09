import {FormSubmitAction, FormSubmitError} from '../../../../shared/forms/form-submit';

export interface FormModel {
  matchId: string;
}

/**
 * Creates the initial match ID form model.
 *
 * @returns Initial match ID form model.
 */
export function createInitialFormModel(): FormModel {
  return {
    matchId: ''
  };
}

export type FormErrorTarget = 'matchId';

export const DEFAULT_ERROR_TARGET: FormErrorTarget = 'matchId';

export type SubmitError = FormSubmitError<FormErrorTarget>;

export type SubmitAction = FormSubmitAction<FormModel, FormErrorTarget>;
