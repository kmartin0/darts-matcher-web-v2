import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {isValidObjectId} from '../utils/object-id.utils';

export class CustomValidators {

  static minLengthArray(minLength: number, propertyName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      return control.value.length >= minLength ? null : {
        minLengthArray: {
          name: propertyName,
          actual: control.value.length,
          min: minLength
        }
      };
    };
  }

  static maxLengthArray(maxLength: number, propertyName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      return control.value.length <= maxLength ? null : {
        maxLengthArray: {
          name: propertyName,
          actual: control.value.length,
          max: maxLength
        }
      };
    };
  }

  static validObjectId(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    return isValidObjectId(control.value) ? null : {invalidObjectId: true};
  }

  static isNumber(control: AbstractControl): ValidationErrors | null {
    // If there's no value, don't run the validator. Let `Validators.required` handle it.
    if (control.value === null || control.value === undefined || control.value === '') {
      return null;
    }

    return isFinite(control.value) ? null : { isNotNumber: true };
  }
}
