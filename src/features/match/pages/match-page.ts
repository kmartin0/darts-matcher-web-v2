import {Component, computed, inject} from '@angular/core';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatchPageStore} from './match-page-store';
import {PageError} from '../../../shared/components/page-error/page-error';
import {MatchToolbar} from '../components/match-toolbar/match-toolbar';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatchBoard} from '../components/match-board/match-board';

@Component({
  selector: 'app-match-page',
  imports: [
    MatProgressSpinner,
    PageError,
    MatchToolbar,
    MatchBoard
  ],
  providers: [MatchPageStore],
  templateUrl: './match-page.html',
  styleUrl: './match-page.scss'
})
export class MatchPage {
  private readonly store = inject(MatchPageStore);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);

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
   * The toolbar is considered loading while the match is loading or
   * while the WebSocket stream is not connected.
   */
  protected readonly toolbarLoading = computed(() => {
    const state = this.uiState();
    return state.match.status === 'loading' || state.streamConnectionState !== 'connected';
  });

  /**
   * Repairs the current match.
   */
  protected onRepairMatch() {
    this.store.repairMatch()
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
   * Displays a temporary snackbar message.
   *
   * @param message - Message to display.
   */
  private openSnackBar(message: string): void {
    this.snackBar.open(message, undefined, {duration: 1250});
  }
}
