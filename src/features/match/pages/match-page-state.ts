import {X01Match} from '../../../data/model/x01/x01-match';
import {LoadState} from '../../../shared/types/load-state';
import {StreamConnectionState} from '../../../data/repository/stream-event.type';

export interface MatchPageState {
  match: LoadState<X01Match>,
  streamConnectionState: StreamConnectionState,
  matchDeleted: boolean
}

export const initialMatchPageState: MatchPageState = {
  match: {status: 'idle'},
  streamConnectionState: 'disconnected',
  matchDeleted: false
};
