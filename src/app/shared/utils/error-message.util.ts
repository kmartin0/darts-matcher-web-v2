import {ValidationErrors} from '@angular/forms';
import {Injectable} from '@angular/core';

interface ErrorValue {
  requiredLength?: number;
  min?: number;
  max?: number;
  name?: string;
}

@Injectable({
  providedIn: 'root', // This means the service is available globally (root scope)
})
export class ErrorMessageUtil {

  /**
   * The keys of predefined error keys used in validation error messages (defaultErrors).
   */
  static errorKeys = {
    REQUIRED: 'required',
    MINLENGTH: 'minlength',
    MAXLENGTH: 'maxlength',
    MIN: 'min',
    MAX: 'max',
    EMAIL: 'email',
    CONFIRM_PASSWORD: 'confirmPassword',
    MIN_LENGTH_ARRAY: 'minLengthArray',
    MAX_LENGTH_ARRAY: 'maxLengthArray',
    INVALID_OBJECT_ID: 'invalidObjectId',
    IS_NOT_NUMBER: 'isNotNumber',
    MAX_ONE_BOT: 'maxOneBot',
    BOT_REQUIRES_HUMAN: 'botRequiresHuman',
    CUSTOM_ERROR: 'customError',
    UNKNOWN: 'unknown',
  };

  /**
   * A map of default error message generators keyed by validation error name.
   */
  private defaultErrors: Record<string, (value?: ErrorValue) => string> = {
    [ErrorMessageUtil.errorKeys.REQUIRED]: () => 'This field is required.',
    [ErrorMessageUtil.errorKeys.MINLENGTH]: (value) => `This field requires a minimum of ${value?.requiredLength} characters.`,
    [ErrorMessageUtil.errorKeys.MAXLENGTH]: (value) => `This field requires a maximum of ${value?.requiredLength} characters.`,
    [ErrorMessageUtil.errorKeys.MIN]: (value) => `Must be at least ${value?.min}`,
    [ErrorMessageUtil.errorKeys.MAX]: (value) => `Must not exceed ${value?.max}`,
    [ErrorMessageUtil.errorKeys.EMAIL]: () => 'This field requires a valid email.',
    [ErrorMessageUtil.errorKeys.CONFIRM_PASSWORD]: () => 'Passwords must match.',
    [ErrorMessageUtil.errorKeys.MIN_LENGTH_ARRAY]: (value) => `Must be at least ${value?.min} ${value?.name}`,
    [ErrorMessageUtil.errorKeys.MAX_LENGTH_ARRAY]: (value) => `Must not be more than ${value?.max} ${value?.name}`,
    [ErrorMessageUtil.errorKeys.INVALID_OBJECT_ID]: () => `Invalid Match ID`,
    [ErrorMessageUtil.errorKeys.IS_NOT_NUMBER]: () => `Invalid number`,
    [ErrorMessageUtil.errorKeys.MAX_ONE_BOT]: () => `A maximum of one bot is allowed.`,
    [ErrorMessageUtil.errorKeys.BOT_REQUIRES_HUMAN]: () => `A bot game requires a human player.`,
    [ErrorMessageUtil.errorKeys.CUSTOM_ERROR]: (value) => `${value}`,
    [ErrorMessageUtil.errorKeys.UNKNOWN]: () => 'An unknown error has occurred.',
  };

  /**
   * Converts all validation errors into an array of user-friendly messages.
   *
   * @param errors - A `ValidationErrors` object from a form control.
   * @returns An array of error messages.
   */
  getAllErrorMessages(errors: ValidationErrors | null): string[] {
    if (!errors) return [];

    return Object.entries(errors).map(([errorKey, errorValue]) => {
      return this.getErrorMessage(errorKey, errorValue);
    });
  }

  /**
   * Retrieves the first validation error message from a `ValidationErrors` object.
   *
   * @param errors - A `ValidationErrors` object from a form control.
   * @returns The first error message, or `null` if no errors exist.
   */
  getFirstErrorMessage(errors: ValidationErrors | null): string | null {
    if (!errors) return null;

    const [errorKey, errorValue] = Object.entries(errors)[0];
    return this.getErrorMessage(errorKey, errorValue);
  }

  /**
   * Retrieves the appropriate error message based on the provided error key and value.
   *
   * @param errorKey - The key that represents the type of error (e.g., 'required', 'minlength').
   * @param errorValue - The value associated with the error key (e.g. length for 'minLength').
   * @private A string that contains the error message for the provided error key and value.
   */
  getErrorMessage(errorKey: string, errorValue?: any): string {
    const messageFn = this.defaultErrors[errorKey] ?? this.defaultErrors[ErrorMessageUtil.errorKeys.UNKNOWN];
    return messageFn(errorValue);
  }
}
