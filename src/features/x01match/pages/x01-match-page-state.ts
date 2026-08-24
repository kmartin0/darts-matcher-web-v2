import {X01Match} from '../../../data/model/x01/x01-match';
import {LoadState} from '../../../shared/types/load-state';

export interface X01MatchPageState {
  x01Match: LoadState<X01Match>
}

export const initialX01MatchPageState: X01MatchPageState = {
  x01Match: {status: 'idle'},
};
