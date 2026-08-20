import {ApiErrorCode} from '../../data/api/errors/api-error-code';
import {ApiErrorResponse} from '../../data/api/errors/api-error-response';
import {ApiTargetErrors} from '../../data/api/errors/api-target-errors';
import {ValidationErrorKey, ValidationErrorMessageUtil} from '../utils/error-message.util';
import {FormSubmitError} from './form-submit';

/**
 * Maps an API validation target to a form error target.
 *
 * @typeParam TFormErrorTarget - Type describing the valid form error targets.
 * @param apiTarget - Target path returned by the API.
 * @returns The mapped form error target, or undefined when the API target is unsupported.
 */
export type ApiErrorTargetMapper<TFormErrorTarget extends string> =
  (apiTarget: string) => TFormErrorTarget | undefined;

/**
 * Maps an API error response to form submission errors.
 *
 * @typeParam TFormErrorTarget - Type describing the valid form error targets.
 * @param errorResponse - Parsed API error response, or undefined when the error could not be parsed.
 * @param mapTarget - Maps an API validation target to a form error target.
 * @param rootTarget - Form target used for root-level errors.
 * @returns Form submission errors.
 */
export function mapApiErrorToFormSubmitErrors<TFormErrorTarget extends string>(
  errorResponse: ApiErrorResponse | undefined,
  mapTarget: ApiErrorTargetMapper<TFormErrorTarget>,
  rootTarget: TFormErrorTarget,
): FormSubmitError<TFormErrorTarget>[] {
  switch (errorResponse?.error) {
    case ApiErrorCode.INVALID_ARGUMENTS:
      return mapInvalidArguments(
        errorResponse.details,
        mapTarget,
        rootTarget,
      );

    default:
      return [defaultError(rootTarget)];
  }
}

/**
 * Maps API invalid-argument target errors to form submission errors.
 *
 * Unknown API targets are mapped to the provided root target.
 * When no target errors are provided, a default root-level error is returned.
 *
 * @typeParam TFormErrorTarget - Type describing the valid form error targets.
 * @param targetErrors - Target-keyed validation errors returned by the API.
 * @param mapTarget - Maps an API target to a form error target.
 * @param rootTarget - Form target used for root-level errors.
 * @returns Mapped form submission errors.
 */
function mapInvalidArguments<TFormErrorTarget extends string>(
  targetErrors: ApiTargetErrors | undefined,
  mapTarget: ApiErrorTargetMapper<TFormErrorTarget>,
  rootTarget: TFormErrorTarget,
): FormSubmitError<TFormErrorTarget>[] {
  const errors: FormSubmitError<TFormErrorTarget>[] =
    Object.entries(targetErrors ?? {}).map(([apiTarget, message]) => {
      return {
        target: mapTarget(apiTarget) ?? rootTarget,
        message,
      };
    });

  return errors.length > 0
    ? errors
    : [defaultError(rootTarget)];
}

/**
 * Creates a generic root-level form submission error.
 *
 * @typeParam TFormErrorTarget - Type describing the valid form error targets.
 * @param rootTarget - Form target used for the root-level error.
 * @returns A default form submission error.
 */
function defaultError<TFormErrorTarget extends string>(
  rootTarget: TFormErrorTarget
): FormSubmitError<TFormErrorTarget> {
  return {
    target: rootTarget,
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.UNKNOWN,
    }),
  };
}
