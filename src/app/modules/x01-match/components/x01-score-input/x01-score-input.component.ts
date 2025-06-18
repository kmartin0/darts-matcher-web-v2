import {Component, EventEmitter, HostListener, Output} from '@angular/core';
import {
  KeypadButton,
  KeypadComponentComponent
} from '../../../../shared/components/keypad-component/keypad-component.component';
import {MatCard, MatCardContent} from '@angular/material/card';
import {appendInteger, removeLastDigit} from '../../../../shared/utils/number.utils';
import {BaseComponent} from '../../../../shared/components/base/base.component';

@Component({
  selector: 'app-x01-score-input',
  imports: [
    KeypadComponentComponent,
    MatCard,
    MatCardContent
  ],
  standalone: true,
  templateUrl: './x01-score-input.component.html',
  styleUrl: './x01-score-input.component.scss'
})
export class X01ScoreInputComponent extends BaseComponent {
  @Output() submitScoreEvent = new EventEmitter<number>();
  score?: number = undefined;
  isWindowFocused: boolean = document.hasFocus();

  /**
   * Marks the component as unfocused when the window loses focus.
   */
  @HostListener('window:blur', ['$event'])
  onBlur(): void {
    this.isWindowFocused = false;
  }

  /**
   * Marks the component as focused when the window regains focus.
   */
  @HostListener('window:focus', ['$event'])
  onFocus(): void {
    this.isWindowFocused = true;
  }

  /**
   * Handles keypad button presses and updates the score or triggers submission.
   *
   * @param key - The keypad button that was pressed
   */
  onKeyPress(key: KeypadButton) {
    switch (key) {
      case KeypadButton.ZERO:
      case KeypadButton.ONE:
      case KeypadButton.TWO:
      case KeypadButton.THREE:
      case KeypadButton.FOUR:
      case KeypadButton.FIVE:
      case KeypadButton.SIX:
      case KeypadButton.SEVEN:
      case KeypadButton.EIGHT:
      case KeypadButton.NINE: {
        this.updateScore(appendInteger(this.score ?? 0, key));
        break;
      }

      case KeypadButton.DELETE: {
        this.updateScore(removeLastDigit(this.score ?? 0));
        break;
      }

      case KeypadButton.ENTER: {
        this.submitScore();
        break;
      }

      default:
        throw new Error('Unknown KeyPadButton');
    }
  }

  /**
   * Clears the score input.
   */
  clearScoreInput() {
    this.score = undefined;
  }

  /**
   * Updates the score with a new value. Clears the input if the value is undefined.
   * Accepts only scores in the valid range of 0–180.
   *
   * @param newScore - The new score to apply
   */
  private updateScore(newScore: number | undefined) {
    if (newScore === undefined) {
      this.score = undefined;
      return;
    } else if (newScore >= 0 && newScore <= 180) this.score = newScore;
  }

  /**
   * Emits the current score. If the score is undefined, emits 0.
   */
  private submitScore() {
    this.submitScoreEvent.emit(this.score ?? 0);
  }
}
