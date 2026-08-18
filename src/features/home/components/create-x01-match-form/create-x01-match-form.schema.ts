import {
  applyEach,
  disabled,
  max,
  maxLength,
  min,
  minLength,
  required,
  schema,
  SchemaPathTree
} from '@angular/forms/signals';
import {PlayerType} from '../../../../data/model/match/player-type';
import {X01BestOfType} from '../../../../data/model/x01/x01-best-of-type';
import {CreateX01MatchFormModel, X01ClearByTwoType, X01PlayerFormModel} from './create-x01-match-form.model';
import {ValidationErrorMessageUtil, ValidationErrorKey,} from '../../../../shared/utils/error-message.util';
import {registerBotRequiresHumanValidator, registerMaxOneBotValidator} from './create-x01-match-form.validators';

const MIN_X01 = 101;
const MAX_X01 = 1001;
const MIN_SETS = 1;
const MAX_SETS = 49;
const MIN_LEGS = 1;
const MAX_LEGS = 49;
const MIN_PLAYER_NAME_LENGTH = 3;
const MAX_PLAYER_NAME_LENGTH = 30;
const MIN_BOT_AVERAGE = 3;
const MAX_BOT_AVERAGE = 167;
const MIN_CLEAR_BY_TWO_LIMIT = 0;
const MAX_CLEAR_BY_TWO_LIMIT = 20;

export const MIN_PLAYERS = 1;
export const MAX_PLAYERS = 4;

export const createX01MatchFormSchema = schema<CreateX01MatchFormModel>(path => {
  registerX01Rules(path);
  registerBestOfRules(path);
  registerClearByTwoRules(path);
  registerPlayersRules(path);
});

/**
 * Registers the validation rules for the X01 field.
 *
 * @param path - Root path of the create X01 match form.
 */
function registerX01Rules(path: SchemaPathTree<CreateX01MatchFormModel>): void {
  // Field - X01 type
  required(path.x01, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.REQUIRED,
    }),
  });
  min(path.x01, MIN_X01, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MIN,
      min: MIN_X01,
    }),
  });
  max(path.x01, MAX_X01, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MAX,
      max: MAX_X01,
    }),
  });
}

/**
 * Registers the validation and field-state rules for the best-of section.
 *
 * @param path - Root path of the create X01 match form.
 */
function registerBestOfRules(path: SchemaPathTree<CreateX01MatchFormModel>): void {
  // Field - Best of type
  required(path.bestOf.bestOfType, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.REQUIRED,
    }),
  });

  // Field - Best of set input
  required(path.bestOf.sets, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.REQUIRED,
    }),
  });
  min(path.bestOf.sets, MIN_SETS, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MIN,
      min: MIN_SETS,
    }),
  });
  max(path.bestOf.sets, MAX_SETS, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MAX,
      max: MAX_SETS,
    }),
  });
  disabled(path.bestOf.sets, {
    when: ({valueOf}) => valueOf(path.bestOf.bestOfType) === X01BestOfType.LEGS,
  });

  // Field - Best of leg input
  required(path.bestOf.legs, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.REQUIRED,
    }),
  });
  min(path.bestOf.legs, MIN_LEGS, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MIN,
      min: MIN_LEGS,
    }),
  });
  max(path.bestOf.legs, MAX_LEGS, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MAX,
      max: MAX_LEGS,
    }),
  });
}

/**
 * Registers the validation and field-state rules for the clear-by-two section.
 *
 * @param path - Root path of the create X01 match form.
 */
function registerClearByTwoRules(path: SchemaPathTree<CreateX01MatchFormModel>): void {
  // Field - Clear by two set limit
  required(path.clearByTwo.setLimit, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.REQUIRED,
    }),
  });
  min(path.clearByTwo.setLimit, MIN_CLEAR_BY_TWO_LIMIT, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MIN,
      min: MIN_CLEAR_BY_TWO_LIMIT,
    }),
  });
  max(path.clearByTwo.setLimit, MAX_CLEAR_BY_TWO_LIMIT, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MAX,
      max: MAX_CLEAR_BY_TWO_LIMIT,
    }),
  });
  disabled(path.clearByTwo.setLimit, {
    when: ({valueOf}) =>
      !valueOf(path.clearByTwo.selectedTypes).includes(X01ClearByTwoType.SETS),
  });

  // Field - Clear by two leg limit
  required(path.clearByTwo.legLimit, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.REQUIRED,
    }),
  });
  min(path.clearByTwo.legLimit, MIN_CLEAR_BY_TWO_LIMIT, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MIN,
      min: MIN_CLEAR_BY_TWO_LIMIT,
    }),
  });
  max(path.clearByTwo.legLimit, MAX_CLEAR_BY_TWO_LIMIT, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MAX,
      max: MAX_CLEAR_BY_TWO_LIMIT,
    }),
  });
  disabled(path.clearByTwo.legLimit, {
    when: ({valueOf}) =>
      !valueOf(path.clearByTwo.selectedTypes).includes(X01ClearByTwoType.LEGS),
  });

  // Field - Clear by two final set leg limit
  required(path.clearByTwo.finalSetLegLimit, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.REQUIRED,
    }),
  });
  min(path.clearByTwo.finalSetLegLimit, MIN_CLEAR_BY_TWO_LIMIT, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MIN,
      min: MIN_CLEAR_BY_TWO_LIMIT,
    }),
  });
  max(path.clearByTwo.finalSetLegLimit, MAX_CLEAR_BY_TWO_LIMIT, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MAX,
      max: MAX_CLEAR_BY_TWO_LIMIT,
    }),
  });
  disabled(path.clearByTwo.finalSetLegLimit, {
    when: ({valueOf}) =>
      !valueOf(path.clearByTwo.selectedTypes).includes(X01ClearByTwoType.LEGS_FINAL_SET),
  });
}

/**
 * Registers collection-level validation rules for the players field and applies
 * the individual player rules to every player in the array.
 *
 * @param path - Root path of the create X01 match form.
 */
function registerPlayersRules(path: SchemaPathTree<CreateX01MatchFormModel>): void {
  // Field - Players
  minLength(path.players, MIN_PLAYERS, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MIN_LENGTH_ARRAY,
      min: MIN_PLAYERS,
      name: 'player(s)',
    }),
  });
  maxLength(path.players, MAX_PLAYERS, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MAX_LENGTH_ARRAY,
      max: MAX_PLAYERS,
      name: 'player(s)',
    }),
  });
  registerMaxOneBotValidator(path.players);
  registerBotRequiresHumanValidator(path.players);

  applyEach(path.players, registerPlayerRules);
}

/**
 * Registers the validation and field-state rules for a single player.
 *
 * @param path - Path of a player in the players array.
 */
function registerPlayerRules(path: SchemaPathTree<X01PlayerFormModel>): void {
  // Field - Player name
  required(path.playerName, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.REQUIRED,
    }),
  });
  minLength(path.playerName, MIN_PLAYER_NAME_LENGTH, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MIN_LENGTH,
      requiredLength: MIN_PLAYER_NAME_LENGTH,
    }),
  });
  maxLength(path.playerName, MAX_PLAYER_NAME_LENGTH, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MAX_LENGTH,
      requiredLength: MAX_PLAYER_NAME_LENGTH,
    }),
  });

  // Field - Player type
  required(path.playerType, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.REQUIRED,
    }),
  });

  // Field - Three dart average
  required(path.threeDartAverage, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.REQUIRED,
    }),
  });
  min(path.threeDartAverage, MIN_BOT_AVERAGE, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MIN,
      min: MIN_BOT_AVERAGE,
    }),
  });
  max(path.threeDartAverage, MAX_BOT_AVERAGE, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MAX,
      max: MAX_BOT_AVERAGE,
    }),
  });
  disabled(path.threeDartAverage, {
    when: ({valueOf}) => valueOf(path.playerType) !== PlayerType.DART_BOT,
  });
}
