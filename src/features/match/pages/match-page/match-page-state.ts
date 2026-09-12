import {StreamConnectionState} from '../../../../data/api/ws/stream-event-type';
import {X01CheckoutsMap} from '../../../../data/model/x01/checkout/x01-checkout';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {LoadState} from '../../../../shared/types/load-state';

type MatchLoadState = LoadState<X01Match> | { status: 'deleted' };

export interface MatchPageState {
  match: MatchLoadState;
  checkouts: LoadState<X01CheckoutsMap>;
  streamConnectionState: StreamConnectionState;
  toolbarError: string | null;
  scoreInputError: string | null;
}

export const INITIAL_MATCH_PAGE_STATE: MatchPageState = {
  match: {status: 'idle'},
  checkouts: {status: 'idle'},
  streamConnectionState: 'disconnected',
  toolbarError: null,
  scoreInputError: null
};
