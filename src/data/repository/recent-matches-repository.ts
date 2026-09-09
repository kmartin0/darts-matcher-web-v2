import {Injectable, signal} from '@angular/core';
import {isValidObjectId} from '../api/utils/object-id.util';

const RECENT_MATCHES_LOCAL_STORAGE_KEY = 'darts-matcher:recent-matches';
const MAX_RECENT_MATCHES = 5;

/**
 * Repository responsible for recently visited matches.
 *
 * Owns the reactive recent match ID state and synchronizes it with local storage.
 */
@Injectable({
  providedIn: 'root',
})
export class RecentMatchesRepository {
  private readonly _recentMatchIds = signal<string[]>([]);

  readonly recentMatchIds = this._recentMatchIds.asReadonly();

  constructor() {
    this.loadRecentMatchIds();
    this.registerStorageEventListener();
  }

  /**
   * Adds a match ID as the most recently visited match.
   *
   * Invalid match IDs are ignored. Existing entries are moved to the front
   * and the number of stored matches is limited to the configured maximum.
   *
   * @param matchId - Match ID to add.
   */
  addMatch(matchId: string): void {
    if (!isValidObjectId(matchId)) {
      return;
    }

    const recentMatchIds = this._recentMatchIds().filter(id => id !== matchId);

    recentMatchIds.unshift(matchId);

    this.setRecentMatchIds(recentMatchIds.slice(0, MAX_RECENT_MATCHES));
  }

  /**
   * Deletes a match ID from the recently visited matches.
   *
   * @param matchId - Match ID to delete.
   */
  deleteMatch(matchId: string): void {
    const recentMatchIds = this._recentMatchIds().filter(id => id !== matchId);

    this.setRecentMatchIds(recentMatchIds);
  }

  /**
   * Registers the listener that synchronizes recent matches with local storage changes.
   */
  private registerStorageEventListener(): void {
    window.addEventListener('storage', event => {
      if (event.key === RECENT_MATCHES_LOCAL_STORAGE_KEY || event.key === null) {
        this.loadRecentMatchIds();
      }
    });
  }

  /**
   * Loads recently visited match IDs from local storage.
   *
   * Stored values are cleaned before being applied to the repository state.
   * When cleaning changes the stored value, the cleaned IDs are written back to local storage.
   */
  private loadRecentMatchIds(): void {
    try {
      const storedRecentMatchIds = localStorage.getItem(RECENT_MATCHES_LOCAL_STORAGE_KEY);

      if (storedRecentMatchIds === null) {
        this._recentMatchIds.set([]);
        return;
      }

      const recentMatchIds = this.cleanRecentMatchIds(JSON.parse(storedRecentMatchIds));

      if (storedRecentMatchIds !== JSON.stringify(recentMatchIds)) {
        this.setRecentMatchIds(recentMatchIds);
        return;
      }

      this._recentMatchIds.set(recentMatchIds);
    } catch {
      this.setRecentMatchIds([]);
    }
  }

  /**
   * Cleans recently visited match IDs.
   *
   * Non-array values, invalid match IDs, and duplicate match IDs are deleted,
   * and the number of returned IDs is limited to the configured maximum.
   *
   * @param recentMatchIds - Value containing the recent match IDs to clean.
   * @returns Valid unique recent match IDs limited to the configured maximum.
   */
  private cleanRecentMatchIds(recentMatchIds: unknown): string[] {
    if (!Array.isArray(recentMatchIds)) return [];

    const validMatchIds = recentMatchIds.filter((matchId): matchId is string =>
      typeof matchId === 'string' && isValidObjectId(matchId)
    );

    return [...new Set(validMatchIds)]
      .slice(0, MAX_RECENT_MATCHES);
  }

  /**
   * Updates the recent match IDs and synchronizes them with local storage.
   *
   * @param recentMatchIds - Match IDs to set.
   */
  private setRecentMatchIds(recentMatchIds: string[]): void {
    this._recentMatchIds.set(recentMatchIds);

    try {
      localStorage.setItem(RECENT_MATCHES_LOCAL_STORAGE_KEY, JSON.stringify(recentMatchIds));
    } catch {
      // Recent matches remain available for the current session.
    }
  }
}
