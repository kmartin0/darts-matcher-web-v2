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

  protected readonly errorMessage = computed(() => {
    const state = this.field()();

    if (!state.dirty() && !state.touched()) {
      return null;
    }

    return state.errors()[0]?.message ?? null;
  });
}
