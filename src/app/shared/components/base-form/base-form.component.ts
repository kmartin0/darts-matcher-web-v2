import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {AbstractControl, FormArray, FormBuilder, FormGroup, NgForm} from '@angular/forms';
import {ApiErrorBody} from '../../../api/error/api-error-body';


@Component({
  template: ''
})
export abstract class BaseFormComponent<T> {

  @ViewChild('formDirective') protected formDirective!: NgForm;
  @Input() loading$?: Subject<boolean>;
  @Input() submitText = 'Submit';
  @Input() showSubmitButton = true;
  @Output() validForm = new EventEmitter<T>();

  protected constructor(protected fb: FormBuilder) {
  }

  abstract get form(): FormGroup;

  handleApiError(apiError: ApiErrorBody) {
    if (!apiError) this.setError('', 'An unknown error occurred');
  }

  /**
   * When the form gets submitted, checks the validity of the form. If the form is valid, then emits the form result
   * of type T.
   */
  onSubmitForm() {
    this.updateFormValidity(this.form);
    console.log(this.form.valid);
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

    this.formDirective.resetForm(value);
  }

  /**
   * Sets a custom error message on a specific form control or on the entire form if the control is not found.
   *
   * If a control with the given key exists, the error will be added to its validation errors under the key `customError`.
   * If the control is not found, the error is applied to the form group itself.
   *
   * @param formControlKey - The name of the control to which the error should be assigned.
   * @param error - The error message to assign. If empty, the method does nothing.
   */
  setError(formControlKey: string, error: string) {
    if (!error) return;

    const control = this.form.get(formControlKey) || this.form;

    if (control) {
      const tmpErrors = control.errors ?? {};
      Object.assign(tmpErrors, {customError: error});
      control.setErrors(tmpErrors);
    }
  }

  /**
   * Recursively updates the validity and marks as touched the given control and all of its children.
   *
   * @param control - The root form control (FormGroup, FormArray, or FormControl) to validate and mark.
   */
  updateFormValidity(control: AbstractControl) {
    control.updateValueAndValidity();
    control.markAsTouched();

    if (control instanceof FormGroup) {
      Object.keys(control.controls).forEach(key => {
        const child = control.get(key);
        if (child != null) this.updateFormValidity(child);
      });
    } else if (control instanceof FormArray) {
      control.controls.forEach(_control => {
        this.updateFormValidity(_control);
      });
    }
  }

  /**
   * @returns The current form value cast as type `T`.
   */
  protected createFormResult(): T {
    return Object.assign({}, this.form.value) as T;
  }
}
