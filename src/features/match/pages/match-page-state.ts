import {X01Match} from '../../../data/model/x01/x01-match';
import {LoadState} from '../../../shared/types/load-state';

export interface MatchPageState {
  match: LoadState<X01Match>
}

export const initialMatchPageState: MatchPageState = {
  match: {status: 'idle'},
};
