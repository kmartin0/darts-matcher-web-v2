import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {LoadState} from '../../../../shared/types/load-state';

export interface HomePageState {
  navigateToMatchId: string | null;
  recentMatches: LoadState<X01Match[]>;
}

export const INITIAL_HOME_STATE: HomePageState = {
  navigateToMatchId: null,
  recentMatches: {status: 'idle'}
};
