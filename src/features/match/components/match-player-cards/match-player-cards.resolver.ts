import {ResultType} from '../../../../data/model/base-match/result-type';
import {isCheckoutPossible, X01Checkout, X01CheckoutsMap} from '../../../../data/model/x01/checkout/x01-checkout';
import {
  doesPlayerStartLeg,
  getDartsUsedForPlayerInRound,
  getLastTurnForPlayerInLeg,
  X01Leg
} from '../../../../data/model/x01/leg/x01-leg';
import {isLastLegInMatch, X01Match} from '../../../../data/model/x01/match/x01-match';
import {X01MatchPlayer} from '../../../../data/model/x01/match/x01-match-player';
import {X01Turn} from '../../../../data/model/x01/round/x01-turn';
import {isLastLegInSet} from '../../../../data/model/x01/set/x01-set';
import {
  calculateX01Average,
  isFirstNineTurn,
  X01AverageStatistics
} from '../../../../data/model/x01/statistics/x01-average-statistics';
import {isCurrentLegSelected, isLegSelected, LegSelection} from '../match-board/leg-selection';
import {MatchPlayerCardData} from '../match-player-card/match-player-card-data';

/**
 * Player standing up to a specific leg in the match.
 */
interface PlayerStanding {
  setsWon: number;
  legsWon: number;
}

/**
 * Resolves the render data for all player cards at the selected leg.
 *
 * Values are resolved using three scopes:
 *
 * Match:
 * - `playerId`
 * - `name`
 * - `bestOfType`
 *
 * Standings, up to and including the selected leg:
 * - `isWinOrDraw`
 * - `setsWon`
 * - `legsWon`
 *
 * Selected leg:
 * - `isCurrentThrower`
 * - `startsLeg`
 * - `remaining`
 * - `suggestedCheckout`
 * - `average`
 * - `averageFirstNine`
 * - `lastScore`
 * - `dartsUsed`
 *
 * @param match - Match containing the players and match history.
 * @param legSelection - Selected leg used for standings and leg-specific values.
 * @param checkouts - Checkout suggestions keyed by remaining score.
 * @returns Render data for each player card.
 */
export function resolveMatchPlayerCards(
  match: X01Match,
  legSelection: LegSelection,
  checkouts: X01CheckoutsMap
): MatchPlayerCardData[] {
  return match.players.map(player =>
    resolveMatchPlayerCard(match, legSelection, checkouts, player)
  );
}

/**
 * Resolves the render data for a single player card at the selected leg.
 *
 * @param match - Match containing the player and match history.
 * @param legSelection - Selected leg used for standings and leg-specific values.
 * @param checkouts - Checkout suggestions keyed by remaining score.
 * @param player - Player to resolve the card data for.
 * @returns Render data for the player card.
 */
function resolveMatchPlayerCard(
  match: X01Match,
  legSelection: LegSelection,
  checkouts: X01CheckoutsMap,
  player: X01MatchPlayer
): MatchPlayerCardData {
  const leg = legSelection.legEntry.leg;
  const playerId = player.playerId;

  const standing = resolvePlayerStanding(match, legSelection, playerId);
  const lastTurn = getLastTurnForPlayerInLeg(leg, playerId);
  const averageStatistics = resolvePlayerAverageStatisticsForLeg(leg, playerId);
  const remaining = getRemaining(lastTurn, match.matchSettings.x01);

  return {
    // Match.
    playerId: playerId,
    name: player.playerName,
    bestOfType: match.matchSettings.bestOf.bestOfType,

    // Standings, up to and including the selected leg.
    isWinOrDraw: isWinOrDrawAtSelectedLeg(match, legSelection, player),
    setsWon: standing.setsWon,
    legsWon: standing.legsWon,

    // Selected leg.
    isCurrentThrower: isCurrentThrower(match, legSelection, playerId),
    startsLeg: doesPlayerStartLeg(leg, playerId),
    remaining: remaining,
    suggestedCheckout: getSuggestedCheckout(remaining, checkouts),
    average: averageStatistics.average,
    averageFirstNine: averageStatistics.averageFirstNine,
    lastScore: getLastScore(lastTurn),
    dartsUsed: averageStatistics.dartsThrown
  };
}

/**
 * Resolves a player's standing up to and including the selected leg.
 *
 * Leg wins are scoped to the selected set, while set wins are accumulated
 * across all sets up to the selected leg.
 *
 * @param match - Match containing the standings history.
 * @param legSelection - Selected leg used as the inclusive cutoff.
 * @param playerId - ID of the player to resolve the standing for.
 * @returns Player standing at the selected leg.
 */
function resolvePlayerStanding(match: X01Match, legSelection: LegSelection, playerId: string): PlayerStanding {
  const standing: PlayerStanding = {
    setsWon: 0,
    legsWon: 0
  };

  for (const setEntry of match.sets) {
    // Leg wins are scoped to the current set being traversed.
    standing.legsWon = 0;

    for (const legEntry of setEntry.set.legs) {
      // Count completed leg wins up to the selected leg.
      if (legEntry.leg.winner === playerId) {
        standing.legsWon++;
      }

      // Count a set win once its final leg has been reached.
      if (isLastLegInSet(setEntry.set, legEntry.legNumber) && setEntry.set.result?.[playerId] === ResultType.WIN) {
        standing.setsWon++;
      }

      // Stop once the selected leg has been included in the standing.
      if (isLegSelected(legSelection, setEntry.setNumber, legEntry.legNumber)) {
        return standing;
      }
    }
  }

  return standing;
}

/**
 * Checks whether the player should be displayed as a match winner or draw
 * at the selected leg.
 *
 * Match results are only shown when the last leg currently present in the
 * match is selected.
 *
 * @param match - Match containing the result.
 * @param legSelection - Currently selected leg.
 * @param player - Player whose result should be checked.
 * @returns Whether the player has a win or draw result at the selected leg.
 */
function isWinOrDrawAtSelectedLeg(match: X01Match, legSelection: LegSelection, player: X01MatchPlayer): boolean {
  if (!isLastLegInMatch(match, legSelection.setEntry.setNumber, legSelection.legEntry.legNumber)) {
    return false;
  }

  return player.resultType === ResultType.WIN || player.resultType === ResultType.DRAW;
}

/**
 * Resolves a player's average statistics for a leg.
 *
 * @param leg - Leg containing the player's turns.
 * @param playerId - ID of the player to resolve the statistics for.
 * @returns Average statistics for the player in the leg.
 */
function resolvePlayerAverageStatisticsForLeg(leg: X01Leg, playerId: string): X01AverageStatistics {
  let pointsThrown = 0;
  let dartsThrown = 0;
  let pointsThrownFirstNine = 0;
  let dartsThrownFirstNine = 0;
  let playerTurnNumber = 0;

  for (const roundEntry of leg.rounds) {
    const turn = roundEntry.round.turns[playerId];
    if (turn === undefined) continue;

    // Count only rounds in which the player has thrown.
    playerTurnNumber++;

    const dartsUsed = getDartsUsedForPlayerInRound(leg, roundEntry, playerId);

    // Accumulate the player's statistics for the full leg.
    pointsThrown += turn.score;
    dartsThrown += dartsUsed;

    // Accumulate the player's first-nine statistics from their first three turns.
    if (isFirstNineTurn(playerTurnNumber)) {
      pointsThrownFirstNine += turn.score;
      dartsThrownFirstNine += dartsUsed;
    }
  }

  // Calculate the averages from the accumulated leg statistics.
  return {
    pointsThrown: pointsThrown,
    dartsThrown: dartsThrown,
    average: calculateX01Average(pointsThrown, dartsThrown),
    pointsThrownFirstNine: pointsThrownFirstNine,
    dartsThrownFirstNine: dartsThrownFirstNine,
    averageFirstNine: calculateX01Average(pointsThrownFirstNine, dartsThrownFirstNine)
  };
}

/**
 * Checks whether the player is the current thrower in the selected leg.
 *
 * Historical legs never have a current thrower.
 *
 * @param match - Match containing the current match progress.
 * @param legSelection - Currently selected leg.
 * @param playerId - ID of the player to check.
 * @returns Whether the player is currently throwing in the selected leg.
 */
function isCurrentThrower(match: X01Match, legSelection: LegSelection, playerId: string): boolean {
  return isCurrentLegSelected(match, legSelection) && match.matchProgress.currentThrower === playerId;
}

/**
 * Gets the player's remaining score after their last turn in the leg.
 *
 * @param lastTurn - Player's last turn in the leg, when available.
 * @param startingScore - Starting X01 score.
 * @returns Remaining score, or the starting score when the player has not thrown.
 */
function getRemaining(lastTurn: X01Turn | null, startingScore: number): number {
  return lastTurn?.remaining ?? startingScore;
}

/**
 * Gets the checkout suggestion for a remaining score.
 *
 * @param remaining - Player's remaining score.
 * @param checkouts - Checkout suggestions keyed by remaining score.
 * @returns Checkout suggestion, or null when no checkout is available.
 */
function getSuggestedCheckout(remaining: number, checkouts: X01CheckoutsMap): X01Checkout | null {
  if (!isCheckoutPossible(remaining)) {
    return null;
  }

  return checkouts.get(remaining) ?? null;
}

/**
 * Gets the score of a player's last turn in the leg.
 *
 * @param lastTurn - Player's last turn in the leg, when available.
 * @returns Last turn score, or null when the player has not thrown.
 */
function getLastScore(lastTurn: X01Turn | null): number | null {
  return lastTurn?.score ?? null;
}
