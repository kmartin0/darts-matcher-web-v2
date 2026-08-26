import {Component, input, output} from '@angular/core';
import {MatToolbar} from '@angular/material/toolbar';
import {AppEndpoints} from '../../../../app/app-endpoints';
import {RouterLink} from '@angular/router';
import {ThemeToggle} from '../../../../shared/components/theme-toggle/theme-toggle';
import {MatIconButton} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-match-toolbar',
  templateUrl: './match-toolbar.html',
  styleUrl: './match-toolbar.scss',
  imports: [
    MatToolbar,
    RouterLink,
    ThemeToggle,
    MatIconButton,
    MatMenuTrigger,
    MatTooltip,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatProgressSpinner
  ]
})
export class MatchToolbar {
  readonly copyMatchLink = output<void>();
  readonly copyMatchId = output<void>();
  readonly menuVisible = input.required<boolean>();
  readonly loading = input.required<boolean>();

  protected readonly AppEndpoints = AppEndpoints;
}
