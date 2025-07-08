import {AbstractControl, FormArray, ValidationErrors, ValidatorFn} from '@angular/forms';
import {isValidObjectId} from '../utils/object-id.utils';
import {PlayerType} from '../../models/basematch/player-type';

export class CustomValidators {

  static minLengthArray(minLength: number, propertyName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

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
      if (!control.value) return null;

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

    return isFinite(control.value) ? null : {isNotNumber: true};
  }

  static singleBotPlayerValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      // The control is the FormArray itself
      if (!(control instanceof FormArray)) {
        return null; // Or throw an error if it's always expected to be a FormArray
      }

      const playersArray = control as FormArray;

      // Count how many players have the type DART_BOT
      const botCount = playersArray.getRawValue()
        .filter(player => player.type === PlayerType.DART_BOT)
        .length;

      // If the count is more than 1, return an error object. Otherwise, return null (no error).
      return botCount > 1 ? {maxOneBot: true} : null;
    };
  }

  static requireHumanWithBotValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      // The control is the FormArray itself
      if (!(control instanceof FormArray)) {
        return null; // Or throw an error if it's always expected to be a FormArray
      }

      const playersArray = control as FormArray;

      // Count how many players have the type DART_BOT
      const botCount = playersArray.getRawValue()
        .filter(player => player.type === PlayerType.DART_BOT)
        .length;

      const playerCount = playersArray.getRawValue().length;

      // If the count is more than 1, return an error object. Otherwise, return null (no error).
      return botCount > 0 && playerCount === botCount ? {botRequiresHuman: true} : null;
    };
  }
}
