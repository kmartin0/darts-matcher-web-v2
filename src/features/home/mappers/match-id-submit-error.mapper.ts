import {ApiErrorCode} from '../../../data/api/errors/api-error-code';
import {ApiErrorResponse} from '../../../data/api/errors/api-error-response';
import {ValidationErrorKey, ValidationErrorMessageUtil} from '../../../shared/utils/error-message.util';
import * as MatchIdFormModel from '../components/match-id-form/match-id-form.model';

/**
 * Maps an API error response to match ID form submission errors.
 *
 * Resource-not-found errors indicate that no match exists for the submitted ID.
 * All other failures are mapped to the default unknown submission error.
 *
 * @param errorResponse - Parsed API error response, or undefined when the failure could not be parsed.
 * @returns Form submission errors to apply to the match ID form.
 */
export function mapToMatchIdSubmitErrors(
  errorResponse: ApiErrorResponse | undefined
): MatchIdFormModel.SubmitError[] {
  let message: string;

  switch (errorResponse?.type) {
    case ApiErrorCode.RESOURCE_NOT_FOUND:
      message = ValidationErrorMessageUtil.getErrorMessage({
        key: ValidationErrorKey.RESOURCE_NOT_FOUND,
        resourceName: 'Match',
      });
      break;

    default:
      message = ValidationErrorMessageUtil.getErrorMessage({
        key: ValidationErrorKey.UNKNOWN,
      });
  }

  return [{
    target: MatchIdFormModel.DEFAULT_ERROR_TARGET,
    message: message,
  }];
}
