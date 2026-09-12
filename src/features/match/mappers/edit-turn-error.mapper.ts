import {ApiErrorCode} from '../../../data/api/errors/api-error-code';
import {ApiErrorResponse} from '../../../data/api/errors/api-error-response';

const DEFAULT_EDIT_TURN_ERROR = 'Failed to edit turn';

const API_TARGET_PREFIX_MAP: Readonly<Partial<Record<string, string>>> = {
  score: 'Score',
  doublesMissed: 'Doubles missed',
  checkoutDartsUsed: 'Checkout darts used',
  playerId: 'Player',
  set: 'Set',
  leg: 'Leg',
  round: 'Round'
};

/**
 * Maps an API error response to a user-facing edit-turn error message.
 *
 * @param errorResponse - Parsed API error response, or undefined when the failure could not be parsed.
 * @returns User-facing edit-turn error message.
 */
export function mapToEditTurnErrorMessage(errorResponse: ApiErrorResponse | undefined): string {
  switch (errorResponse?.type) {
    case ApiErrorCode.INVALID_ARGUMENTS:
      return mapInvalidArgumentsToErrorMessage(errorResponse);

    default:
      return DEFAULT_EDIT_TURN_ERROR;
  }
}

/**
 * Maps the first invalid-arguments target error to a user-facing message.
 *
 * @param errorResponse - Invalid-arguments API error response.
 * @returns User-facing error message for the first target error.
 */
function mapInvalidArgumentsToErrorMessage(errorResponse: ApiErrorResponse): string {
  const firstTargetError = Object.entries(errorResponse.targetErrors ?? {})[0];

  if (firstTargetError === undefined) {
    return DEFAULT_EDIT_TURN_ERROR;
  }

  const [target, message] = firstTargetError;
  const prefix = API_TARGET_PREFIX_MAP[target];

  return prefix !== undefined ? `${prefix}: ${message}` : DEFAULT_EDIT_TURN_ERROR;
}
