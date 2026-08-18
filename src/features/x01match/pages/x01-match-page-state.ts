import {X01Match} from '../../../data/model/x01/x01-match';

export interface X01MatchPageState {
  isLoadingX01Match: boolean;
  x01Match: X01Match | null;
}

export const initialX01MatchPageState: X01MatchPageState = {
  isLoadingX01Match: false,
  x01Match: null
};
