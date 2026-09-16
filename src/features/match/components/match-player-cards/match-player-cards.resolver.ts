import {isWinOrDrawResult} from '../../../../data/model/base-match/result-type';
import {isCheckoutPossible, X01Checkout, X01CheckoutsMap} from '../../../../data/model/x01/checkout/x01-checkout';
import {
  doesPlayerStartLeg,
  getDartsUsedForPlayerInRound,
  X01Leg
} from '../../../../data/model/x01/leg/x01-leg';
import {isLastLegInMatch, X01Match} from '../../../../data/model/x01/match/x01-match';
import {X01MatchPlayer} from '../../../../data/model/x01/match/x01-match-player';
import {X01BestOfType} from '../../../../data/model/x01/rules/x01-best-of-type';
import {isLastLegInSet, X01Set} from '../../../../data/model/x01/set/x01-set';
import {
  calculateX01Average,
  isFirstNineRound
} from '../../../../data/model/x01/statistics/x01-average-statistics';
import {isCurrentLegSelected, isLegSelected, LegSelection} from '../match-board/leg-selection';
import {MatchPlayerCardData} from '../match-player-card/match-player-card-data';

/**
 * Player identity and match settings that do not depend on the selected leg.
 */
interface PlayerMatchValues {
  playerId: string;
  name: string;
  bestOfType: X01BestOfType;
}

/**
 * Player values through the selected leg, including raw totals for averages.
 *
 * Leg wins are scoped to the selected set. Match results are only shown at
 * the last leg currently present in the match.
 */
interface PlayerCumulativeValues {
  isWinOrDraw: boolean;
  setsWon: number;
  legsWon: number;
  pointsThrown: number;
  dartsThrown: number;
  pointsThrownFirstNine: number;
  dartsThrownFirstNine: number;
}

/**
 * Player values scoped to the selected leg.
 */
interface PlayerLegValues {
  isCurrentThrower: boolean;
  startsLeg: boolean;
  remaining: number;
  suggestedCheckout: X01Checkout | null;
  lastScore: number | null;
  dartsUsed: number;
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
 * Cumulative, up to and including the selected leg:
 * - `isWinOrDraw`
 * - `setsWon`
 * - `legsWon`
 * - `average`
 * - `averageFirstNine`
 *
 * Selected leg:
 * - `isCurrentThrower`
 * - `startsLeg`
 * - `remaining`
 * - `suggestedCheckout`
 * - `lastScore`
 * - `dartsUsed`
 *
 * Leg wins are limited to the selected set. Averages include all legs through
 * the selected leg, with first-nine counting restarted for each leg.
 *
 * @param match - Match containing the players and match history.
 * @param legSelection - Selected leg used for cumulative and leg-specific values.
 * @param checkouts - Checkout suggestions keyed by remaining score.
 * @returns Render data for each player card in match player order.
 */
export function resolveMatchPlayerCards(
  match: X01Match,
  legSelection: LegSelection,
  checkouts: X01CheckoutsMap
): MatchPlayerCardData[] {
  const playerMatchValuesMap = resolvePlayerMatchValues(match);
  const playerCumulativeValuesMap = resolvePlayerCumulativeValues(match, legSelection);
  const playerLegValuesMap = resolvePlayerLegValues(match, legSelection, checkouts);

  // Each resolver initializes an entry for every match player.
  return match.players.map(player => {
    const playerId = player.playerId;

    const matchValues = playerMatchValuesMap.get(playerId);
    const cumulativeValues = playerCumulativeValuesMap.get(playerId);
    const legValues = playerLegValuesMap.get(playerId);

    if (matchValues === undefined || cumulativeValues === undefined || legValues === undefined) {
      throw new Error(`Missing resolved player values for player '${playerId}'.`);
    }

    return mapToMatchPlayerCardData(matchValues, cumulativeValues, legValues);
  });
}

/**
 * Maps a player's resolved values to card data.
 *
 * Both averages are calculated from cumulative raw totals. Darts used remains
 * scoped to the selected leg.
 *
 * @param matchValues - Player identity and match settings.
 * @param cumulativeValues - Player values through the selected leg.
 * @param legValues - Player values within the selected leg.
 * @returns Render data for the player card.
 */
function mapToMatchPlayerCardData(
  matchValues: Readonly<PlayerMatchValues>,
  cumulativeValues: Readonly<PlayerCumulativeValues>,
  legValues: Readonly<PlayerLegValues>
): MatchPlayerCardData {
  return {
    // Match.
    playerId: matchValues.playerId,
    name: matchValues.name,
    bestOfType: matchValues.bestOfType,

    // Cumulative, up to and including the selected leg.
    isWinOrDraw: cumulativeValues.isWinOrDraw,
    setsWon: cumulativeValues.setsWon,
    legsWon: cumulativeValues.legsWon,
    average: calculateX01Average(cumulativeValues.pointsThrown, cumulativeValues.dartsThrown),
    averageFirstNine: calculateX01Average(cumulativeValues.pointsThrownFirstNine, cumulativeValues.dartsThrownFirstNine),

    // Selected leg.
    isCurrentThrower: legValues.isCurrentThrower,
    startsLeg: legValues.startsLeg,
    remaining: legValues.remaining,
    suggestedCheckout: legValues.suggestedCheckout,
    lastScore: legValues.lastScore,
    dartsUsed: legValues.dartsUsed
  };
}

/**
 * Resolves player identity and match settings for every player.
 *
 * @param match - Match containing the players and settings.
 * @returns Match-scoped player values keyed by player ID.
 */
function resolvePlayerMatchValues(match: X01Match): ReadonlyMap<string, PlayerMatchValues> {
  return new Map(
    match.players.map(player => [
      player.playerId,
      {
        playerId: player.playerId,
        name: player.playerName,
        bestOfType: match.matchSettings.bestOf.bestOfType
      }
    ])
  );
}

/**
 * Resolves cumulative values for all players through the selected leg, inclusive.
 *
 * Leg wins are scoped to the selected set. Set wins and scoring totals are
 * accumulated across all included sets and legs. Match result visibility is
 * applied when traversal reaches the last currently present match leg.
 *
 * @param match - Match containing the players and match history.
 * @param legSelection - Selected leg used as the inclusive cutoff.
 * @returns Cumulative player values keyed by player ID.
 */
function resolvePlayerCumulativeValues(
  match: X01Match,
  legSelection: LegSelection
): ReadonlyMap<string, PlayerCumulativeValues> {
  const playerCumulativeValuesMap = createInitialPlayerCumulativeValuesMap(match);

  for (const setEntry of match.sets) {
    for (const legEntry of setEntry.set.legs) {
      const leg = legEntry.leg;

      // Accumulate scoring totals across all included legs.
      updateScoringValuesForLeg(leg, playerCumulativeValuesMap);

      // Only include leg wins from the selected set.
      if (setEntry.setNumber === legSelection.setEntry.setNumber) {
        updateLegsWon(leg, playerCumulativeValuesMap);
      }

      // Apply a set's result once its last currently present leg has been included.
      if (isLastLegInSet(setEntry.set, legEntry.legNumber)) {
        updateSetsWon(setEntry.set, playerCumulativeValuesMap);
      }

      // Show match results once the last currently present match leg has been included.
      if (isLastLegInMatch(match, setEntry.setNumber, legEntry.legNumber)) {
        updateWinOrDrawValues(match.players, playerCumulativeValuesMap);
      }

      // Return after including the selected leg to stop both loops.
      if (isLegSelected(legSelection, setEntry.setNumber, legEntry.legNumber)) {
        return playerCumulativeValuesMap;
      }
    }
  }

  return playerCumulativeValuesMap;
}

/**
 * Creates zeroed cumulative values for every player in the match.
 *
 * @param match - Match containing the players.
 * @returns Initial cumulative player values keyed by player ID.
 */
function createInitialPlayerCumulativeValuesMap(match: X01Match): Map<string, PlayerCumulativeValues> {
  return new Map(
    match.players.map(player => [
      player.playerId,
      {
        isWinOrDraw: false,
        setsWon: 0,
        legsWon: 0,
        pointsThrown: 0,
        dartsThrown: 0,
        pointsThrownFirstNine: 0,
        dartsThrownFirstNine: 0
      }
    ])
  );
}

/**
 * Adds a leg's scoring totals to each player's cumulative values.
 *
 * First-nine totals include turns recorded in the first three rounds of the leg.
 *
 * @param leg - Leg containing the players' turns.
 * @param playerCumulativeValuesMap - Cumulative values to update, keyed by player ID.
 */
function updateScoringValuesForLeg(leg: X01Leg, playerCumulativeValuesMap: Map<string, PlayerCumulativeValues>): void {
  leg.rounds.forEach(roundEntry => {
    Object.entries(roundEntry.round.turns).forEach(([playerId, turn]) => {
      const cumulativeValues = playerCumulativeValuesMap.get(playerId);
      if (cumulativeValues === undefined) return;

      const dartsUsed = getDartsUsedForPlayerInRound(leg, roundEntry, playerId);

      // Accumulate the player's scoring values across the full leg.
      cumulativeValues.pointsThrown += turn.score;
      cumulativeValues.dartsThrown += dartsUsed;

      // Accumulate the player's scoring values from the first three rounds.
      if (isFirstNineRound(roundEntry.roundNumber)) {
        cumulativeValues.pointsThrownFirstNine += turn.score;
        cumulativeValues.dartsThrownFirstNine += dartsUsed;
      }
    });
  });
}

/**
 * Adds the leg's win to its winner's cumulative values, when a winner exists.
 *
 * The caller determines whether the leg belongs to the selected set.
 *
 * @param leg - Leg containing the winner.
 * @param playerCumulativeValuesMap - Cumulative values to update, keyed by player ID.
 */
function updateLegsWon(leg: X01Leg, playerCumulativeValuesMap: Map<string, PlayerCumulativeValues>): void {
  if (leg.winner === null) return;

  // Increment legs won if the winner exists in the cumulative values map.
  const winnerValues = playerCumulativeValuesMap.get(leg.winner);
  if (winnerValues === undefined) return;

  winnerValues.legsWon++;
}

/**
 * Adds set wins and drawn-set results to the players' cumulative values.
 *
 * The caller ensures that the set's last currently present leg has been included.
 *
 * @param set - Set containing the recorded player results.
 * @param playerCumulativeValuesMap - Cumulative values to update, keyed by player ID.
 */
function updateSetsWon(set: X01Set, playerCumulativeValuesMap: Map<string, PlayerCumulativeValues>): void {
  if (set.result === null) return;

  Object.entries(set.result).forEach(([playerId, result]) => {
    if (!isWinOrDrawResult(result)) return;

    // Increment sets won if the player exists in the cumulative values map.
    const cumulativeValues = playerCumulativeValuesMap.get(playerId);
    if (cumulativeValues === undefined) return;

    cumulativeValues.setsWon++;
  });
}

/**
 * Updates whether each player should be displayed as a match winner or draw.
 *
 * The caller ensures that the last currently present match leg has been included.
 *
 * @param players - Match players containing their result types.
 * @param playerCumulativeValuesMap - Cumulative values to update, keyed by player ID.
 */
function updateWinOrDrawValues(
  players: readonly X01MatchPlayer[],
  playerCumulativeValuesMap: Map<string, PlayerCumulativeValues>
): void {
  players.forEach(player => {
    // Update the result flag if the player exists in the cumulative values map.
    const cumulativeValues = playerCumulativeValuesMap.get(player.playerId);
    if (cumulativeValues === undefined) return;

    cumulativeValues.isWinOrDraw = isWinOrDrawResult(player.resultType);
  });
}

/**
 * Resolves selected-leg values for all players in one pass through its turns.
 *
 * Players who have not thrown retain the starting score, no last score, and
 * zero darts used. Checkout suggestions use each player's final remaining score.
 *
 * @param match - Match containing the players, settings, and current progress.
 * @param legSelection - Selected leg to resolve player values for.
 * @param checkouts - Checkout suggestions keyed by remaining score.
 * @returns Selected-leg player values keyed by player ID.
 */
function resolvePlayerLegValues(
  match: X01Match,
  legSelection: LegSelection,
  checkouts: X01CheckoutsMap
): ReadonlyMap<string, PlayerLegValues> {
  const leg = legSelection.legEntry.leg;
  const playerLegValuesMap = createInitialPlayerLegValuesMap(match, legSelection);

  // Keep each player's latest turn values while counting only this leg's darts.
  leg.rounds.forEach(roundEntry => {
    Object.entries(roundEntry.round.turns).forEach(([playerId, turn]) => {
      const legValues = playerLegValuesMap.get(playerId);
      if (legValues === undefined) return;

      legValues.remaining = turn.remaining;
      legValues.lastScore = turn.score;
      legValues.dartsUsed += getDartsUsedForPlayerInRound(leg, roundEntry, playerId);
    });
  });

  // Resolve checkout suggestions after all turns have been included.
  playerLegValuesMap.forEach(legValues => {
    legValues.suggestedCheckout = getSuggestedCheckout(legValues.remaining, checkouts);
  });

  return playerLegValuesMap;
}

/**
 * Initializes selected-leg values for every player.
 *
 * Players begin with the starting score, no last score, and zero darts used.
 *
 * @param match - Match containing the players, settings, and current progress.
 * @param legSelection - Selected leg used to resolve leg-specific state.
 * @returns Initial selected-leg values keyed by player ID.
 */
function createInitialPlayerLegValuesMap(match: X01Match, legSelection: LegSelection): Map<string, PlayerLegValues> {
  const leg = legSelection.legEntry.leg;

  return new Map(
    match.players.map(player => [
      player.playerId,
      {
        isCurrentThrower: isCurrentThrower(match, legSelection, player.playerId),
        startsLeg: doesPlayerStartLeg(leg, player.playerId),
        remaining: match.matchSettings.x01,
        suggestedCheckout: null,
        lastScore: null,
        dartsUsed: 0
      }
    ])
  );
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
 * Gets the checkout suggestion for a remaining score.
 *
 * @param remaining - Player's remaining score after the selected leg's turns.
 * @param checkouts - Checkout suggestions keyed by remaining score.
 * @returns Checkout suggestion, or null when no checkout is available.
 */
function getSuggestedCheckout(remaining: number, checkouts: X01CheckoutsMap): X01Checkout | null {
  if (!isCheckoutPossible(remaining)) {
    return null;
  }

  return checkouts.get(remaining) ?? null;
}
