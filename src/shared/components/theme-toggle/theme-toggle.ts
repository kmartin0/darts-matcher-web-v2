import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {AppStore} from '../../../app/app-store';
import {ThemeMode} from '../../../data/model/settings/theme-mode';
import {LoseFocusAfterClickDirective} from '../../directives/lose-focus-after-click';

@Component({
  selector: 'app-theme-toggle',
  imports: [LoseFocusAfterClickDirective, MatIconButton, MatIcon, MatTooltip],
  templateUrl: 'theme-toggle.html',
  styleUrl: 'theme-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggle {
  private readonly appStore = inject(AppStore);

  protected readonly icon = computed<string>(() =>
    this.getThemeModeIcon(this.appStore.themeMode())
  );

  /**
   * Toggles between the available application theme modes.
   */
  protected toggleThemeMode(): void {
    this.appStore.toggleThemeMode();
  }

  /**
   * Gets the icon for switching from the given theme mode.
   *
   * @param themeMode - Current application theme mode.
   * @returns Icon representing the alternative theme mode.
   */
  private getThemeModeIcon(themeMode: ThemeMode): string {
    switch (themeMode) {
      case ThemeMode.LIGHT:
        return 'dark_mode';

      case ThemeMode.DARK:
        return 'light_mode';
    }
  }
}
