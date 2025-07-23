import {BehaviorSubject, Observable} from 'rxjs';
import {Meta} from '@angular/platform-browser';
import {Injectable, NgZone} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeModeService {

  // Initialize a BehaviourSubject that holds the current app theme
  private _themeMode$ = new BehaviorSubject<APP_THEME_MODE>(this.getThemeModeFromLocalStorage())

  constructor(private meta: Meta, private ngZone: NgZone) {
    this.initThemeModeSubject()
  }

  get themeMode$(): Observable<APP_THEME_MODE> {
    return this._themeMode$.asObservable();
  }

  get themeMode(): APP_THEME_MODE {
    return this._themeMode$.getValue();
  }

  /**
   * Toggles the current theme mode between light and dark.
   */
  toggleThemeMode() {
    // Get the current theme from the BehaviorSubject
    const currentTheme = this._themeMode$.getValue();

    // Set the new theme mode
    this.setThemeMode(
      currentTheme === APP_THEME_MODE.LIGHT ? APP_THEME_MODE.DARK : APP_THEME_MODE.LIGHT
    );
  }

  /**
   * Public setter which will trigger a theme mode change.
   * @param themeMode The theme to set
   */
  setThemeMode(themeMode: APP_THEME_MODE) {
    this._themeMode$.next(themeMode);
  }

  /**
   * Initializes a subscriber to _themeMode$ BehaviourSubject which will apply the new theme mode class to the body
   * and persists it in the local storage.
   * @private
   */
  private initThemeModeSubject() {
    this._themeMode$.subscribe(themeMode => {

      // Get the <body> element to modify its class list.
      const bodyClasses = document.body.classList;

      // Remove all the old themeMode classes.
      bodyClasses.remove(...Object.values(APP_THEME_MODE));

      // Add the new themeMode class to the <body> element.
      bodyClasses.add(themeMode);

      // Persist the new themeMode in localStorage.
      this.persistThemeMode(themeMode);

      // Update meta tag theme-color with the new primary color. Run in ngZone to ensure changes have been detected.
      this.ngZone.run(() => {
        // const primaryColor = getPrimaryColor(themeMode) // TODO
        // this.meta.updateTag({name: 'theme-color', content: primaryColor});
      })
    })
  }

  /**
   * Persist the current themeMode mode in the local storage.
   * @param themeMode The themeMode mode to persist.
   * @private
   */
  private persistThemeMode(themeMode: APP_THEME_MODE) {
    localStorage.setItem(STORAGE_THEME_MODE_KEY, themeMode);
  }

  /**
   * Retrieve the current theme mode from the local storage. If no theme is stored it defaults to LIGHT.
   * @private
   */
  private getThemeModeFromLocalStorage(): APP_THEME_MODE {
    const savedTheme = localStorage.getItem(STORAGE_THEME_MODE_KEY)

    return this.isValidThemeMode(savedTheme) ? savedTheme as APP_THEME_MODE : APP_THEME_MODE.LIGHT
  }

  /**
   * Validates if a string is a valid themeMode mode by comparing it to the APP_THEME_MODE enum.
   * @param themeMode The themeMode string to check
   * @private
   */
  private isValidThemeMode(themeMode: string | null): boolean {
    return Object.values(APP_THEME_MODE).includes(themeMode as APP_THEME_MODE);
  }

}

export const STORAGE_THEME_MODE_KEY = 'app-theme-mode';

export enum APP_THEME_MODE {LIGHT = 'theme-mode-light', DARK = 'theme-mode-dark'}
