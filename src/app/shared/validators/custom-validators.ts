import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

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
}
