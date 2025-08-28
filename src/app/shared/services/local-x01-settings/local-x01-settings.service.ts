import {Injectable} from '@angular/core';
import {LocalX01SettingsRecord} from './local-x01-settings-record';
import {Dexie, liveQuery, PromiseExtended, Table} from 'dexie';

@Injectable({providedIn: 'root'})
export class LocalX01SettingsService extends Dexie {
  private static readonly DB_NAME = 'local-match-settings-db';
  x01Table!: Table<LocalX01SettingsRecord, string>;

  /**
   * Initializes the LocalX01SettingsService Dexie database and sets `x01Table` use the `x01` table.
   */
  constructor() {
    super(LocalX01SettingsService.DB_NAME);

    this.version(1).stores({
      x01: 'matchId'
    });

    this.x01Table = this.table('x01');
  }

  /**
   * Retrieves the local X01 settings for a given match.
   *
   * @param matchId - The ID of the match to get the settings for.
   * @returns A promise that resolves to the settings record, or undefined if none exist.
   */
  getX01Settings(matchId: string): PromiseExtended<LocalX01SettingsRecord | undefined> {
    return this.x01Table.get(matchId);
  }

  /**
   * Returns a live query observable for the X01 settings of a match.
   * Emits new values whenever the settings change in IndexedDB.
   *
   * @param matchId - The match ID to observe.
   * @returns An Observable emitting the current settings record (or undefined if none).
   */
  getX01SettingsLiveQuery(matchId: string) {
    return liveQuery(() => this.x01Table.get(matchId));
  }

  /**
   * Saves or updates the local X01 settings for a match.
   * If the settings are considered default, deletes any existing record instead.
   *
   * @param localX01SettingsRecord - The settings record to save.
   * @returns A promise resolving to the primary key of the saved record, or void if deleted.
   */
  saveX01Settings(localX01SettingsRecord: LocalX01SettingsRecord): PromiseExtended<string | void> {
    if (this.areLocalSettingsDefault(localX01SettingsRecord)) {
      return this.deleteX01Settings(localX01SettingsRecord.matchId);
    }

    return this.x01Table.put(localX01SettingsRecord);
  }

  /**
   * Deletes the local X01 settings for a given match.
   *
   * @param matchId - The ID of the match whose settings should be deleted.
   * @returns A promise that resolves once the deletion is complete.
   */
  deleteX01Settings(matchId: string): PromiseExtended<void> {
    return this.x01Table.delete(matchId);
  }

  /**
   * Creates a default X01 settings record for a given match. The default rules are:
   * - `scoreFor` is undefined (enabled for all players).
   *
   * @param matchId - The ID of the match to create default settings for.
   * @returns A new default settings record.
   */
  createDefaultX01Record(matchId: string): LocalX01SettingsRecord {
    return {
      matchId: matchId,
      scoreFor: undefined
    };
  }

  /**
   * Checks whether a given settings record is considered default. The default rules:
   * - `scoreFor` is undefined (enabled for all players).
   *
   * @param localX01SettingsRecord - The settings record to check.
   * @returns True if the settings are default, false otherwise.
   */
  private areLocalSettingsDefault(localX01SettingsRecord: LocalX01SettingsRecord) {
    return localX01SettingsRecord.scoreFor == null;
  }
}
