import {Component, computed, inject, signal, viewChild} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatButton} from '@angular/material/button';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router, RouterLink} from '@angular/router';
import {AppEndpoints} from '../../../../app/app-endpoints';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {PageError} from '../../../../shared/components/page-error/page-error';
import {CommonDialogService} from '../../../../shared/services/common-dialog.service';
import {MatchBoard} from '../../components/match-board/match-board';
import {MatchToolbar} from '../../components/match-toolbar/match-toolbar';
import {MatchScoreTableEditTarget} from '../../components/match-score-table/match-score-table-edit-target';
import {MatchTurnInputService} from '../../services/match-turn-input.service';
import {MatchPageStore} from './match-page-store';
import {MatchDialogService} from '../../services/match-dialog-service';
import {MatchView} from '../../model/match-view';
import {MatchSummary} from '../../components/match-summary/match-summary';
import {observeSignalProperty} from '../../../../shared/utils/signal.util';

@Component({
  selector: 'app-match-page',
  imports: [
    PageError,
    MatchToolbar,
    MatchBoard,
    MatButton,
    RouterLink,
    MatchSummary
  ],
  providers: [MatchPageStore],
  templateUrl: './match-page.html',
  styleUrl: './match-page.scss'
})
export class MatchPage {
  private readonly store = inject(MatchPageStore);
  private readonly commonDialogService = inject(CommonDialogService);
  private readonly matchDialogService = inject(MatchDialogService);
  private readonly matchTurnInputService = inject(MatchTurnInputService);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly matchView = signal<MatchView>('board');

  private readonly matchBoard = viewChild(MatchBoard);

  protected readonly uiState = this.store.state;
  protected readonly AppEndpoints = AppEndpoints;

  private readonly match = computed<X01Match | null>(() => {
    const matchLoadState = this.uiState().match;
    return matchLoadState.status === 'loaded' ? matchLoadState.data : null;
  });

  /**
   * Whether the toolbar should display its loading indicator.
   *
   * The toolbar is considered loading while the match is loading, or while
   * a loaded match is waiting for the WebSocket stream to connect.
   */
  protected readonly toolbarLoading = computed<boolean>(() => {
    const state = this.uiState();

    const isMatchLoading = state.match.status === 'loading';
    const isWaitingForStream = state.match.status === 'loaded' &&
      state.streamConnectionState !== 'connected';

    return isMatchLoading || isWaitingForStream;
  });

  constructor() {
    this.registerRematchPromptObserver();
  }

  /**
   * Toggles the match page between the board and summary views.
   */
  protected onToggleMatchView(): void {
    this.matchView.update(view => {
      switch (view) {
        case 'board':
          return 'summary';

        case 'summary':
          return 'board';
      }
    });
  }

  /**
   * Repairs the current match.
   */
  protected onRepairMatch(): void {
    this.store.repairMatch();
  }

  protected onRequestRematch(): void {
    this.store.createRematch();
  }

  /**
   * Handles resetting the current match after user confirmation.
   *
   * Opens a confirmation dialog and resets the match when the user confirms the action.
   */
  protected async onResetMatch(): Promise<void> {
    const result = await this.commonDialogService.openConfirmDialog('Reset match');

    if (result.status === 'dismissed') {
      return;
    }

    this.store.resetMatch();
  }

  /**
   * Handles deletion of the current match after user confirmation.
   *
   * Opens a confirmation dialog and deletes the match when the user confirms the action.
   */
  protected async onDeleteMatch(): Promise<void> {
    const result = await this.commonDialogService.openConfirmDialog('Delete match');

    if (result.status === 'dismissed') {
      return;
    }

    this.store.deleteMatch();
  }

  /**
   * Deletes the last turn from the current match.
   */
  protected onDeleteLastTurn(): void {
    this.store.deleteLastTurn();
  }

  /**
   * Copies the current match URL to the clipboard.
   */
  protected onCopyMatchLink(): void {
    this.openSnackBar(
      this.clipboard.copy(window.location.href)
        ? 'Link copied'
        : 'Failed to copy link'
    );
  }

  /**
   * Copies the current match ID to the clipboard.
   */
  protected onCopyMatchId(): void {
    const failedMessage = 'Failed to copy match ID';
    const matchId = this.match()?.id;

    if (matchId === undefined) {
      this.openSnackBar(failedMessage);
      return;
    }

    this.openSnackBar(
      this.clipboard.copy(matchId)
        ? 'Match ID copied'
        : failedMessage
    );
  }

  /**
   * Opens the local match settings dialog and forwards confirmed settings to the store.
   */
  protected async onOpenLocalMatchSettings(): Promise<void> {
    const match = this.match();
    const localSettingsState = this.uiState().localMatchSettings;

    if (match === null || localSettingsState.status !== 'loaded') return;
    if (localSettingsState.data.matchId !== match.id) return;

    const dialogResult = await this.matchDialogService.openLocalMatchSettingsDialog({
      localMatchSettings: localSettingsState.data,
      players: match.players
    });

    if (dialogResult.status === 'dismissed') return;

    this.store.saveLocalMatchSettings(dialogResult.value);
  }

  /**
   * Handles editing a turn selected from the match score table.
   *
   * Resolves the required match state before delegating turn input resolution
   * to the match turn input service and dispatching the edit to the store.
   *
   * @param editTarget - Turn selected for editing.
   */
  protected async onEditTurn(editTarget: MatchScoreTableEditTarget): Promise<void> {
    const match = this.match();
    const checkoutsState = this.uiState().checkouts;
    const checkouts = checkoutsState.status === 'loaded' ? checkoutsState.data : null;
    if (match === null || checkouts === null) return;

    const editTurnInput = await this.matchTurnInputService.resolveEditTurnInput(
      editTarget,
      match,
      checkouts
    );
    if (editTurnInput === null) return;

    this.store.editTurn(editTurnInput);
  }

  /**
   * Handles submitting a score from the match score input.
   *
   * Resolves the required match state before delegating turn input resolution
   * to the match turn input service, clearing the score input and dispatching
   * the new turn to the store.
   *
   * @param score - Submitted score.
   */
  protected async onSubmitScore(score: number): Promise<void> {
    const match = this.match();
    const checkoutsState = this.uiState().checkouts;
    const checkouts = checkoutsState.status === 'loaded' ? checkoutsState.data : null;
    if (match === null || checkouts === null) return;

    const createTurnInput = await this.matchTurnInputService.resolveCreateTurnInput(
      score,
      match,
      checkouts
    );

    if (createTurnInput === null) return;

    this.matchBoard()?.clearScoreInput();
    this.store.addTurn(createTurnInput);
  }

  private registerRematchPromptObserver(): void {
    observeSignalProperty(
      () => this.uiState().rematchPrompt,
      rematchPrompt => {
        if (rematchPrompt !== null) {
          void this.handleRematchPrompt(rematchPrompt.rematchId);
        }
      }
    );
  }

  /**
   * Handles a pending rematch prompt.
   *
   * @param rematchId - ID of the rematch to open.
   */
  private async handleRematchPrompt(rematchId: string): Promise<void> {
    this.store.clearRematchPrompt();
    await this.matchDialogService.openRematchCreatedDialog(rematchId);
  }

  /**
   * Displays a temporary snackbar message.
   *
   * @param message - Message to display.
   */
  private openSnackBar(message: string): void {
    this.snackBar.open(message, undefined, {duration: 1250});
  }
}
