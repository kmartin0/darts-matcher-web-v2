import {Component, computed, inject, linkedSignal} from '@angular/core';
import {MatchPageStore} from './match-page-store';
import {PageError} from '../../../shared/components/page-error/page-error';
import {MatchToolbar} from '../components/match-toolbar/match-toolbar';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatchBoard} from '../components/match-board/match-board';
import {CommonDialogService} from '../../../shared/services/common-dialog.service';
import {MatButton} from '@angular/material/button';
import {Router} from '@angular/router';
import {AppEndpoints} from '../../../app/app-endpoints';

@Component({
  selector: 'app-match-page',
  imports: [
    PageError,
    MatchToolbar,
    MatchBoard,
    MatButton
  ],
  providers: [MatchPageStore],
  templateUrl: './match-page.html',
  styleUrl: './match-page.scss'
})
export class MatchPage {
  private readonly store = inject(MatchPageStore);
  private readonly commonDialogService = inject(CommonDialogService);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  /**
   * Current match page state.
   */
  protected readonly uiState = this.store.state;

  /**
   * Currently loaded match, or null when no match is loaded.
   */
  protected readonly match = computed(() => {
    const matchLoadState = this.uiState().match;
    return matchLoadState.status === 'loaded' ? matchLoadState.data : null;
  });

  /**
   * Whether the toolbar should display its loading indicator.
   *
   * The toolbar is considered loading while the match is loading, or while
   * a loaded match is waiting for the WebSocket stream to connect.
   */
  protected readonly toolbarLoading = computed(() => {
    const state = this.uiState();

    const isMatchLoading = state.match.status === 'loading';
    const isWaitingForStream = state.match.status === 'loaded' && state.streamConnectionState !== 'connected';

    return isMatchLoading || isWaitingForStream;
  });

  /**
   * Repairs the current match.
   */
  protected onRepairMatch(): void {
    this.store.repairMatch();
  }

  /**
   * Handles resetting the current match after user confirmation.
   *
   * Opens a confirmation dialog and resets the match when the user confirms the action.
   */
  protected onResetMatch(): void {
    const dialogRef = this.commonDialogService.openConfirmDialog('Reset Match');

    dialogRef?.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.resetMatch();
      }
    });
  }

  /**
   * Handles deletion of the current match after user confirmation.
   *
   * Opens a confirmation dialog and deletes the match when the user confirms the action.
   */
  protected onDeleteMatch(): void {
    const dialogRef = this.commonDialogService.openConfirmDialog('Delete Match');

    dialogRef?.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.deleteMatch();
      }
    });
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
   * Navigates from the match page to the home page.
   */
  protected onNavigateHome(): void {
    void this.router.navigateByUrl(AppEndpoints.home());
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
