import {Component, DestroyRef, EventEmitter, inject, Output} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {
  KeydownEventDispatcherService
} from '../../services/keydown-event-dispatcher-service/keydown-event-dispatcher.service';
import {BaseComponent} from '../base/base.component';

export enum KeypadButton {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
  EIGHT = 8,
  NINE = 9,
  ZERO = 0,
  DELETE = 'Del',
  ENTER = 'Ent.',
}

@Component({
  selector: 'app-keypad-component',
  imports: [
    MatButton
  ],
  standalone: true,
  templateUrl: './keypad-component.component.html',
  styleUrl: './keypad-component.component.scss'
})
export class KeypadComponentComponent extends BaseComponent {
  /**
   * The ordered list of keypad buttons to be displayed in the template.
   */
  keys: KeypadButton[] = [
    KeypadButton.ONE, KeypadButton.TWO, KeypadButton.THREE,
    KeypadButton.FOUR, KeypadButton.FIVE, KeypadButton.SIX,
    KeypadButton.SEVEN, KeypadButton.EIGHT, KeypadButton.NINE,
    KeypadButton.DELETE, KeypadButton.ZERO, KeypadButton.ENTER,
  ];

  @Output() keyPress = new EventEmitter<KeypadButton>();

  private keydownEventDispatcher = inject(KeydownEventDispatcherService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    super();
    this.initKeyDownListener();
  }

  /**
   * Initializes the global keyboard event listener using a shared service.
   * Subscribes to `keydown` events and handles them with internal logic.
   */
  private initKeyDownListener() {
    const keyDownSub = this.keydownEventDispatcher.getKeyDownObservable(this.destroyRef)
      .subscribe(event => this.handleKeyboardEvent(event));
    this.subscription.add(keyDownSub);
  }

  /**
   * Emits a `keyPress` event when a keypad button is clicked.
   *
   * @param key - The keypad button clicked by the user
   */
  onKeyClick(key: KeypadButton): void {
    this.keyPress.emit(key);
  }

  /**
   * Handles physical keyboard input, maps it to a `KeypadButton` if valid,
   * and emits a `keyPress` event. Prevents default input behavior.
   *
   * @param event - The keyboard event
   */
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.repeat) return;

    const key = this.mapKey(event);
    if (key !== null) {
      event.preventDefault();
      this.keyPress.emit(key);
    }
  }

  /**
   * Maps supported `KeyboardEvent.key` values to `KeypadButton` enum values.
   *
   * @param event - Keyboard event to map
   * @returns Corresponding `KeypadButton`, or `null` if not handled
   */
  private mapKey(event: KeyboardEvent): KeypadButton | null {
    switch (event.key) {
      case '0':
        return KeypadButton.ZERO;
      case '1':
        return KeypadButton.ONE;
      case '2':
        return KeypadButton.TWO;
      case '3':
        return KeypadButton.THREE;
      case '4':
        return KeypadButton.FOUR;
      case '5':
        return KeypadButton.FIVE;
      case '6':
        return KeypadButton.SIX;
      case '7':
        return KeypadButton.SEVEN;
      case '8':
        return KeypadButton.EIGHT;
      case '9':
        return KeypadButton.NINE;
      case 'Enter':
        return KeypadButton.ENTER;
      case 'Delete':
        return KeypadButton.DELETE;
      case 'Backspace':
        return KeypadButton.DELETE;
      default:
        return null;
    }
  }

}
