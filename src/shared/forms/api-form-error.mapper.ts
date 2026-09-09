import {ApiErrorResponse} from '../../data/api/errors/api-error-response';
import {ApiTargetErrors} from '../../data/api/errors/api-target-errors';
import {ValidationErrorKey, ValidationErrorMessageUtil} from '../utils/error-message.util';
import {FormSubmitError} from './form-submit';

const API_ROOT_ERROR_TARGET = 'root';

/**
 * Function that maps an API error target to a form error target.
 *
 * @typeParam TFormErrorTarget - Type describing the valid form error targets.
 * @param apiTarget - Target returned by the API.
 * @returns Mapped form error target, or undefined when the API target is unsupported.
 */
export type ApiErrorTargetMapper<TFormErrorTarget extends string> =
  (apiTarget: string) => TFormErrorTarget | undefined;

/**
 * Maps an API error response to form submission errors.
 *
 * API target errors are mapped to their corresponding form error targets.
 * When no target errors are provided, a default form submission error is returned.
 *
 * @typeParam TFormErrorTarget - Type describing the valid form error targets.
 * @param errorResponse - Parsed API error response, or undefined when the error could not be parsed.
 * @param apiErrorTargetMapper - Maps an API error target to a form error target.
 * @param defaultFormErrorTarget - Form error target used when no specific target can be mapped.
 * @returns Form submission errors.
 */
export function mapToFormSubmitErrors<TFormErrorTarget extends string>(
  errorResponse: ApiErrorResponse | undefined,
  apiErrorTargetMapper: ApiErrorTargetMapper<TFormErrorTarget>,
  defaultFormErrorTarget: TFormErrorTarget,
): FormSubmitError<TFormErrorTarget>[] {
  if (errorResponse?.targetErrors === undefined) {
    return [createDefaultFormSubmitError(defaultFormErrorTarget)];
  }

  return mapApiTargetErrorsToFormSubmitErrors(
    errorResponse.targetErrors,
    apiErrorTargetMapper,
    defaultFormErrorTarget,
  );
}

/**
 * Maps API target errors to form submission errors.
 *
 * Unknown API targets are mapped to the provided default form error target.
 * When the target errors are empty, a default form submission error is returned.
 *
 * @typeParam TFormErrorTarget - Type describing the valid form error targets.
 * @param apiTargetErrors - Target-keyed errors returned by the API.
 * @param apiErrorTargetMapper - Maps an API error target to a form error target.
 * @param defaultFormErrorTarget - Form error target used when an API target cannot be mapped.
 * @returns Mapped form submission errors.
 */
function mapApiTargetErrorsToFormSubmitErrors<TFormErrorTarget extends string>(
  apiTargetErrors: ApiTargetErrors,
  apiErrorTargetMapper: ApiErrorTargetMapper<TFormErrorTarget>,
  defaultFormErrorTarget: TFormErrorTarget,
): FormSubmitError<TFormErrorTarget>[] {
  const errors: FormSubmitError<TFormErrorTarget>[] =
    Object.entries(apiTargetErrors).map(([apiTarget, message]) => {
      return {
        target: apiTarget === API_ROOT_ERROR_TARGET
          ? defaultFormErrorTarget
          : apiErrorTargetMapper(apiTarget) ?? defaultFormErrorTarget,
        message: message,
      };
    });

  return errors.length > 0
    ? errors
    : [createDefaultFormSubmitError(defaultFormErrorTarget)];
}

/**
 * Creates a default form submission error.
 *
 * @typeParam TFormErrorTarget - Type describing the valid form error targets.
 * @param defaultFormErrorTarget - Form error target used for the default error.
 * @returns Default form submission error.
 */
function createDefaultFormSubmitError<TFormErrorTarget extends string>(
  defaultFormErrorTarget: TFormErrorTarget
): FormSubmitError<TFormErrorTarget> {
  return {
    target: defaultFormErrorTarget,
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.UNKNOWN,
    }),
  };
}
