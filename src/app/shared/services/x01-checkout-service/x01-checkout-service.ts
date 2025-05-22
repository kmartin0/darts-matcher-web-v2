import {Injectable} from '@angular/core';
import {X01Checkout} from '../../../models/x01-match/x01-checkout';
import {DartsMatcherApiService} from '../../../api/services/darts-matcher-api.service';
import {firstValueFrom} from 'rxjs';

@Injectable({providedIn: 'root'})
export class X01CheckoutService {

  private readonly STORAGE_KEY = 'x01_checkouts';

  constructor(private apiService: DartsMatcherApiService) {
  }

  private getCheckoutsFromLocalStorage(): X01Checkout[] | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as X01Checkout[];
    } catch (e) {
      console.warn('Failed to parse checkouts from localStorage', e);
      localStorage.removeItem(this.STORAGE_KEY); // clean corrupted data
      return null;
    }
  }

  private saveCheckoutsToLocalStorage(checkouts: X01Checkout[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(checkouts));
    } catch (e) {
      console.error('Failed to save checkouts to localStorage', e);
    }
  }

  async getCheckouts(): Promise<X01Checkout[]> {
    // First try to retrieve the checkouts from localstorage
    let checkouts = this.getCheckoutsFromLocalStorage();
    if (checkouts) return checkouts;

    // If the checkouts aren't in local storage get them from the api
    checkouts = await firstValueFrom(this.apiService.getCheckoutSuggestions());
    this.saveCheckoutsToLocalStorage(checkouts); // Save the checkouts result in localstorage
    return checkouts;
  }

  async getCheckout(remaining: number): Promise<X01Checkout | undefined> {
    if (remaining > 170) return undefined;
    const checkouts = await this.getCheckouts();
    return this.getCheckoutInList(checkouts, remaining);
  }

  getCheckoutInList(checkouts: X01Checkout[], remaining: number): X01Checkout | undefined {
    if (remaining > 170) return undefined;
    return checkouts.find(checkout => checkout.checkout === remaining);
  }

}
