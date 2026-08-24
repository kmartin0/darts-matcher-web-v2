import {X01Match} from '../../../../data/model/x01/x01-match';
import {LoadState} from '../../../../shared/types/load-state';

export interface HomePageState {
  navigateToX01MatchId: string | null;
  recentX01Matches: LoadState<X01Match[]>;
}

export const initialHomeState: HomePageState = {
  navigateToX01MatchId: null,
  recentX01Matches: {status: 'idle'}
};
