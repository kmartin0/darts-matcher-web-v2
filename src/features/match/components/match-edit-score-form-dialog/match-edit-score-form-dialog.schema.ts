import {max, min, required, schema, SchemaPathTree} from '@angular/forms/signals';
import {ValidationErrorKey, ValidationErrorMessageUtil} from '../../../../shared/utils/error-message.util';
import * as EditScoreFormDialogModel from './match-edit-score-form-dialog.model';

const MIN_SCORE = 0;
const MAX_SCORE = 180;

export const EDIT_SCORE_FORM_DIALOG_SCHEMA =
  schema<EditScoreFormDialogModel.FormModel>(path => {
    registerScoreRules(path);
  });

/**
 * Registers validation rules for the score field.
 *
 * @param path - Schema path tree for the edit score form.
 */
function registerScoreRules(path: SchemaPathTree<EditScoreFormDialogModel.FormModel>): void {
  required(path.score, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.REQUIRED
    })
  });

  min(path.score, MIN_SCORE, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MIN,
      min: MIN_SCORE
    })
  });

  max(path.score, MAX_SCORE, {
    message: ValidationErrorMessageUtil.getErrorMessage({
      key: ValidationErrorKey.MAX,
      max: MAX_SCORE
    })
  });
}
