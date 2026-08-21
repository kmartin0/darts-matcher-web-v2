import {SchemaPath, validate} from '@angular/forms/signals';
import {isValidObjectId} from '../../../../data/api/utils/object-id.util';
import {ValidationErrorKey, ValidationErrorMessageUtil} from '../../../../shared/utils/error-message.util';

/**
 * Registers validation for a match ID field.
 *
 * The field is valid when empty or when its value is a valid ObjectId.
 * Empty values are left to required validation.
 *
 * @param path - Schema path of the match ID field.
 */
export function registerMatchIdValidator(path: SchemaPath<string>): void {
  validate(path, ({value}) => {
    if (value() === '' || isValidObjectId(value())) {
      return null;
    }

    return {
      kind: ValidationErrorKey.INVALID_MATCH_ID,
      message: ValidationErrorMessageUtil.getErrorMessage({
        key: ValidationErrorKey.INVALID_MATCH_ID,
      }),
    };
  });
}
