import {PlayerType} from '../../../../data/model/match/player-type';
import {X01PlayerFormModel} from './create-x01-match-form.model';
import {SchemaPathTree, validate} from '@angular/forms/signals';
import {ValidationErrorKey, ValidationErrorMessageUtil} from '../../../../shared/utils/error-message.util';

/**
 * Registers a validator that ensures no more than one dart bot is present.
 *
 * @param path - Path of the players array in the create X01 match form.
 */
export function registerMaxOneBotValidator(path: SchemaPathTree<X01PlayerFormModel[]>): void {
  validate(path, ({value}) => {
    const botCount = value()
      .filter(player => player.playerType === PlayerType.DART_BOT)
      .length;

    return botCount > 1
      ? {
        kind: ValidationErrorKey.MAX_ONE_BOT,
        message: ValidationErrorMessageUtil.getErrorMessage({key: ValidationErrorKey.MAX_ONE_BOT}),
      }
      : null;
  });
}

/**
 * Registers a validator that ensures a dart bot is accompanied by at least one human player.
 *
 * @param path - Path of the players array in the create X01 match form.
 */
export function registerBotRequiresHumanValidator(path: SchemaPathTree<X01PlayerFormModel[]>): void {
  validate(path, ({value}) => {
    const players = value();

    const botCount = players
      .filter(player => player.playerType === PlayerType.DART_BOT)
      .length;

    return botCount > 0 && botCount === players.length
      ? {
        kind: ValidationErrorKey.BOT_REQUIRES_HUMAN,
        message: ValidationErrorMessageUtil.getErrorMessage({key: ValidationErrorKey.BOT_REQUIRES_HUMAN}),
      }
      : null;
  });
}
