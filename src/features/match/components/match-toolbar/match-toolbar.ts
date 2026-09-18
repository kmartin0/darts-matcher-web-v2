import {Component, input, output, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatToolbar} from '@angular/material/toolbar';
import {MatTooltip} from '@angular/material/tooltip';
import {AppEndpoints} from '../../../../app/app-endpoints';
import {ErrorMessage} from '../../../../shared/components/error-message/error-message';
import {ThemeToggle} from '../../../../shared/components/theme-toggle/theme-toggle';
import {MatchView} from '../../model/match-view';

@Component({
  selector: 'app-match-toolbar',
  templateUrl: './match-toolbar.html',
  styleUrl: './match-toolbar.scss',
  imports: [
    RouterLink,
    MatToolbar,
    ThemeToggle,
    MatIconButton,
    MatMenuTrigger,
    MatTooltip,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatProgressSpinner,
    ErrorMessage
  ]
})
export class MatchToolbar {
  readonly menuEnabled = input.required<boolean>();
  readonly loading = input.required<boolean>();
  readonly error = input<string | null>(null);
  readonly matchView = input.required<MatchView>();

  readonly toggleMatchView = output<void>();
  readonly playerSettings = output<void>();
  readonly copyMatchLink = output<void>();
  readonly copyMatchId = output<void>();
  readonly repairMatch = output<void>();
  readonly resetMatch = output<void>();
  readonly deleteMatch = output<void>();

  protected readonly AppEndpoints = AppEndpoints;
  protected readonly displayedMatchView = signal<MatchView | null>(null);

  /**
   * Captures the current match view when the menu opens.
   *
   * The captured value remains unchanged while the menu closes so its action
   * does not visibly change during the closing animation.
   */
  protected onMenuOpened(): void {
    this.displayedMatchView.set(this.matchView());
  }
}
