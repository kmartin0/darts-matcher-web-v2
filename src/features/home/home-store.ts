import {Injectable, signal} from '@angular/core';
import {HomeState, initialHomeState} from './home-state';

@Injectable()
export class HomeStore {
  private readonly _state = signal<HomeState>(initialHomeState);
  readonly state = this._state.asReadonly();
}
