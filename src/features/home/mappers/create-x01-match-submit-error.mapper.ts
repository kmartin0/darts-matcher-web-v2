import {ApiTargetErrors} from '../../../data/api/errors/api-target-errors';
import * as CreateX01MatchFormModel from '../components/create-x01-match-form/create-x01-match-form.model';
import {ApiErrorResponse} from '../../../data/api/errors/api-error-response';
import {ApiErrorCode} from '../../../data/api/errors/api-error-code';
import {ValidationErrorKey, ValidationErrorMessageUtil} from '../../../shared/utils/error-message.util';

const INVALID_ARGUMENT_MAP: Record<string, CreateX01MatchFormModel.StaticFormErrorTarget> = {
  'matchSettings.x01': 'x01',
  'matchSettings.bestOf.sets': 'bestOf.sets',
  'matchSettings.bestOf.legs': 'bestOf.legs',
  'matchSettings.bestOf.clearByTwoSetsRule.limit': 'clearByTwo.setLimit',
  'matchSettings.bestOf.clearByTwoLegsRule.limit': 'clearByTwo.legLimit',
  'matchSettings.bestOf.clearByTwoLegsInFinalSetRule.limit': 'clearByTwo.finalSetLegLimit',
  'players': 'players',
};

const PLAYER_TARGET_PATTERN = /^players\[(?<index>\d+)]\.(?<field>.+)$/;

/**
 * Maps an API error response to create-X01-match form submission errors.
 *
 * @param errorResponse - Parsed API error response, or undefined when the failure could not be parsed.
 * @returns Form submission errors to apply to the create-X01-match form.
 */
export function mapToCreateX01MatchSubmitErrors(
  errorResponse: ApiErrorResponse | undefined,
): CreateX01MatchFormModel.SubmitError[] {
  switch (errorResponse?.error) {
    case ApiErrorCode.INVALID_ARGUMENTS:
      return mapInvalidArguments(errorResponse.details);

    default:
      return [defaultError()];
  }
}

/**
 * Maps API invalid-argument target errors to form submission errors.
 *
 * Falls back to a root-level error when no target errors are provided.
 *
 * @param targetErrors - Target-keyed validation errors returned by the API.
 * @returns Mapped form submission errors.
 */
function mapInvalidArguments(targetErrors: ApiTargetErrors | undefined): CreateX01MatchFormModel.SubmitError[] {
  const errors: CreateX01MatchFormModel.SubmitError[] =
    Object.entries(targetErrors ?? {}).map(([apiTarget, message]) => {
      return {
        target: mapInvalidArgumentTarget(apiTarget),
        message,
      };
    });

  return errors.length > 0 ? errors : [defaultError()];
}

/**
 * Maps an API invalid-argument target to its corresponding form error target.
 *
 * @param apiTarget - Target path returned by the API.
 * @returns The mapped form target, or root when the target is unknown.
 */
function mapInvalidArgumentTarget(apiTarget: string): CreateX01MatchFormModel.FormErrorTarget {
  return INVALID_ARGUMENT_MAP[apiTarget]
    ?? mapPlayerTarget(apiTarget)
    ?? 'root';
}

/**
 * Maps an indexed API player target to its corresponding form player target.
 *
 * @param apiTarget - API target in the `players[index].field` format.
 * @returns The mapped player form target, or undefined when the target is unsupported.
 */
function mapPlayerTarget(apiTarget: string): CreateX01MatchFormModel.PlayerFormErrorTarget | undefined {
  const match = PLAYER_TARGET_PATTERN.exec(apiTarget);
  if (!match?.groups) return undefined;

  const {index, field} = match.groups;
  switch (field) {
    case 'playerName':
      return `players.${Number(index)}.playerName`;

    case 'playerType':
      return `players.${Number(index)}.playerType`;

    case 'x01DartBotSettings.threeDartAverage':
      return `players.${Number(index)}.threeDartAverage`;

    default:
      return undefined;
  }
}

/**
 * Creates the generic root-level submission error.
 *
 * @returns A default form submission error.
 */
function defaultError(): CreateX01MatchFormModel.SubmitError {
  return {
    target: 'root',
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.UNKNOWN,
    }),
  };
}
