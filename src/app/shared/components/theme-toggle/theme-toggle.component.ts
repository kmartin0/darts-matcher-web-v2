import {Component, inject} from '@angular/core';
import {BaseComponent} from '../base/base.component';
import {APP_THEME_MODE, ThemeModeService} from '../../services/theme-mode-service/theme-mode.service';
import {
  LoseFocusAfterClickDirective
} from '../../directives/lose-focus-after-click-directive/lose-focus-after-click.directive';
import {MatIconButton} from '@angular/material/button';
import {AsyncPipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-theme-toggle',
  imports: [
    LoseFocusAfterClickDirective,
    MatIconButton,
    MatTooltip,
    MatIcon,
    AsyncPipe
  ],
  standalone: true,
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss'
})
export class ThemeToggleComponent extends BaseComponent {
  private themeModeService = inject(ThemeModeService);
  appThemeMode$ = this.themeModeService.themeMode$;


  toggleThemeMode() {
    this.themeModeService.toggleThemeMode();
  }

  getIconForThemeMode(theme: APP_THEME_MODE | null): string {
    switch (theme) {
      case APP_THEME_MODE.LIGHT:
        return 'dark_mode';
      case APP_THEME_MODE.DARK:
        return 'light_mode';
      default:
        return '';
    }
  }

}
