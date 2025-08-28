import {inject, Injectable} from '@angular/core';
import {X01Match} from '../../../models/x01-match/x01-match';
import {Observable, of, tap} from 'rxjs';
import {DartsMatcherApiService} from '../../../api/services/darts-matcher-api.service';
import {isValidObjectId} from '../../utils/object-id.utils';

@Injectable({providedIn: 'root'})
export class RecentMatchesService {

  private apiService: DartsMatcherApiService = inject(DartsMatcherApiService);
  private static readonly STORAGE_KEY = 'recent-matches';

  /**
   * Persists a match ID to local storage as a recently visited match.
   * Adds the id to the front, removes potential duplicates and limits to 5 most recent ids.
   *
   * If the id is not a valid object id, it won't be persisted.
   *
   * @param matchId - The match ID to persist.
   */
  persistMatch(matchId: string) {
    if (!isValidObjectId(matchId)) return;

    const matches = this.getRecentMatchIds();
    const filtered = matches.filter(id => id !== matchId);
    filtered.unshift(matchId);
    const limited = filtered.slice(0, 5);
    localStorage.setItem(RecentMatchesService.STORAGE_KEY, JSON.stringify(limited));
  }

  /**
   * Removes the specified match ID from the list of recently visited matches in local storage.
   *
   * @param matchId - The match ID to remove.
   */
  removeMatch(matchId: string) {
    const matches = this.getRecentMatchIds();
    const filtered = matches.filter(id => id !== matchId);
    localStorage.setItem(RecentMatchesService.STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Retrieves the list of recently visited match IDs from local storage.
   *
   * @returns An array of match ID strings. Returns an empty array if none are found or if parsing fails.
   */
  getRecentMatchIds(): string[] {
    const stored = localStorage.getItem(RecentMatchesService.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as string[];
      } catch {
        return [];
      }
    }
    return [];
  }

  /**
   * Retrieves an observable of the most recent `X01Match` objects, based on the IDs stored in local storage.
   * Matches that can no longer be retrieved from the API are automatically removed from storage.
   *
   * @returns An observable of a list of matches (in the same order as stored IDs). If no matches are found, returns an empty array.
   */
  getRecentMatches(): Observable<(X01Match | null)[]> {
    // Get IDs from local storage
    const recentMatchIds = this.getRecentMatchIds();

    // If there are no IDs, return an observable of an empty array.
    if (recentMatchIds.length === 0) return of([]);

    // Return an observable for which gets the matches from the api.
    return this.apiService.getMatches(recentMatchIds).pipe(
      tap(matches => { // Remove matches that weren't found from the local storage.
        if (matches.length !== recentMatchIds.length) {
          const foundMatchIds = new Set(matches.map(match => match.id));
          recentMatchIds.forEach(recentMatchId => {
            if (!foundMatchIds.has(recentMatchId)) this.removeMatch(recentMatchId);
          });
        }
      })
    );
  }
}
