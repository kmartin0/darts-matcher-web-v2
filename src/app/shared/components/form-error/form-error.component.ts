import {Component, Input, OnInit} from '@angular/core';
import {ErrorComponent} from '../error/error.component';
import {AbstractControl, ValidationErrors} from '@angular/forms';
import {Subscription} from 'rxjs';
import {ErrorMessageUtil} from '../../utils/validator-error-message.utils';
import {BaseComponent} from '../base/base.component';

@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [
    ErrorComponent
  ],
  templateUrl: './form-error.component.html',
  styleUrl: './form-error.component.scss'
})
export class FormErrorComponent extends BaseComponent implements OnInit {
  @Input() control!: AbstractControl;
  private _errorMessage: string | null = null;
  private controlStatusSubscription?: Subscription;

  constructor(private errorMessageUtil: ErrorMessageUtil) {
    super();
  }

  get errorMessage(): string | null {
    return this._errorMessage;
  }

  /**
   * Lifecycle hook that initializes the directive and subscribes to control changes.
   */
  ngOnInit(): void {
    if (!this.control) throw new Error('A form error must have an @Input(): AbstractControl');
    this.subscribeToControl();
  }

  /**
   * Subscribes to `statusChanges` and `valueChanges` of the control, updating error messages accordingly.
   */
  private subscribeToControl(): void {
    this.controlStatusSubscription?.unsubscribe();
    this.controlStatusSubscription = this.control.statusChanges.subscribe(() => this.updateErrorMessage());
    this.subscription.add(this.controlStatusSubscription);
  }

  /**
   * Converts the first validation error to a user-friendly string and updates the error message property with the value.
   */
  private updateErrorMessage() {
    const controlError: ValidationErrors | null = this.control.errors;
    this._errorMessage = this.errorMessageUtil.getFirstErrorMessage(controlError);
  }
}
