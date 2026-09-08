import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, of, tap} from 'rxjs';
import {DARTS_MATCHER_REST_ENDPOINTS} from '../api/rest-endpoints';
import {unwrapApiError} from '../api/http/http-error.operator';
import {MAXIMUM_CHECKOUT, MINIMUM_CHECKOUT, X01Checkout} from '../model/x01/x01-checkout';
import {tryParseJson} from '../../shared/utils/json.util';

@Injectable({
  providedIn: 'root'
})
export class CheckoutRepository {
  private readonly CHECKOUTS_LOCAL_STORAGE_KEY = 'darts-matcher:checkouts';

  private readonly http = inject(HttpClient);

  private checkoutsCache: Map<number, X01Checkout> | null = null;

  /**
   * Gets all checkout suggestions keyed by remaining score.
   *
   * Uses the in-memory cache first, followed by local storage. When no cached
   * checkout suggestions are available, they are retrieved from the API and cached.
   *
   * @returns Checkout suggestions keyed by remaining score.
   */
  getCheckouts(): Observable<Map<number, X01Checkout>> {
    if (this.checkoutsCache) {
      return of(this.checkoutsCache);
    }

    const storedCheckouts = this.getCheckoutsFromLocalStorage();

    if (storedCheckouts) {
      const checkouts = this.toCheckoutMap(storedCheckouts);
      this.checkoutsCache = checkouts;
      return of(checkouts);
    }

    return this.http.get<X01Checkout[]>(DARTS_MATCHER_REST_ENDPOINTS.X01.CHECKOUTS).pipe(
      unwrapApiError(),
      tap(checkouts => this.saveCheckoutsToLocalStorage(checkouts)),
      map(checkouts => this.toCheckoutMap(checkouts)),
      tap(checkouts => this.checkoutsCache = checkouts)
    );
  }

  /**
   * Gets the checkout suggestion for a remaining score.
   *
   * @param remaining - Remaining score to get the checkout suggestion for.
   * @returns Matching checkout suggestion, or undefined when none exists.
   */
  getCheckout(remaining: number): Observable<X01Checkout | undefined> {
    if (remaining < MINIMUM_CHECKOUT || remaining > MAXIMUM_CHECKOUT) {
      return of(undefined);
    }

    return this.getCheckouts().pipe(
      map(checkouts => checkouts.get(remaining))
    );
  }

  /**
   * Converts checkout suggestions to a map keyed by remaining score.
   *
   * @param checkouts - Checkout suggestions to map.
   * @returns Checkout suggestions keyed by remaining score.
   */
  private toCheckoutMap(checkouts: X01Checkout[]): Map<number, X01Checkout> {
    return new Map(checkouts.map(checkout => [checkout.checkout, checkout]));
  }

  /**
   * Gets checkout suggestions from local storage.
   *
   * @returns Stored checkout suggestions, or null when none are available or the stored value is invalid.
   */
  private getCheckoutsFromLocalStorage(): X01Checkout[] | null {
    const storedCheckouts = localStorage.getItem(this.CHECKOUTS_LOCAL_STORAGE_KEY);

    if (!storedCheckouts) {
      return null;
    }

    const checkouts = tryParseJson(storedCheckouts);

    if (!Array.isArray(checkouts)) {
      localStorage.removeItem(this.CHECKOUTS_LOCAL_STORAGE_KEY);
      return null;
    }

    return checkouts as X01Checkout[];
  }

  /**
   * Saves checkout suggestions to local storage.
   *
   * Failure to cache the checkout suggestions does not affect the retrieved API data.
   *
   * @param checkouts - Checkout suggestions to store.
   */
  private saveCheckoutsToLocalStorage(checkouts: X01Checkout[]): void {
    try {
      localStorage.setItem(this.CHECKOUTS_LOCAL_STORAGE_KEY, JSON.stringify(checkouts));
    } catch {
      // Ignore local storage failures because checkout suggestions remain available in memory.
    }
  }
}
