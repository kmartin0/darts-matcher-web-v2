import {computed, DestroyRef, inject, Injectable, signal} from '@angular/core';
import {AppSettings, DEFAULT_APP_SETTINGS, resolveAppSettings} from '../model/settings/app-settings';
import {ThemeMode} from '../model/settings/theme-mode';
import {tryParseJson} from '../../shared/utils/json.util';

const APP_SETTINGS_LOCAL_STORAGE_KEY = 'darts-matcher:app-settings';

/**
 * Repository responsible for application settings.
 *
 * Owns the reactive settings state and synchronizes persisted preferences
 * with local storage, including changes made in other tabs.
 */
@Injectable({providedIn: 'root'})
export class SettingsRepository {
  private readonly destroyRef = inject(DestroyRef);

  private readonly _settings = signal<AppSettings>({...DEFAULT_APP_SETTINGS});

  readonly themeMode = computed<ThemeMode>(() => this._settings().themeMode);

  constructor() {
    this.loadSettings();
    this.registerStorageEventListener();
  }

  /**
   * Updates the current theme mode and attempts to persist the settings.
   *
   * The selected theme remains active in the current tab if persistence fails.
   *
   * @param themeMode - Theme mode to use.
   */
  setThemeMode(themeMode: ThemeMode): void {
    this.setSettings({...this._settings(), themeMode: themeMode});
  }

  /**
   * Toggles between light and dark theme mode.
   */
  toggleThemeMode(): void {
    const nextThemeMode = this.themeMode() === ThemeMode.LIGHT
      ? ThemeMode.DARK
      : ThemeMode.LIGHT;

    this.setThemeMode(nextThemeMode);
  }

  /**
   * Registers the listener that synchronizes application settings across tabs.
   */
  private registerStorageEventListener(): void {
    const handleStorageEvent = (event: StorageEvent): void => {
      if (event.key === APP_SETTINGS_LOCAL_STORAGE_KEY || event.key === null) {
        this.loadSettings();
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    this.destroyRef.onDestroy(() => window.removeEventListener('storage', handleStorageEvent));
  }

  /**
   * Loads the persisted application settings into the reactive state.
   *
   * Missing, invalid, or unreadable settings fall back to their defaults.
   * Loading does not write settings back to local storage.
   */
  private loadSettings(): void {
    let settings: AppSettings;

    try {
      const storedSettings = localStorage.getItem(APP_SETTINGS_LOCAL_STORAGE_KEY);

      settings = storedSettings === null
        ? {...DEFAULT_APP_SETTINGS}
        : resolveAppSettings(tryParseJson(storedSettings));
    } catch {
      settings = {...DEFAULT_APP_SETTINGS};
    }

    this._settings.set(settings);
  }

  /**
   * Updates the reactive settings and attempts to persist them.
   *
   * @param settings - Application settings to apply.
   */
  private setSettings(settings: AppSettings): void {
    this._settings.set(settings);

    try {
      localStorage.setItem(APP_SETTINGS_LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Settings remain available for the current session.
    }
  }
}
