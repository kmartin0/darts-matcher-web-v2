import {inject, Injectable} from '@angular/core';
import {X01Checkout} from '../../../models/x01-match/x01-checkout';
import {DartsMatcherApiService} from '../../../api/services/darts-matcher-api.service';
import {firstValueFrom} from 'rxjs';

@Injectable({providedIn: 'root'})
export class X01CheckoutService {

  private readonly X01_CHECKOUTS_LOCAL_STORAGE_KEY = 'x01_checkouts';
  private apiService = inject(DartsMatcherApiService);

  /**
   * Retrieves all checkout suggestions, preferring localStorage if available.
   * Falls back to API if localStorage is empty or invalid, then caches the result in local storage.
   *
   * @returns A promise resolving to the list of X01 checkouts
   */
  async getCheckouts(): Promise<X01Checkout[]> {
    // First try to retrieve the checkouts from localstorage
    let checkouts = this.getCheckoutsFromLocalStorage();
    if (checkouts) return checkouts;

    // If the checkouts aren't in local storage get them from the api
    checkouts = await firstValueFrom(this.apiService.getCheckoutSuggestions());
    this.saveCheckoutsToLocalStorage(checkouts); // Save the checkouts result in localstorage
    return checkouts;
  }

  /**
   * Retrieves a specific checkout suggestion for the given points.
   *
   * @param points - The points for which a checkout should be look up for.
   * @returns A promise resolving to the matching X01Checkout if available, otherwise undefined
   */
  async getCheckout(points: number): Promise<X01Checkout | undefined> {
    if (points > 170) return undefined;
    const checkouts = await this.getCheckouts();
    return this.getCheckoutInList(checkouts, points);
  }

  /**
   * Searches the given list of checkouts for a match to the specified points.
   *
   * @param checkouts - List of checkout suggestions to search through
   * @param points - The points for which a checkout should be look up for.
   * @returns The matching X01Checkout if found, otherwise undefined
   */
  getCheckoutInList(checkouts: X01Checkout[], points: number): X01Checkout | undefined {
    if (points > 170) return undefined;
    return checkouts.find(checkout => checkout.checkout === points);
  }

  /**
   * Checks if a checkout is possible for a given remaining score.
   * @param remaining The remaining score.
   * @returns True if a checkout is possible, false otherwise.
   */
  isCheckoutPossible(remaining: number): boolean {
    return remaining <= 170 && !(remaining in [169, 168, 166, 165, 163, 162, 159]);
  }

  /**
   * Retrieves checkout suggestions from the local storage. If checkouts aren't stored or corrupted returns null
   *
   * @returns An array of X01Checkouts if they exist in localstorage and parsing succeeds, otherwise null.
   */
  private getCheckoutsFromLocalStorage(): X01Checkout[] | null {
    const localStorageResult = localStorage.getItem(this.X01_CHECKOUTS_LOCAL_STORAGE_KEY);
    if (!localStorageResult) return null;

    try {
      return JSON.parse(localStorageResult) as X01Checkout[];
    } catch (e) {
      console.warn('Failed to parse checkouts from localStorage', e);
      localStorage.removeItem(this.X01_CHECKOUTS_LOCAL_STORAGE_KEY); // clean corrupted data
      return null;
    }
  }

  /**
   * Saves the given checkouts array to localStorage.
   *
   * @param checkouts - Array of X01Checkout objects to store
   */
  private saveCheckoutsToLocalStorage(checkouts: X01Checkout[]) {
    try {
      localStorage.setItem(this.X01_CHECKOUTS_LOCAL_STORAGE_KEY, JSON.stringify(checkouts));
    } catch (e) {
      console.error('Failed to save checkouts to localStorage', e);
    }
  }
}
