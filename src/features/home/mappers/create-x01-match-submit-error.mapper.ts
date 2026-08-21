import {ApiErrorResponse} from '../../../data/api/errors/api-error-response';
import {mapToFormSubmitErrors} from '../../../shared/forms/api-form-error.mapper';
import * as CreateX01MatchFormModel from '../components/create-x01-match-form/create-x01-match-form.model';

const API_TARGETS_MAP: Record<string, CreateX01MatchFormModel.StaticFormErrorTarget> = {
  'matchSettings.x01': 'x01',
  'matchSettings.bestOf.sets': 'bestOf.sets',
  'matchSettings.bestOf.legs': 'bestOf.legs',
  'matchSettings.bestOf.clearByTwoSetsRule.limit': 'clearByTwo.setLimit',
  'matchSettings.bestOf.clearByTwoLegsRule.limit': 'clearByTwo.legLimit',
  'matchSettings.bestOf.clearByTwoLegsInFinalSetRule.limit': 'clearByTwo.finalSetLegLimit',
  'players': 'players',
};

const PLAYER_API_TARGET_PATTERN = /^players\[(?<index>\d+)]\.(?<field>.+)$/;

/**
 * Maps an API error response to create-X01-match form submission errors.
 *
 * @param errorResponse - Parsed API error response, or undefined when the failure could not be parsed.
 * @returns Form submission errors to apply to the create-X01-match form.
 */
export function mapToCreateX01MatchSubmitErrors(errorResponse: ApiErrorResponse | undefined): CreateX01MatchFormModel.SubmitError[] {
  return mapToFormSubmitErrors(
    errorResponse,
    mapApiTargetToFormErrorTarget,
    CreateX01MatchFormModel.DEFAULT_ERROR_TARGET,
  );
}

/**
 * Maps an API error target to its corresponding form error target.
 *
 * @param apiTarget - Target path returned by the API.
 * @returns The mapped form error target, or undefined when the target is unsupported.
 */
function mapApiTargetToFormErrorTarget(apiTarget: string): CreateX01MatchFormModel.FormErrorTarget | undefined {
  return API_TARGETS_MAP[apiTarget]
    ?? mapApiTargetToPlayerFormErrorTarget(apiTarget);
}

/**
 * Maps an indexed API player target to its corresponding form player target.
 *
 * @param apiTarget - API target in the `players[index].field` format.
 * @returns The mapped player form target, or undefined when the target is unsupported.
 */
function mapApiTargetToPlayerFormErrorTarget(apiTarget: string): CreateX01MatchFormModel.PlayerFormErrorTarget | undefined {
  const match = PLAYER_API_TARGET_PATTERN.exec(apiTarget);
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
