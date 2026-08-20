import {X01Match} from '../../../data/model/x01/x01-match';

export interface X01MatchPageState {
  x01MatchStatus: X01MatchLoadStatus;
  x01Match: X01Match | null;
}

export const initialX01MatchPageState: X01MatchPageState = {
  x01MatchStatus: 'loading',
  x01Match: null,
};

export type X01MatchLoadStatus =
  | 'loading'
  | 'loaded'
  | 'notFound';
