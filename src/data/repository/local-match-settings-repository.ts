import {Injectable} from '@angular/core';
import {Dexie, liveQuery, Table} from 'dexie';
import {defer, from, Observable, switchMap} from 'rxjs';
import {MatchPlayer} from '../model/base-match/match-player';
import {
  createDefaultLocalMatchSettings,
  isLocalMatchSettings,
  isSameLocalSettings,
  LocalMatchSettings
} from '../model/settings/local-match-settings';

const LOCAL_MATCH_SETTINGS_DB_NAME = 'darts-matcher-local-match-settings';

/**
 * Repository responsible for local match settings.
 *
 * Persists settings in IndexedDB and observes updates through Dexie live queries,
 * including changes made through Dexie in other tabs on the same origin.
 */
@Injectable({providedIn: 'root'})
export class LocalMatchSettingsRepository {
  private readonly database = new Dexie(LOCAL_MATCH_SETTINGS_DB_NAME);
  private readonly matchSettingsTable: Table<LocalMatchSettings, string>;

  constructor() {
    this.database.version(1).stores({
      matchSettings: 'matchId'
    });

    this.matchSettingsTable = this.database.table('matchSettings');
  }

  /**
   * Observes the local settings for a match.
   *
   * On subscription, missing or invalid settings are replaced with persisted defaults
   * selecting all supplied players. Valid selections, including none, are preserved.
   * Later changes are read without repeating validation. If the record is deleted,
   * observers receive defaults without persisting them.
   *
   * @param matchId - Match ID whose settings should be observed.
   * @param players - Match players used to validate settings and create defaults.
   * @returns Observable emitting settings after initialization and on later changes.
   */
  observeMatchSettings(matchId: string, players: readonly MatchPlayer[]): Observable<LocalMatchSettings> {
    // Validate and initialize persisted settings before starting the read-only live query.
    return defer(() => this.getOrCreateMatchSettings(matchId, players)).pipe(
      switchMap(() => from(liveQuery(async () => {
        const settings = await this.matchSettingsTable.get(matchId);

        return settings ?? createDefaultLocalMatchSettings(matchId, players);
      })))
    );
  }

  /**
   * Saves or replaces the local settings for a match when they have changed.
   *
   * Reads, compares and writes within one transaction so another tab cannot
   * change the stored record between the comparison and the write.
   * All selections are supported, including all players or no players.
   *
   * @param settings - Settings to save, including their match ID.
   * @returns Promise resolving to the match ID, whether saved or unchanged.
   */
  saveMatchSettings(settings: LocalMatchSettings): Promise<string> {
    return this.database.transaction('rw', this.matchSettingsTable, async () => {
      const storedSettings = await this.matchSettingsTable.get(settings.matchId);

      // Skip writing when the persisted settings already match.
      if (isLocalMatchSettings(storedSettings) && isSameLocalSettings(storedSettings, settings)) {
        return settings.matchId;
      }

      // Create missing settings or replace different or invalid settings.
      return this.matchSettingsTable.put(settings);
    });
  }

  /**
   * Restores and persists the defaults for a match.
   *
   * @param matchId - Match ID whose settings should be reset.
   * @param players - Match players to select in the defaults.
   * @returns Promise resolving to the saved match ID.
   */
  resetMatchSettings(matchId: string, players: readonly MatchPlayer[]): Promise<string> {
    const defaultSettings = createDefaultLocalMatchSettings(matchId, players);

    return this.saveMatchSettings(defaultSettings);
  }

  /**
   * Deletes a match's persisted local settings.
   *
   * Existing observers receive defaults. A new subscription creates the defaults
   * again if the record is still missing.
   *
   * @param matchId - Match ID whose settings should be deleted.
   * @returns Promise resolving when deletion completes.
   */
  deleteMatchSettings(matchId: string): Promise<void> {
    return this.matchSettingsTable.delete(matchId);
  }

  /**
   * Gets persisted settings, creating defaults when settings are missing or invalid.
   *
   * Reading and writing within one transaction prevents concurrent initialization
   * in different tabs from overwriting a valid saved selection.
   *
   * @param matchId - Match ID whose settings should be resolved.
   * @param players - Match players used to validate settings and create defaults.
   * @returns Promise resolving to the existing or newly persisted settings.
   */
  private getOrCreateMatchSettings(matchId: string, players: readonly MatchPlayer[]): Promise<LocalMatchSettings> {
    return this.database.transaction('rw', this.matchSettingsTable, async () => {
      const storedSettings = await this.matchSettingsTable.get(matchId);

      if (this.isValidLocalMatchSettings(storedSettings, matchId, players)) {
        return storedSettings;
      }

      const defaultSettings = createDefaultLocalMatchSettings(matchId, players);

      // Create missing settings or replace an invalid stored record.
      await this.matchSettingsTable.put(defaultSettings);

      return defaultSettings;
    });
  }

  /**
   * Checks whether stored settings are valid for the supplied match.
   *
   * @param settings - Stored value to validate.
   * @param matchId - Match ID the settings must belong to.
   * @param players - Players belonging to the match.
   * @returns Whether settings have the expected structure, match ID, and unique match player IDs.
   */
  private isValidLocalMatchSettings(settings: unknown, matchId: string, players: readonly MatchPlayer[]): settings is LocalMatchSettings {
    if (!isLocalMatchSettings(settings) || settings.matchId !== matchId) {
      return false;
    }

    const matchPlayerIds = new Set(players.map(player => player.playerId));
    const selectedPlayerIds = settings.scoreForPlayerIds;

    // Reject duplicate selected player IDs.
    if (new Set(selectedPlayerIds).size !== selectedPlayerIds.length) {
      return false;
    }

    // Every selected player must belong to the match.
    return selectedPlayerIds.every(playerId => matchPlayerIds.has(playerId));
  }
}
