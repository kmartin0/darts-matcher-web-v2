import {X01ResultStatistics} from './x01-result-statistics';
import {X01AverageStatistics} from './x01-average-statistics';
import {X01CheckoutStatistics} from './x01-checkout-statistics';
import {X01ScoreStatistics} from './x01-score-statistics';

export interface X01Statistics {
  resultStatistics: X01ResultStatistics;
  averageStats: X01AverageStatistics;
  checkoutStats: X01CheckoutStatistics;
  scoreStatistics: X01ScoreStatistics;
}
