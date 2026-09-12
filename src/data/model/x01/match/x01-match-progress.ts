export interface X01MatchProgress {
  currentSet: number | null;
  currentLeg: number | null;
  currentRound: number | null;
  currentThrower: string | null;
}

export interface X01MatchProgressInPlay extends X01MatchProgress {
  currentSet: number;
  currentLeg: number;
  currentRound: number;
  currentThrower: string;
}

/**
 * Checks whether the match progress represents a match currently in play.
 *
 * @param matchProgress - Match progress to check.
 * @returns Whether the match is in play and all current progress values are available.
 */
export function isMatchProgressInPlay(matchProgress: X01MatchProgress): matchProgress is X01MatchProgressInPlay {
  return (
    matchProgress.currentSet !== null &&
    matchProgress.currentLeg !== null &&
    matchProgress.currentRound !== null &&
    matchProgress.currentThrower !== null
  );
}
