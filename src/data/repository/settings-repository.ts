import {AppSettings} from '../model/app-settings';
import {computed, Injectable, signal} from '@angular/core';
import {ThemeMode, themeModeFromId} from '../model/theme-mode';

/**
 * Repository responsible for application settings.
 *
 * Owns the reactive settings state and synchronizes persisted preferences with local storage.
 */
@Injectable({
  providedIn: 'root',
})
export class SettingsRepository {
  private readonly themeModeKey = 'theme-mode';

  private readonly _settings = signal<AppSettings>({themeMode: this.readThemeMode()});

  // The currently persisted theme mode.
  readonly themeMode = computed(() => this._settings().themeMode);

  /**
   * Updates the current theme mode and persists the selection.
   *
   * @param themeMode The theme mode to use.
   */
  setThemeMode(themeMode: ThemeMode): void {
    localStorage.setItem(this.themeModeKey, themeMode.id);

    this._settings.update(settings => ({
      ...settings,
      themeMode: themeMode,
    }));
  }

  /**
   * Toggles between light and dark theme mode.
   */
  toggleThemeMode(): void {
    const next = this.themeMode() === ThemeMode.LIGHT
      ? ThemeMode.DARK
      : ThemeMode.LIGHT;

    this.setThemeMode(next);
  }

  /**
   * Reads the persisted theme mode from local storage, falling back to the default.
   *
   * @returns The persisted theme mode, or the default if none is stored.
   */
  private readThemeMode(): ThemeMode {
    return themeModeFromId(localStorage.getItem(this.themeModeKey),);
  }
}
