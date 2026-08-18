import {DOCUMENT, effect, inject, Injectable} from '@angular/core';
import {SettingsRepository} from '../data/repository/settings-repository';
import {ThemeMode} from '../data/model/settings/theme-mode';

/**
 * Application-level store that exposes global UI state and actions.
 */
@Injectable({
  providedIn: 'root',
})
export class AppStore {
  private readonly settingsRepository = inject(SettingsRepository);
  private readonly document = inject(DOCUMENT);

  // The currently selected application theme mode.
  readonly themeMode = this.settingsRepository.themeMode;

  /**
   * Sets up a reactive effect that applies the current theme mode whenever `themeMode` changes.
   */
  constructor() {
    effect(() => {
      this.applyThemeMode(this.themeMode());
    });
  }

  /**
   * Toggles between the available application theme modes.
   */
  toggleThemeMode(): void {
    this.settingsRepository.toggleThemeMode();
  }

  /**
   * Applies the given theme mode to the document body.
   * Removes any previously applied theme-mode class before adding the class associated with the new mode.
   *
   * @param themeMode The theme mode to apply.
   */
  private applyThemeMode(themeMode: ThemeMode): void {
    const bodyClasses = this.document.body.classList;

    bodyClasses.remove(
      ...Object.values(ThemeMode).map(mode => mode.bodyClass)
    );

    bodyClasses.add(themeMode.bodyClass);
  }
}
