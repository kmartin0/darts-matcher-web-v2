import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  input,
  linkedSignal,
  output,
  untracked,
  viewChild,
  viewChildren
} from '@angular/core';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {isCurrentOrLastLegSelected, LegSelection} from '../match-board/leg-selection';
import {MatchScoreTableRow} from './match-score-table-row';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {X01MatchPlayer} from '../../../../data/model/x01/match/x01-match-player';
import {MatchScoreTableEditTarget} from './match-score-table-edit-target';

interface MatchScoreTableScrollTarget {
  setNumber: number;
  legNumber: number;
  roundNumber: number;
}

const ROUND_COLUMN_ID = 'round';

@Component({
  selector: 'app-match-score-table',
  templateUrl: './match-score-table.html',
  imports: [
    MatTable,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatIcon,
    MatIconButton
  ],
  styleUrl: './match-score-table.scss'
})
export class MatchScoreTable {
  readonly match = input.required<X01Match>();
  readonly legSelection = input.required<LegSelection>();
  readonly isEditMode = input.required<boolean>();

  readonly editTurn = output<MatchScoreTableEditTarget>();

  protected readonly ROUND_COLUMN_ID = ROUND_COLUMN_ID;

  protected readonly displayedColumns = computed<string[]>(() =>
    this.createDisplayedColumns(this.match())
  );

  protected readonly rows = computed<MatchScoreTableRow[]>(() =>
    this.createRows(this.match(), this.legSelection())
  );

  private readonly scrollTarget = linkedSignal<LegSelection, MatchScoreTableScrollTarget | null>({
    source: this.legSelection,
    computation: (legSelection, previous) => {
      // MatchBoard refreshes the leg selection on every match update, so read the latest match untracked.
      const match = untracked(this.match);
      const previousLegSelection = previous?.source;

      return this.createScrollTarget(match, legSelection, previousLegSelection);
    }
  });

  private readonly tableContainerElementRef = viewChild.required<ElementRef<HTMLDivElement>>('tableContainer');
  private readonly stickyHeaderRowElementRef = viewChild.required('stickyHeaderRow', {read: ElementRef});
  private readonly scoreRowElementRefs = viewChildren('scoreRow', {read: ElementRef});

  constructor() {
    this.registerScrollEffect();
  }

  /**
   * Emits the selected turn and its match position for editing.
   *
   * @param player - Player whose turn was selected.
   * @param row - Score table row containing the turn.
   */
  protected onEditTurn(player: X01MatchPlayer, row: MatchScoreTableRow): void {
    const currentTurn = row.turns[player.playerId];
    if (!currentTurn) return;

    const legSelection = this.legSelection();

    this.editTurn.emit({
      playerId: player.playerId,
      playerName: player.playerName,
      setNumber: legSelection.setEntry.setNumber,
      legNumber: legSelection.legEntry.legNumber,
      roundNumber: row.roundNumber,
      currentTurn: currentTurn
    });
  }

  /**
   * Tracks score table rows by round number, so rows are updated in place
   * instead of being recreated whenever the match data changes.
   *
   * @param _index - Row index (unused).
   * @param row - Score table row.
   * @returns Round number identifying the row.
   */
  protected trackByRoundNumber(_index: number, row: MatchScoreTableRow): number {
    return row.roundNumber;
  }

  /**
   * Creates the displayed table columns with the round column centered between players.
   *
   * @param match - Match containing the players.
   * @returns Ordered table column IDs.
   */
  private createDisplayedColumns(match: X01Match): string[] {
    const playerIds = match.players.map(player => player.playerId);
    const half = Math.floor(playerIds.length / 2);

    return [
      ...playerIds.slice(0, half),
      ROUND_COLUMN_ID,
      ...playerIds.slice(half)
    ];
  }

  /**
   * Creates the score table rows for the selected leg.
   *
   * @param match - Match containing the current match progress.
   * @param legSelection - Selected leg to create rows for.
   * @returns Score table rows for the selected leg.
   */
  private createRows(match: X01Match, legSelection: LegSelection): MatchScoreTableRow[] {
    const leg = legSelection.legEntry.leg;
    let dartsThrown = 0;

    // Map the leg rounds to score table rows.
    return leg.rounds.map((roundEntry, index) => {
      const isFinalRound = index === leg.rounds.length - 1;
      const checkoutDartsUsed = leg.checkoutDartsUsed;
      const isCheckoutRound = isFinalRound && leg.winner !== null && checkoutDartsUsed !== null;
      const isCurrentRound = this.isCurrentRound(match, legSelection, roundEntry.roundNumber);

      // Add the actual checkout darts for the final round; otherwise count all three darts.
      dartsThrown += isCheckoutRound ? checkoutDartsUsed : 3;

      return {
        roundNumber: roundEntry.roundNumber,
        dartsThrown: dartsThrown,
        turns: roundEntry.round.turns,
        currentThrowerId: isCurrentRound ? match.matchProgress.currentThrower : null
      };
    });
  }

  /**
   * Checks whether the given round is the current round of the selected leg.
   *
   * @param match - Match containing the current match progress.
   * @param legSelection - Currently selected leg.
   * @param roundNumber - Round number to check.
   * @returns Whether the round is currently in play.
   */
  private isCurrentRound(match: X01Match, legSelection: LegSelection, roundNumber: number): boolean {
    return match.matchProgress.currentSet === legSelection.setEntry.setNumber &&
      match.matchProgress.currentLeg === legSelection.legEntry.legNumber &&
      match.matchProgress.currentRound === roundNumber;
  }

  /**
   * Registers score table scrolling for scroll target changes.
   *
   * Uses `afterRenderEffect` so scrolling runs after Angular has rendered the updated table rows.
   * The `mixedReadWrite` phase is used because scrolling requires reading layout dimensions before
   * updating the container scroll position.
   */
  private registerScrollEffect(): void {
    afterRenderEffect({
      mixedReadWrite: () => {
        const scrollTarget = this.scrollTarget();

        if (scrollTarget === null) {
          return;
        }

        // Scroll without tracking the row and element signals used internally.
        untracked(() => this.scrollToRound(scrollTarget.roundNumber));
      }
    });
  }

  /**
   * Creates the scroll target for the selected leg.
   *
   * Always creates a target when the leg in play is selected, or when the last leg
   * is selected after the match has finished. Other selected legs only create a
   * new target when the selected set or leg changes.
   *
   * @param match - Match containing the current match progress.
   * @param legSelection - Currently selected leg.
   * @param previousLegSelection - Previously selected leg, when available.
   * @returns Scroll target for the selected leg, or null when the current scroll position should be preserved.
   */
  private createScrollTarget(
    match: X01Match,
    legSelection: LegSelection,
    previousLegSelection: LegSelection | undefined
  ): MatchScoreTableScrollTarget | null {
    // Create a scroll target for the initial selection, leg in play or last leg of a finished match.
    if (previousLegSelection === undefined || isCurrentOrLastLegSelected(match, legSelection)) {
      return this.createScrollTargetForLeg(match, legSelection);
    }

    // Determine whether the selected set or leg has changed.
    const hasSelectedLegChanged =
      previousLegSelection.setEntry.setNumber !== legSelection.setEntry.setNumber ||
      previousLegSelection.legEntry.legNumber !== legSelection.legEntry.legNumber;

    // When the selected leg has not changed, preserve the current scroll position.
    if (!hasSelectedLegChanged) {
      return null;
    }

    // Otherwise create a scroll target for the newly selected leg.
    return this.createScrollTargetForLeg(match, legSelection);
  }

  /**
   * Creates a scroll target for the selected leg.
   *
   * @param match - Match containing the current match progress.
   * @param legSelection - Selected leg.
   * @returns Scroll target, or null when no round is available.
   */
  private createScrollTargetForLeg(
    match: X01Match,
    legSelection: LegSelection
  ): MatchScoreTableScrollTarget | null {
    const targetRoundNumber = this.getScrollTargetRoundNumber(match, legSelection);

    if (targetRoundNumber === null) {
      return null;
    }

    return {
      setNumber: legSelection.setEntry.setNumber,
      legNumber: legSelection.legEntry.legNumber,
      roundNumber: targetRoundNumber
    };
  }

  /**
   * Gets the round to scroll to for the selected leg.
   *
   * @param match - Match containing the current match progress.
   * @param legSelection - Selected leg.
   * @returns Round number to scroll to, or null when no round is available.
   */
  private getScrollTargetRoundNumber(match: X01Match, legSelection: LegSelection): number | null {
    const shouldScrollToLatestRound = isCurrentOrLastLegSelected(match, legSelection);

    const targetRoundNumber = shouldScrollToLatestRound
      ? match.matchProgress.currentRound ?? legSelection.legEntry.leg.rounds.at(-1)?.roundNumber
      : legSelection.legEntry.leg.rounds.at(0)?.roundNumber;

    return targetRoundNumber ?? null;
  }

  /**
   * Scrolls the reversed table container so the target round is positioned below the sticky header.
   *
   * @param targetRoundNumber - Round number to scroll to.
   */
  private scrollToRound(targetRoundNumber: number): void {
    // Find the rendered row matching the target round.
    const rowIndex = this.rows().findIndex(row => row.roundNumber === targetRoundNumber);

    if (rowIndex === -1) {
      return;
    }

    // Resolve the scroll container, sticky header and target row elements.
    const tableContainer = this.tableContainerElementRef().nativeElement;
    const stickyHeaderRow = this.stickyHeaderRowElementRef().nativeElement;
    const targetRow = this.scoreRowElementRefs()[rowIndex]?.nativeElement;

    if (!targetRow) {
      return;
    }

    // Calculate the scroll position for the reversed container, accounting for the sticky header.
    const targetPosition = targetRow.offsetTop + tableContainer.clientHeight;
    const viewportOffset = stickyHeaderRow.offsetHeight + tableContainer.scrollHeight;
    const scrollTop = targetPosition - viewportOffset;

    // Smoothly position the target round directly below the sticky header.
    tableContainer.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });
  }
}
