import {X01Match} from '../../../data/model/x01/x01-match';
import {LoadState} from '../../../shared/types/load-state';
import {StreamConnectionState} from '../../../data/repository/stream-event.type';
import {X01CheckoutsMap} from '../../../data/model/x01/x01-checkout';

export interface MatchPageState {
  match: MatchLoadState;
  checkouts: LoadState<X01CheckoutsMap>;
  streamConnectionState: StreamConnectionState;
  toolbarError: string | null;
  scoreInputError: string | null;
}

export const initialMatchPageState: MatchPageState = {
  match: {status: 'idle'},
  checkouts: {status: 'idle'},
  streamConnectionState: 'disconnected',
  toolbarError: null,
  scoreInputError: null
};

type MatchLoadState = LoadState<X01Match> | { status: 'deleted' };
