import {required, schema, SchemaPathTree} from '@angular/forms/signals';
import {ValidationErrorKey, ValidationErrorMessageUtil} from '../../../../shared/utils/error-message.util';
import * as MatchIdFormModel from './match-id-form.model';
import * as MatchIdFormValidators from './match-id-form.validators';

export const matchIdFormSchema =
  schema<MatchIdFormModel.FormModel>(path => {
    registerMatchIdRules(path);
  });

function registerMatchIdRules(path: SchemaPathTree<MatchIdFormModel.FormModel>): void {
  required(path.matchId, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.REQUIRED,
    }),
  });

  MatchIdFormValidators.registerMatchIdValidator(path.matchId);
}
