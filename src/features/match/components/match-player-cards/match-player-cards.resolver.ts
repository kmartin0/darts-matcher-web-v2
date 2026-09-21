import {isWinOrDrawResult} from '../../../../data/model/base-match/result-type';
import {
  isCheckoutPossible,
  X01Checkout,
  X01CheckoutsMap
} from '../../../../data/model/x01/checkout/x01-checkout';
import {isLastLegInMatch, X01Match} from '../../../../data/model/x01/match/x01-match';
import {X01MatchPlayer} from '../../../../data/model/x01/match/x01-match-player';
import {calculateX01Average} from '../../../../data/model/x01/statistics/x01-average-statistics';
import {X01MatchTimelineLegEntry} from '../../../../data/model/x01/timeline/x01-match-timeline';
import {MatchPlayerCardData} from '../match-player-card/match-player-card-data';

/**
 * Resolves player cards from the selected timeline leg entry.
 *
 * Standings and averages include values through the selected leg.
 * Remaining score, last score, and darts used are scoped to that leg.
 *
 * @param match - Match containing player identities, settings, and current progress.
 * @param setNumber - Number of the set containing the selected leg.
 * @param timelineLegEntry - Timeline entry for the selected leg.
 * @param checkouts - Checkout suggestions keyed by remaining score.
 * @returns Player-card data in match player order.
 */
export function resolveMatchPlayerCards(
  match: X01Match,
  setNumber: number,
  timelineLegEntry: X01MatchTimelineLegEntry,
  checkouts: X01CheckoutsMap
): MatchPlayerCardData[] {
  return match.players.map(player =>
    resolvePlayerCard(match, player, setNumber, timelineLegEntry, checkouts)
  );
}

/**
 * Resolves a player's card from their timeline values.
 *
 * Match results are shown only at the last recorded match leg.
 * Historical legs never display a current thrower.
 *
 * @param match - Match containing settings, results, and current progress.
 * @param player - Player whose card is being resolved.
 * @param setNumber - Number of the set containing the selected leg.
 * @param timelineLegEntry - Timeline entry containing the player's values.
 * @param checkouts - Checkout suggestions keyed by remaining score.
 * @returns Render data for the player card.
 */
function resolvePlayerCard(
  match: X01Match,
  player: X01MatchPlayer,
  setNumber: number,
  timelineLegEntry: X01MatchTimelineLegEntry,
  checkouts: X01CheckoutsMap
): MatchPlayerCardData {
  const timelinePlayerEntry = timelineLegEntry.players[player.playerId];

  if (timelinePlayerEntry === undefined) {
    throw new Error(`Missing timeline values for player '${player.playerId}'.`);
  }

  const standing = timelinePlayerEntry.standing;
  const cumulativeValues = timelinePlayerEntry.cumulativeValues;
  const legValues = timelinePlayerEntry.legValues;

  return {
    // Match identity and settings.
    playerId: player.playerId,
    name: player.playerName,
    bestOfType: match.matchSettings.bestOf.bestOfType,

    // Standings and averages through the selected leg.
    isWinOrDraw: isLastLegInMatch(match, setNumber, timelineLegEntry.legNumber) && isWinOrDrawResult(player.resultType),
    setsWon: standing.setsWon,
    legsWon: standing.legsWonInCurrentSet,
    average: calculateX01Average(cumulativeValues.pointsThrown, cumulativeValues.dartsThrown),
    averageFirstNine: calculateX01Average(cumulativeValues.pointsThrownFirstNine, cumulativeValues.dartsThrownFirstNine),

    // Values within the selected leg.
    isCurrentThrower: isCurrentThrower(match, setNumber, timelineLegEntry.legNumber, player.playerId),
    startsLeg: timelineLegEntry.throwsFirst === player.playerId,
    remaining: legValues.remaining,
    suggestedCheckout: getSuggestedCheckout(legValues.remaining, checkouts),
    lastScore: legValues.lastScore,
    dartsUsed: legValues.dartsThrown
  };
}

/**
 * Checks whether the player is currently throwing in the selected leg.
 *
 * @param match - Match containing the current progress.
 * @param setNumber - Number of the selected set.
 * @param legNumber - Number of the selected leg.
 * @param playerId - ID of the player to check.
 * @returns Whether the selected leg and player match the current progress.
 */
function isCurrentThrower(match: X01Match, setNumber: number, legNumber: number, playerId: string): boolean {
  const progress = match.matchProgress;

  return progress.currentSet === setNumber &&
    progress.currentLeg === legNumber &&
    progress.currentThrower === playerId;
}

/**
 * Gets the checkout suggestion for a remaining score.
 *
 * @param remaining - Player's remaining score in the selected leg.
 * @param checkouts - Checkout suggestions keyed by remaining score.
 * @returns Checkout suggestion, or null when none is available.
 */
function getSuggestedCheckout(remaining: number, checkouts: X01CheckoutsMap): X01Checkout | null {
  if (!isCheckoutPossible(remaining)) {
    return null;
  }

  return checkouts.get(remaining) ?? null;
}
