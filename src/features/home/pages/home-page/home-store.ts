import {Injectable, signal} from '@angular/core';
import {HomeState, initialHomeState} from './home-state';
import {CreateX01MatchFormModel} from '../../components/create-x01-match-form/create-x01-match-form.model';

@Injectable()
export class HomeStore {
  private readonly _state = signal<HomeState>(initialHomeState);
  readonly state = this._state.asReadonly();

  /**
   * Simulates creating an X01 match by waiting for a short delay and then
   * updating the store with a mock created match ID.
   *
   * @param x01MatchForm - X01 match form model used to create the match.
   */
  async createX01Match(x01MatchForm: CreateX01MatchFormModel): Promise<void> {
    this.patchState({isCreatingX01Match: true});

    await new Promise(resolve => setTimeout(resolve, 2000));

    this.patchState({
      isCreatingX01Match: false,
      createdX01MatchId: 'mock-match-id'
    });
  }

  /**
   * Clears the created X01 match ID after it has been handled.
   */
  onCreatedX01MatchHandled(): void {
    this.patchState({createdX01MatchId: null});
  }

  /**
   * Updates the current home state with the provided values.
   *
   * @param patch - Partial state containing the values to update.
   */
  private patchState(patch: Partial<HomeState>): void {
    this._state.update(state => ({
      ...state,
      ...patch,
    }));
  }
}
