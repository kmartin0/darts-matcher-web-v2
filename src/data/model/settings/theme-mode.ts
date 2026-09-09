export const ThemeMode = {
  LIGHT: {id: 'light', bodyClass: 'theme-mode-light',},
  DARK: {id: 'dark', bodyClass: 'theme-mode-dark',},
} as const;

export type ThemeMode = typeof ThemeMode[keyof typeof ThemeMode];

export const DEFAULT_THEME_MODE: ThemeMode = ThemeMode.LIGHT;

/**
 * Resolves a theme mode from its ID.
 *
 * @param id - Theme mode ID to resolve.
 * @returns Matching theme mode, or the default theme mode when the ID is invalid.
 */
export function themeModeFromId(id: string | null): ThemeMode {
  switch (id) {
    case ThemeMode.LIGHT.id:
      return ThemeMode.LIGHT;

    case ThemeMode.DARK.id:
      return ThemeMode.DARK;

    default:
      return DEFAULT_THEME_MODE;
  }
}
