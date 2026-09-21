import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  input,
  linkedSignal,
  output,
  signal,
  viewChild
} from '@angular/core';
import {MatchStatus} from '../../../../data/model/base-match/match-status';
import {LocalMatchSettings} from '../../../../data/model/settings/local-match-settings';
import {X01CheckoutsMap} from '../../../../data/model/x01/checkout/x01-checkout';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {ErrorMessage} from '../../../../shared/components/error-message/error-message';
import {MatchEditControls} from '../match-edit-controls/match-edit-controls';
import {MatchHeader} from '../match-header/match-header';
import {MatchPlayerCards} from '../match-player-cards/match-player-cards';
import {MatchScoreInput} from '../match-score-input/match-score-input';
import {MatchScoreTable} from '../match-score-table/match-score-table';
import {MatchScoreTableEditTarget} from '../match-score-table/match-score-table-edit-target';
import {isCurrentLegSelected, isCurrentOrLastLegSelected, LegSelection} from './leg-selection';

@Component({
  selector: 'app-match-board',
  templateUrl: './match-board.html',
  styleUrl: './match-board.scss',
  imports: [
    MatchHeader,
    MatchPlayerCards,
    MatchEditControls,
    MatchScoreTable,
    MatchScoreInput,
    ErrorMessage
  ]
})
export class MatchBoard {
  // Inputs.
  readonly match = input.required<X01Match>();
  readonly localMatchSettings = input.required<LocalMatchSettings>();
  readonly checkouts = input.required<X01CheckoutsMap>();
  readonly scoreInputError = input<string | null>(null);

  // Outputs.
  readonly deleteLastTurn = output<void>();
  readonly editTurn = output<MatchScoreTableEditTarget>();
  readonly submitScore = output<number>();

  // View queries.
  private readonly scoreInput = viewChild(MatchScoreInput);
  private readonly boardContent = viewChild.required<ElementRef<HTMLElement>>('boardContent');
  private readonly playerCards = viewChild.required(MatchPlayerCards);

  // Local state.
  protected readonly isEditMode = signal<boolean>(false);

  protected readonly legSelection = linkedSignal<X01Match, LegSelection>({
    source: this.match,
    computation: (match, previous) =>
      this.createLegSelection(match, previous?.source, previous?.value)
  });

  // Derived state.
  protected readonly isScoreInputVisible = computed<boolean>(() => {
    const match = this.match();

    return match.matchStatus === MatchStatus.IN_PLAY &&
      isCurrentLegSelected(match, this.legSelection());
  });

  protected readonly scoreSubmissionEnabled = computed<boolean>(() => {
    const currentThrowerId = this.match().matchProgress.currentThrower;

    return currentThrowerId !== null &&
      this.localMatchSettings().scoreForPlayerIds.includes(currentThrowerId);
  });

  constructor() {
    this.registerCurrentThrowerAutoScroll();
  }

  /**
   * Clears the currently entered score.
   */
  clearScoreInput(): void {
    this.scoreInput()?.clear();
  }

  /**
   * Updates the currently selected leg.
   *
   * @param legSelection - Leg selection to display.
   */
  protected onLegSelectionChange(legSelection: LegSelection): void {
    this.legSelection.set(legSelection);
  }

  /**
   * Toggles score editing mode.
   */
  protected onToggleEditMode(): void {
    this.isEditMode.update(isEditMode => !isEditMode);
  }

  /**
   * Resolves the leg selection for a new match snapshot.
   *
   * Follows the latest leg when the previous current leg was selected, or when
   * the last leg was selected in a match without a current leg. Otherwise,
   * preserves the selected set and leg using entries from the updated match.
   * Falls back to the last leg when the previous selection no longer exists.
   *
   * @param match - Updated match.
   * @param previousMatch - Previous match snapshot, when available.
   * @param previousLegSelection - Previous leg selection, when available.
   * @returns Leg selection for the updated match.
   */
  private createLegSelection(
    match: X01Match,
    previousMatch: X01Match | undefined,
    previousLegSelection: LegSelection | undefined
  ): LegSelection {
    // Select the last leg when there is no previous selection.
    if (previousMatch === undefined || previousLegSelection === undefined) {
      return this.createLegSelectionForLastLeg(match);
    }

    // Continue following the current leg, or the last leg when no current leg exists.
    if (isCurrentOrLastLegSelected(previousMatch, previousLegSelection)) {
      return this.createLegSelectionForLastLeg(match);
    }

    // Preserve the selected set and leg if they still exist in the updated match.
    const preservedLegSelection = this.createLegSelectionForLeg(
      match,
      previousLegSelection.setEntry.setNumber,
      previousLegSelection.legEntry.legNumber
    );

    return preservedLegSelection ?? this.createLegSelectionForLastLeg(match);
  }

  /**
   * Creates a leg selection for the given set and leg numbers.
   *
   * @param match - Match containing the sets and legs.
   * @param setNumber - Set number to select.
   * @param legNumber - Leg number to select within the set.
   * @returns Matching leg selection, or null when the set or leg does not exist.
   */
  private createLegSelectionForLeg(match: X01Match, setNumber: number, legNumber: number): LegSelection | null {
    const setEntry = match.sets.find(setEntry => setEntry.setNumber === setNumber);
    const legEntry = setEntry?.set.legs.find(legEntry => legEntry.legNumber === legNumber);

    if (setEntry === undefined || legEntry === undefined) {
      return null;
    }

    return {
      setEntry: setEntry,
      legEntry: legEntry
    };
  }

  /**
   * Creates a leg selection for the last leg in a match.
   *
   * Expects the match to contain at least one set and its last set to contain
   * at least one leg.
   *
   * @param match - Match containing the sets and legs.
   * @returns Selection containing the last set and leg.
   */
  private createLegSelectionForLastLeg(match: X01Match): LegSelection {
    const setEntry = match.sets.at(-1)!;
    const legEntry = setEntry.set.legs.at(-1)!;

    return {
      setEntry: setEntry,
      legEntry: legEntry
    };
  }

  /**
   * Registers horizontal scrolling to reveal the current thrower after rendering.
   */
  private registerCurrentThrowerAutoScroll(): void {
    afterRenderEffect({
      earlyRead: () => this.getCurrentThrowerScrollTarget(),

      write: target => {
        const scrollTarget = target();

        if (scrollTarget === null) {
          return;
        }

        this.boardContent().nativeElement.scrollTo({left: scrollTarget.left, behavior: 'smooth'});
      }
    });
  }

  /**
   * Gets the horizontal position that aligns the current thrower's card
   * with the left edge of the board content.
   *
   * @returns Scroll target, or null when no current thrower is displayed.
   */
  private getCurrentThrowerScrollTarget(): {left: number} | null {
    const card = this.playerCards().getCurrentThrowerElement();

    if (card === null) {
      return null;
    }

    const container = this.boardContent().nativeElement;
    const containerBounds = container.getBoundingClientRect();
    const cardBounds = card.getBoundingClientRect();
    const viewportLeft = containerBounds.left + container.clientLeft;

    return {
      left: container.scrollLeft + cardBounds.left - viewportLeft
    };
  }
}
