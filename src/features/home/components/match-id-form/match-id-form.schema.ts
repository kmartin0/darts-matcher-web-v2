import {required, schema, SchemaPathTree} from '@angular/forms/signals';
import {ValidationErrorKey, ValidationErrorMessageUtil} from '../../../../shared/utils/error-message.util';
import * as MatchIdFormModel from './match-id-form.model';
import * as MatchIdFormValidators from './match-id-form.validators';

export const MATCH_ID_FORM_SCHEMA =
  schema<MatchIdFormModel.FormModel>(path => {
    registerMatchIdRules(path);
  });

/**
 * Registers validation rules for the match ID field.
 *
 * @param path - Schema path tree for the match ID form.
 */
function registerMatchIdRules(path: SchemaPathTree<MatchIdFormModel.FormModel>): void {
  required(path.matchId, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.REQUIRED,
    }),
  });

  MatchIdFormValidators.registerMatchIdValidator(path.matchId);
}
