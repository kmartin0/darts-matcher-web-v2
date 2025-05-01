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
   * A map of default error message generators keyed by validation error name.
   */
  private defaultErrors: Record<string, (value?: ErrorValue) => string> = {
    required: () => 'This field is required.',
    minlength: (value) => `This field requires a minimum of ${value?.requiredLength} characters.`,
    maxlength: (value) => `This field requires a maximum of ${value?.requiredLength} characters.`,
    min: (value) => `Must be at least ${value?.min}`,
    max: (value) => `Must not exceed ${value?.max}`,
    email: () => 'This field requires a valid email.',
    confirmPassword: () => 'Passwords must match.',
    minLengthArray: (value) => `Must be at least ${value?.min} ${value?.name} `,
    maxLengthArray: (value) => `Must not be more than ${value?.max} ${value?.name}`,
    customError: (value) => `${value}`,
    unknown: () => 'An unknown error has occurred.',
  };

  /**
   * Converts all validation errors into an array of user-friendly messages.
   *
   * @param errors - A `ValidationErrors` object from a form control.
   * @returns An array of error messages.
   */
  getAllErrorMessages(errors: ValidationErrors): string[] {
    if (!errors) return [];

    return Object.entries(errors).map(([key, value]) => {
      const messageFn = this.defaultErrors[key] ?? this.defaultErrors['unknown'];
      return messageFn(value);
    });
  }

  /**
   * Retrieves the first validation error message from a `ValidationErrors` object.
   *
   * @param errors - A `ValidationErrors` object from a form control.
   * @returns The first error message, or `null` if no errors exist.
   */
  getFirstErrorMessage(errors: ValidationErrors): string | null {
    if (!errors) return null;

    const [errorKey, errorValue] = Object.entries(errors)[0] ?? ['unknown', {}];
    const messageFn = this.defaultErrors[errorKey] ?? this.defaultErrors['unknown'];
    return messageFn(errorValue);
  }
}
