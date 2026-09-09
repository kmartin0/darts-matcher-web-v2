import {computed, Injectable, signal} from '@angular/core';
import {AppSettings} from '../model/settings/app-settings';
import {ThemeMode, themeModeFromId} from '../model/settings/theme-mode';

const THEME_MODE_LOCAL_STORAGE_KEY = 'darts-matcher:theme-mode';

/**
 * Repository responsible for application settings.
 *
 * Owns the reactive settings state and synchronizes persisted preferences with local storage.
 */
@Injectable({
  providedIn: 'root',
})
export class SettingsRepository {
  private readonly _settings = signal<AppSettings>({themeMode: this.readThemeMode()});

  readonly themeMode = computed<ThemeMode>(() => this._settings().themeMode);

  /**
   * Updates the current theme mode and persists the selection.
   *
   * @param themeMode - Theme mode to use.
   */
  setThemeMode(themeMode: ThemeMode): void {
    localStorage.setItem(THEME_MODE_LOCAL_STORAGE_KEY, themeMode.id);

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
   * @returns Persisted theme mode, or the default when none is stored.
   */
  private readThemeMode(): ThemeMode {
    return themeModeFromId(localStorage.getItem(THEME_MODE_LOCAL_STORAGE_KEY));
  }
}
