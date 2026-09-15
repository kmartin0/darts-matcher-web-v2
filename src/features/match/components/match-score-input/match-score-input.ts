import {Component, HostListener, output, signal} from '@angular/core';
import {MatCard, MatCardContent} from '@angular/material/card';
import {Keypad, KeypadButton} from '../../../../shared/components/keypad/keypad';

@Component({
  selector: 'app-match-score-input',
  imports: [
    MatCard,
    MatCardContent,
    Keypad
  ],
  templateUrl: './match-score-input.html',
  styleUrl: './match-score-input.scss'
})
export class MatchScoreInput {
  readonly submitScore = output<number>();

  protected readonly score = signal<number | null>(null);
  protected readonly isWindowFocused = signal<boolean>(document.hasFocus());

  /**
   * Clears the currently entered score.
   */
  clear(): void {
    this.score.set(null);
  }

  /**
   * Marks the score input as inactive when the browser window loses focus.
   */
  @HostListener('window:blur')
  protected onWindowBlur(): void {
    this.isWindowFocused.set(false);
  }

  /**
   * Marks the score input as active when the browser window regains focus.
   */
  @HostListener('window:focus')
  protected onWindowFocus(): void {
    this.isWindowFocused.set(true);
  }

  /**
   * Handles a keypad button press.
   *
   * @param key - Keypad button that was pressed.
   */
  protected onKeyPress(key: KeypadButton): void {
    switch (key) {
      case KeypadButton.DELETE:
        this.deleteDigit();
        break;

      case KeypadButton.ENTER:
        this.submit();
        break;

      default:
        this.addDigit(key);
    }
  }

  /**
   * Adds a digit to the entered score.
   *
   * Scores above 180 are ignored.
   *
   * @param digit - Digit to add.
   */
  private addDigit(digit: number): void {
    const currentScore = this.score() ?? 0;
    const nextScore = currentScore * 10 + digit;

    if (nextScore > 180) return;

    this.score.set(nextScore);
  }

  /**
   * Removes the last entered digit.
   */
  private deleteDigit(): void {
    const score = this.score();
    if (score === null) return;

    if (score < 10) {
      this.score.set(null);
      return;
    }

    this.score.set(Math.floor(score / 10));
  }

  /**
   * Emits the currently entered score.
   *
   * An empty input is submitted as zero.
   */
  private submit(): void {
    this.submitScore.emit(this.score() ?? 0);
  }
}
