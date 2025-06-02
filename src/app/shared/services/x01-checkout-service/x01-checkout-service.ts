import {Injectable} from '@angular/core';
import {X01Checkout} from '../../../models/x01-match/x01-checkout';
import {DartsMatcherApiService} from '../../../api/services/darts-matcher-api.service';
import {firstValueFrom} from 'rxjs';

@Injectable({providedIn: 'root'})
export class X01CheckoutService {

  private readonly X01_CHECKOUTS_LOCAL_STORAGE_KEY = 'x01_checkouts';

  constructor(private apiService: DartsMatcherApiService) {
  }

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
   * Retrieves a specific checkout suggestion for the given remaining score.
   *
   * @param remaining - Score remaining
   * @returns A promise resolving to the matching X01Checkout if available, otherwise undefined
   */
  async getCheckout(remaining: number): Promise<X01Checkout | undefined> {
    if (remaining > 170) return undefined;
    const checkouts = await this.getCheckouts();
    return this.getCheckoutInList(checkouts, remaining);
  }

  /**
   * Searches the given list of checkouts for a match to the specified remaining score.
   *
   * @param checkouts - List of checkout suggestions to search through
   * @param remaining - Score remaining
   * @returns The matching X01Checkout if found, otherwise undefined
   */
  getCheckoutInList(checkouts: X01Checkout[], remaining: number): X01Checkout | undefined {
    if (remaining > 170) return undefined;
    return checkouts.find(checkout => checkout.checkout === remaining);
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
