import {
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  KeypadButton,
  KeypadComponentComponent
} from '../../../../shared/components/keypad-component/keypad-component.component';
import {MatCard, MatCardContent} from '@angular/material/card';
import {appendInteger, removeLastDigit} from '../../../../shared/utils/number.utils';
import {BaseComponent} from '../../../../shared/components/base/base.component';
import {LocalX01SettingsService} from '../../../../shared/services/local-x01-settings/local-x01-settings.service';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {Subscription as DexieSubscription} from 'dexie';
import {LocalX01SettingsRecord} from '../../../../shared/services/local-x01-settings/local-x01-settings-record';


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
export class X01ScoreInputComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() match?: X01Match | null = undefined;
  @Output() submitScoreEvent = new EventEmitter<number>();

  private readonly localX01SettingsService: LocalX01SettingsService = inject(LocalX01SettingsService);
  private localSettingsChangeSub?: DexieSubscription = undefined;
  private localX01SettingsRecord?: LocalX01SettingsRecord = undefined;

  protected score?: number = undefined;
  protected isWindowFocused: boolean = document.hasFocus();
  protected isSubmitEnabled: boolean = true;
  protected isDataLoaded: boolean = false;

  ngOnInit() {
    // When the parent component doesn't bind a match, setup initial flags.
    if (this.match === undefined) {
      this.updateIsSubmitEnabled();
    }
  }

  /**
   * Watch for changes to match @Input.
   * When the match id is the same as the previous match, update the `isSubmitEnabled` flag.
   * When the match id has changed get the local settings for the given match and update the `isSubmitEnabled` flag.
   *
   * @param changes SimpleChanges - containing the previous and current values of the changed properties.
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['match']) {
      const prevMatch = changes['match'].previousValue;
      console.log('Changes: ' + this.match);
      if (this.match?.id === prevMatch?.id) { // Match id is the same, update submit enabled flag.
        this.updateIsSubmitEnabled();
      } else { // Match id has changed, subscribe to new match local settings.
        this.subscribeLocalSettingsChanges(this.match?.id);
      }
    }
  }

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
   * On Destroy unsubscribe to the local settings sub.
   */
  override ngOnDestroy() {
    super.ngOnDestroy();
    this.localSettingsChangeSub?.unsubscribe();
  }

  /**
   * Subscribes to changes in the local X01 settings for a match. When settings are received, update the submit enabled
   * flag.
   *
   * @param matchId string - The MatchId to get the local settings for.
   */
  private subscribeLocalSettingsChanges(matchId?: string) {
    this.localSettingsChangeSub?.unsubscribe();

    // If there is no matchId, there is nothing to subscribe to.
    if (!matchId) {
      this.localSettingsChangeSub = undefined;
      this.updateIsSubmitEnabled();
      return;
    }

    // Subscribe to the local settings live query for the match id. On each update, set submit enabled
    this.localSettingsChangeSub = this.localX01SettingsService
      .getX01SettingsLiveQuery(matchId)
      .subscribe(localX01SettingsRecord => {
        this.localX01SettingsRecord = localX01SettingsRecord;
        this.updateIsSubmitEnabled();
      });
  }

  /**
   * Updates `isSubmitEnabled` using the following rules:
   * - Enabled when there is no match, no current thrower, no local settings record for the match or no `scoreFor` property.
   * - Enabled when `scoreFor` contains the `currentThrower`, otherwise Disabled.
   */
  private updateIsSubmitEnabled() {
    const currentThrower = this.match?.matchProgress.currentThrower;

    // Submit is enabled by default.
    if (!this.match || !currentThrower || !this.localX01SettingsRecord || !this.localX01SettingsRecord.scoreFor) {
      this.isSubmitEnabled = true;
      this.isDataLoaded = true;
      return;
    }

    // Submit is enabled when the current thrower is in the 'score for' array.
    this.isSubmitEnabled = this.localX01SettingsRecord.scoreFor.includes(currentThrower);
    this.isDataLoaded = true;
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
