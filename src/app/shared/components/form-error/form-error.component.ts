import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ErrorComponent} from '../error/error.component';
import {AbstractControl, ValidationErrors} from '@angular/forms';
import {Subscription} from 'rxjs';
import {ErrorMessageUtil} from '../../utils/validator-error-message.utils';

@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [
    ErrorComponent
  ],
  templateUrl: './form-error.component.html',
  styleUrl: './form-error.component.scss'
})
export class FormErrorComponent implements OnInit, OnDestroy {
  @Input() control!: AbstractControl;

  private controlSubscription = new Subscription();
  private submitSubscription = new Subscription();

  private _errorMessage: string | null = null;

  constructor(private errorMessageUtil: ErrorMessageUtil) {
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
   * Lifecycle hook that cleans up all subscriptions to prevent memory leaks.
   */
  ngOnDestroy() {
    this.controlSubscription.unsubscribe();
    this.submitSubscription.unsubscribe();
  }

  /**
   * Subscribes to `statusChanges` and `valueChanges` of the control, updating error messages accordingly.
   */
  private subscribeToControl(): void {
    this.controlSubscription.unsubscribe();
    this.controlSubscription = new Subscription();
    this.controlSubscription.add(this.control.statusChanges.subscribe(() => this.updateErrorMessage()));
  }

  /**
   * Converts the first validation error to a user-friendly string and updates the error message property with the value.
   */
  private updateErrorMessage() {
    const controlError: ValidationErrors | null = this.control.errors;
    this._errorMessage = this.errorMessageUtil.getFirstErrorMessage(controlError);
  }
}
