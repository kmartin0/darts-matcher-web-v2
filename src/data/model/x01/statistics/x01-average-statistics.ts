/**
 * X01 average statistics for a player.
 */
export interface X01AverageStatistics {
  pointsThrown: number;
  dartsThrown: number;
  average: number | null;
  pointsThrownFirstNine: number;
  dartsThrownFirstNine: number;
  averageFirstNine: number | null;
}

/**
 * Calculates a three-dart X01 average rounded to the nearest whole number.
 *
 * @param pointsThrown - Number of points scored.
 * @param dartsThrown - Number of darts thrown.
 * @returns Rounded three-dart average, or null when no darts have been thrown.
 */
export function calculateX01Average(pointsThrown: number, dartsThrown: number): number | null {
  if (dartsThrown === 0) {
    return null;
  }

  return Math.round((pointsThrown / dartsThrown) * 3);
}

/**
 * Checks whether a round belongs to the first nine darts of a leg.
 *
 * @param roundNumber - One-based round number within the leg.
 * @returns Whether the round belongs to the first nine darts.
 */
export function isFirstNineRound(roundNumber: number): boolean {
  return roundNumber <= 3;
}
