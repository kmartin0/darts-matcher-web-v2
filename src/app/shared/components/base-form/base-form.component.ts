import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {AbstractControl, FormArray, FormBuilder, FormGroup, NgForm} from '@angular/forms';
import {ApiErrorBody} from '../../../api/error/api-error-body';
import {ErrorMessageUtil} from '../../utils/validator-error-message.utils';


@Component({
  template: ''
})
export abstract class BaseFormComponent<T> {

  @ViewChild('formDirective') protected formDirective!: NgForm;
  @Input() loading$?: Subject<boolean>;
  @Input() submitText = 'Submit';
  @Input() showSubmitButton = true;
  @Output() validForm = new EventEmitter<T>();
  submitFormTrigger$ = new EventEmitter<void>;

  protected constructor(protected errorMessageUtil: ErrorMessageUtil) {
  }

  abstract get form(): FormGroup;

  /**
   * When the form gets submitted, checks the validity of the form. If the form is valid, then emits the form result
   * of type T.
   */
  onSubmitForm() {
    this.submitFormTrigger$.emit();
    this.updateFormValidity(this.form);
    console.log("Is Form Valid: " + this.form.valid);
    if (this.form.valid) {
      console.log(this.createFormResult());
      this.validForm.emit(this.createFormResult());
    }
  }

  /**
   * Resets the form control values and state
   * @param value – the new value for the form.
   */
  resetForm(value?: any) {
    if (!this.formDirective) throw new Error('Form must have a directive\'#formDirective="ngForm"\' to reset');
    console.log("Reset FORM");
    this.formDirective.resetForm(value);
  }

  /**
   * Sets a custom error message on a specific form control or on the entire form if the control is not found.
   *
   * If a control with the given key exists, the error will be added to its validation errors under the key `customError`.
   * If the control is not found, the error is applied to the form group itself.
   *
   * @param control - The control to which the error should be assigned.
   * @param errorKey - The validation error key.
   * @param error - The error message to assign. If empty, the method does nothing.
   */
  setError(control: AbstractControl | null, error?: string) {
    if (!error) return;

    if (!control) control = this.form;

    // const control = this.form.get(formControlKey) || this.form;
    const tmpErrors = control.errors ?? {};
    Object.assign(tmpErrors, {[ErrorMessageUtil.errorKeys.CUSTOM_ERROR]: error});
    control.setErrors(tmpErrors);
  }

  /**
   * Recursively updates the validity and marks as touched the given control and all of its children.
   *
   * @param control - The root form control (FormGroup, FormArray, or FormControl) to validate and mark.
   */
  updateFormValidity(control: AbstractControl): void {
    control.updateValueAndValidity({onlySelf: true});
    control.markAsTouched();

    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach(child => this.updateFormValidity(child));
    }
  }

  handleApiError(apiError?: ApiErrorBody) {
    if (!apiError) {
      this.setError(this.form, this.errorMessageUtil.getErrorMessage(ErrorMessageUtil.errorKeys.UNKNOWN));
      return;
    }
  }

  /**
   * @returns The current form value cast as type `T`.
   */
  protected createFormResult(): T {
    return Object.assign({}, this.form.value) as T;
  }

  private clearAllErrors(control: AbstractControl): void {
    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach(childControl => this.clearAllErrors(childControl));
    }

    // This clears errors at the current level (leaf or container)
    control.setErrors(null);
    control.updateValueAndValidity();
  }
}
