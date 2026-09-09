import {Component, computed, input} from '@angular/core';
import {FieldTree} from '@angular/forms/signals';
import {ErrorMessage} from '../error-message/error-message';

@Component({
  selector: 'app-form-error',
  templateUrl: './form-error.html',
  styleUrl: './form-error.scss',
  imports: [ErrorMessage],
})
export class FormError {
  readonly field = input.required<FieldTree<unknown>>();

  protected readonly errorMessage = computed<string | null>(() =>
    this.resolveErrorMessage(this.field())
  );

  /**
   * Resolves the error message to display for a form field.
   *
   * @param field - Form field to resolve the error message from.
   * @returns First field error message, or null when errors should not be displayed.
   */
  private resolveErrorMessage(field: FieldTree<unknown>): string | null {
    const state = field();

    if (!state.dirty() && !state.touched()) {
      return null;
    }

    return state.errors()[0]?.message ?? null;
  }
}
