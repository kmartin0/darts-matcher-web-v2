import {Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChanges} from '@angular/core';
import {AbstractControl, ValidationErrors} from '@angular/forms';
import {ErrorMessageUtil} from '../../utils/validator-error-message.utils';
import {Subscription} from 'rxjs';

@Directive({
  standalone: true,
  selector: '[matFormError]'
})
export class MatFormErrorDirective implements OnInit, OnDestroy {
  @Input() control!: AbstractControl;
  private subscription = new Subscription();

  constructor(private el: ElementRef, private renderer: Renderer2, private errorUtil: ErrorMessageUtil) {
  }

  /**
   * Lifecycle hook that initializes the directive and subscribes to control changes.
   */
  ngOnInit(): void {
    this.subscribeToControl();
  }

  /**
   * Lifecycle hook that cleans up all subscriptions to prevent memory leaks.
   */
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Subscribes to `statusChanges` and `valueChanges` of the control, updating error messages accordingly.
   */
  private subscribeToControl(): void {
    this.subscription.unsubscribe();
    this.subscription = new Subscription();

    if (this.control) {
      this.subscription.add(
        this.control.statusChanges?.subscribe(() => this.updateErrorMessage())
      );
      this.subscription.add(
        this.control.valueChanges?.subscribe(() => this.updateErrorMessage())
      );
    }
  }

  /**
   * Retrieves error messages from the control and updates the DOM to reflect them.
   * Clears existing messages if no errors are present.
   */
  private updateErrorMessage(): void {
    this.clearErrorMessages();

    if (this.control) {
      const errors = this.control.errors as ValidationErrors;

      if (errors) {
        const errorMessage = this.errorUtil.getFirstErrorMessage(errors); // Use the injected service method
        if (errorMessage) this.renderErrorMessage(errorMessage); // Display the error messages
      }
    }
  }

  /**
   * Renders a list of error messages as text inside the host element.
   *
   * @param errorMessage - Array of validation error messages to display.
   */
  private renderErrorMessage(errorMessage: string): void {
    // Add error message
    const errorMessageElement = this.renderer.createText(errorMessage);
    this.renderer.appendChild(this.el.nativeElement, errorMessageElement);
  }

  /**
   * Renders a list of error messages as text inside the host element.
   *
   * @param errorMessages - Array of validation error messages to display.
   */
  private renderErrorMessages(errorMessages: string[]): void {
    // Add each error message dynamically
    errorMessages.forEach(message => {
      this.renderErrorMessage(message);
    });
  }

  /**
   * Clears all existing error messages from the host element.
   */
  private clearErrorMessages(): void {
    // Clear existing error messages if any
    this.el.nativeElement.innerHTML = '';
  }
}
