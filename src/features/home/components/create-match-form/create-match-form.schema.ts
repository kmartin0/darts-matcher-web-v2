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
import * as CreateMatchFormModel from './create-match-form.model';
import * as CreateMatchFormValidators from './create-match-form.validators';
import {ValidationErrorKey, ValidationErrorMessageUtil,} from '../../../../shared/utils/error-message.util';

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

export const createMatchFormSchema =
  schema<CreateMatchFormModel.FormModel>(path => {
    registerX01Rules(path);
    registerBestOfRules(path);
    registerClearByTwoRules(path);
    registerPlayersRules(path);
  });

function registerX01Rules(
  path: SchemaPathTree<CreateMatchFormModel.FormModel>
): void {
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

function registerBestOfRules(
  path: SchemaPathTree<CreateMatchFormModel.FormModel>
): void {
  required(path.bestOf.bestOfType, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.REQUIRED,
    }),
  });

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
    when: ({valueOf}) =>
      valueOf(path.bestOf.bestOfType) === X01BestOfType.LEGS,
  });

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

function registerClearByTwoRules(
  path: SchemaPathTree<CreateMatchFormModel.FormModel>
): void {
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
      !valueOf(path.clearByTwo.selectedTypes).includes(
        CreateMatchFormModel.ClearByTwoType.SETS
      ),
  });

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
      !valueOf(path.clearByTwo.selectedTypes).includes(
        CreateMatchFormModel.ClearByTwoType.LEGS
      ),
  });

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
      !valueOf(path.clearByTwo.selectedTypes).includes(
        CreateMatchFormModel.ClearByTwoType.LEGS_FINAL_SET
      ),
  });
}

function registerPlayersRules(
  path: SchemaPathTree<CreateMatchFormModel.FormModel>
): void {
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

  CreateMatchFormValidators.registerMaxOneBotValidator(path.players);
  CreateMatchFormValidators.registerBotRequiresHumanValidator(path.players);

  applyEach(path.players, registerPlayerRules);
}

function registerPlayerRules(
  path: SchemaPathTree<CreateMatchFormModel.PlayerFormModel>
): void {
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

  required(path.playerType, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.REQUIRED,
    }),
  });

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
    when: ({valueOf}) =>
      valueOf(path.playerType) !== PlayerType.DART_BOT,
  });
}
