import {X01MatchTimelineLegTableDataSource} from './x01-match-timeline-leg-table-data-source';
import {X01BestOfType} from '../../../../models/x01-match/x01-best-of-type';

export interface X01MatchTimelineViewModel {
  trackDoubles: boolean;
  bestOfType: X01BestOfType;
  players: Map<string, {
    id: string;
    name: string;
    initials: string;
  }>;
  sets: {
    setNumber: number;
    legs: {
      legNumber: number
      throwsFirstId: string;
      winnerId: string | null;
      winnerCheckout: number | null;
      tableDatasource: X01MatchTimelineLegTableDataSource;
    }[]
  }[];
}
