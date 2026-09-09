import {ApiErrorCode} from '../../../data/api/errors/api-error-code';
import {ApiErrorResponse} from '../../../data/api/errors/api-error-response';
import {mapToFormSubmitErrors} from '../../../shared/forms/api-form-error.mapper';
import {ValidationErrorKey, ValidationErrorMessageUtil} from '../../../shared/utils/error-message.util';
import * as CreateMatchFormModel from '../components/create-match-form/create-match-form.model';

const API_TARGETS_MAP: Readonly<Partial<Record<string, CreateMatchFormModel.StaticFormErrorTarget>>> = {
  'matchSettings': 'root',
  'matchSettings.x01': 'x01',

  'matchSettings.bestOf': 'root',
  'matchSettings.bestOf.bestOfType': 'root',
  'matchSettings.bestOf.sets': 'bestOf.sets',
  'matchSettings.bestOf.legs': 'bestOf.legs',

  'matchSettings.bestOf.clearByTwoSetsRule': 'root',
  'matchSettings.bestOf.clearByTwoSetsRule.limit': 'clearByTwo.setLimit',

  'matchSettings.bestOf.clearByTwoLegsRule': 'root',
  'matchSettings.bestOf.clearByTwoLegsRule.limit': 'clearByTwo.legLimit',

  'matchSettings.bestOf.clearByTwoLegsInFinalSetRule': 'root',
  'matchSettings.bestOf.clearByTwoLegsInFinalSetRule.limit': 'clearByTwo.finalSetLegLimit',

  'players': 'players',
};

const PLAYER_API_TARGET_PATTERN = /^players\[(?<index>\d+)]\.(?<field>.+)$/;

/**
 * Maps an API error response to create-match form submission errors.
 *
 * Invalid-arguments errors are mapped to their corresponding form targets.
 * All other failures are mapped to the default unknown submission error.
 *
 * @param errorResponse - Parsed API error response, or undefined when the failure could not be parsed.
 * @returns Form submission errors to apply to the create-match form.
 */
export function mapToCreateMatchSubmitErrors(
  errorResponse: ApiErrorResponse | undefined
): CreateMatchFormModel.SubmitError[] {
  switch (errorResponse?.type) {
    case ApiErrorCode.INVALID_ARGUMENTS:
      return mapToFormSubmitErrors(
        errorResponse,
        mapApiTargetToFormErrorTarget,
        CreateMatchFormModel.DEFAULT_ERROR_TARGET,
      );

    default:
      return [{
        target: CreateMatchFormModel.DEFAULT_ERROR_TARGET,
        message: ValidationErrorMessageUtil.getErrorMessage({
          key: ValidationErrorKey.UNKNOWN,
        }),
      }];
  }
}

/**
 * Maps an API error target to its corresponding form error target.
 *
 * @param apiTarget - Target path returned by the API.
 * @returns The mapped form error target, or undefined when the target is unsupported.
 */
function mapApiTargetToFormErrorTarget(
  apiTarget: string
): CreateMatchFormModel.FormErrorTarget | undefined {
  return API_TARGETS_MAP[apiTarget]
    ?? mapApiTargetToPlayerFormErrorTarget(apiTarget);
}

/**
 * Maps an indexed API player target to its corresponding form player target.
 *
 * @param apiTarget - API target in the `players[index].field` format.
 * @returns The mapped player form target, or undefined when the target is unsupported.
 */
function mapApiTargetToPlayerFormErrorTarget(
  apiTarget: string
): CreateMatchFormModel.PlayerFormErrorTarget | undefined {
  const match = PLAYER_API_TARGET_PATTERN.exec(apiTarget);

  if (!match?.groups) {
    return undefined;
  }

  const {index, field} = match.groups;
  const playerIndex = Number(index);

  switch (field) {
    case 'playerName':
      return `players.${playerIndex}.playerName`;

    case 'playerType':
      return `players.${playerIndex}.playerType`;

    case 'x01DartBotSettings':
    case 'x01DartBotSettings.threeDartAverage':
      return `players.${playerIndex}.threeDartAverage`;

    default:
      return undefined;
  }
}
