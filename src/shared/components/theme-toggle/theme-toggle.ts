import {ChangeDetectionStrategy, Component, computed, inject} from '@angular/core';
import {ThemeMode} from '../../../data/model/settings/theme-mode';
import {AppStore} from '../../../app/app-store';
import {LoseFocusAfterClickDirective} from '../../directives/lose-focus-after-click';
import {MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-theme-toggle',
  imports: [LoseFocusAfterClickDirective, MatIconButton, MatIcon, MatTooltip],
  templateUrl: 'theme-toggle.html',
  styleUrl: 'theme-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggle {
  protected readonly appStore = inject(AppStore);

  protected readonly icon = computed(() => {
    switch (this.appStore.themeMode()) {
      case ThemeMode.LIGHT:
        return 'dark_mode';
      case ThemeMode.DARK:
        return 'light_mode';
      default:
        return 'dark_mode';
    }
  });

  toggleThemeMode(): void {
    this.appStore.toggleThemeMode();
  }
}
