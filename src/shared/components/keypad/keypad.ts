import {Component, input, output} from '@angular/core';
import {MatButton} from '@angular/material/button';

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
  ENTER = 'Ent.'
}

@Component({
  selector: 'app-keypad',
  imports: [
    MatButton
  ],
  templateUrl: './keypad.html',
  styleUrl: './keypad.scss'
})
export class Keypad {
  readonly enterEnabled = input<boolean>(true);

  readonly keyPress = output<KeypadButton>();

  protected readonly KeypadButton = KeypadButton;

  protected readonly keys: KeypadButton[] = [
    KeypadButton.ONE,
    KeypadButton.TWO,
    KeypadButton.THREE,
    KeypadButton.FOUR,
    KeypadButton.FIVE,
    KeypadButton.SIX,
    KeypadButton.SEVEN,
    KeypadButton.EIGHT,
    KeypadButton.NINE,
    KeypadButton.DELETE,
    KeypadButton.ZERO,
    KeypadButton.ENTER
  ];

  /**
   * Handles a keypad button press.
   *
   * @param key - Keypad button that was pressed.
   */
  protected onKeyPress(key: KeypadButton): void {
    this.keyPress.emit(key);
  }
}
