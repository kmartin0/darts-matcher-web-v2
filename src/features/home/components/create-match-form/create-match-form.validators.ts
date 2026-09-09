import {SchemaPathTree, validate} from '@angular/forms/signals';
import {PlayerType} from '../../../../data/model/base-match/player-type';
import {ValidationErrorKey, ValidationErrorMessageUtil} from '../../../../shared/utils/error-message.util';
import * as CreateMatchFormModel from './create-match-form.model';

/**
 * Registers a validator that ensures no more than one dart bot is present.
 *
 * @param path - Path of the players array in the create match form.
 */
export function registerMaxOneBotValidator(
  path: SchemaPathTree<CreateMatchFormModel.PlayerFormModel[]>
): void {
  validate(path, ({value}) => {
    const botCount = value()
      .filter(player => player.playerType === PlayerType.DART_BOT)
      .length;

    return botCount > 1
      ? {
        kind: ValidationErrorKey.MAX_ONE_BOT,
        message: ValidationErrorMessageUtil.getErrorMessage({
          key: ValidationErrorKey.MAX_ONE_BOT,
        })
      }
      : null;
  });
}

/**
 * Registers a validator that ensures a dart bot is accompanied by at least one human player.
 *
 * @param path - Path of the players array in the create match form.
 */
export function registerBotRequiresHumanValidator(
  path: SchemaPathTree<CreateMatchFormModel.PlayerFormModel[]>
): void {
  validate(path, ({value}) => {
    const players = value();

    const hasBotPlayer = players.some(player => player.playerType === PlayerType.DART_BOT);
    const hasHumanPlayer = players.some(player => player.playerType === PlayerType.HUMAN);

    return hasBotPlayer && !hasHumanPlayer
      ? {
        kind: ValidationErrorKey.BOT_REQUIRES_HUMAN,
        message: ValidationErrorMessageUtil.getErrorMessage({
          key: ValidationErrorKey.BOT_REQUIRES_HUMAN,
        }),
      }
      : null;
  });
}
