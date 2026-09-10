import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, of, tap} from 'rxjs';
import {DARTS_MATCHER_REST_ENDPOINTS} from '../api/rest-endpoints';
import {unwrapApiError} from '../api/http/http-error.operator';
import {X01Checkout, X01CheckoutsMap} from '../model/x01/checkout/x01-checkout';

@Injectable({
  providedIn: 'root'
})
export class CheckoutRepository {
  private readonly http = inject(HttpClient);

  private checkoutsCache: X01CheckoutsMap | null = null;

  /**
   * Gets all checkout suggestions keyed by remaining score.
   *
   * Uses the in-memory cache when available. Otherwise, checkout suggestions
   * are retrieved from the API and cached for subsequent requests.
   *
   * @returns Checkout suggestions keyed by remaining score.
   */
  getCheckouts(): Observable<X01CheckoutsMap> {
    if (this.checkoutsCache) {
      return of(this.checkoutsCache);
    }

    return this.http.get<X01Checkout[]>(DARTS_MATCHER_REST_ENDPOINTS.X01.CHECKOUTS).pipe(
      unwrapApiError(),
      map(checkouts => this.toCheckoutMap(checkouts)),
      tap(checkouts => this.checkoutsCache = checkouts)
    );
  }

  /**
   * Converts checkout suggestions to a map keyed by remaining score.
   *
   * @param checkouts - Checkout suggestions to map.
   * @returns Checkout suggestions keyed by remaining score.
   */
  private toCheckoutMap(checkouts: X01Checkout[]): X01CheckoutsMap {
    return new Map(checkouts.map(checkout => [checkout.checkout, checkout]));
  }
}
