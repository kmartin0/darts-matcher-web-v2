import {X01Match} from '../../../data/model/x01/x01-match';
import {LoadState} from '../../../shared/types/load-state';
import {StreamConnectionState} from '../../../data/repository/stream-event.type';

export interface MatchPageState {
  match: MatchLoadState;
  streamConnectionState: StreamConnectionState;
  toolbarError: string | null;
  scoreInputError: string | null;
}

export const initialMatchPageState: MatchPageState = {
  match: {status: 'idle'},
  streamConnectionState: 'disconnected',
  toolbarError: null,
  scoreInputError: null
};

type MatchLoadState = LoadState<X01Match> | { status: 'deleted' };
