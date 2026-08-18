import {computed, effect} from '@angular/core';

/**
 * Observes a selected signal value and invokes the observer whenever that value changes.
 *
 * The selector is wrapped in a computed signal so changes to unrelated state properties
 * do not trigger the observer when the selected value remains unchanged.
 *
 * @param selector - Function that returns the signal value to observe.
 * @param observer - Function invoked with the current value when the observed value changes.
 */
export function observeSignalProperty<T>(
  selector: () => T,
  observer: (value: T) => void,
): void {
  const value = computed(selector);

  effect(() => {
    observer(value());
  });
}
