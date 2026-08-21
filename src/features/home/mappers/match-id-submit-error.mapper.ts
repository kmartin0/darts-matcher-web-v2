import {ApiErrorResponse} from '../../../data/api/errors/api-error-response';
import {mapToFormSubmitErrors} from '../../../shared/forms/api-form-error.mapper';
import * as MatchIdFormModel from '../components/match-id-form/match-id-form.model';

const API_TARGETS_MAP: Record<string, MatchIdFormModel.FormErrorTarget> = {
  'x01Match': 'matchId',
};

/**
 * Maps an API error response to match ID form submission errors.
 *
 * @param errorResponse - Parsed API error response, or undefined when the failure could not be parsed.
 * @returns Form submission errors to apply to the match ID form.
 */
export function mapToMatchIdSubmitErrors(errorResponse: ApiErrorResponse | undefined): MatchIdFormModel.SubmitError[] {
  return mapToFormSubmitErrors(
    errorResponse,
    mapApiTargetToFormErrorTarget,
    MatchIdFormModel.DEFAULT_ERROR_TARGET,
  );
}

/**
 * Maps an API error target to its corresponding form error target.
 *
 * @param apiTarget - Target returned by the API.
 * @returns The mapped form error target, or undefined when the target is unsupported.
 */
function mapApiTargetToFormErrorTarget(apiTarget: string): MatchIdFormModel.FormErrorTarget | undefined {
  return API_TARGETS_MAP[apiTarget];
}
