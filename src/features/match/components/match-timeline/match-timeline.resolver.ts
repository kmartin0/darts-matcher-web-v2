import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {X01MatchPlayer} from '../../../../data/model/x01/match/x01-match-player';
import {calculateX01Average} from '../../../../data/model/x01/statistics/x01-average-statistics';
import {X01MatchTimelineLegEntry} from '../../../../data/model/x01/timeline/x01-match-timeline';
import {
  MatchTimelineLegCardData,
  MatchTimelineLegCardPlayerData
} from '../match-timeline-leg-card/match-timeline-leg-card-data';
import {MatchTimelineBuilder} from '../../builders/match-timeline.builder';
import {getPlayerTag} from '../../../../data/model/base-match/match-player';

/**
 * Resolves leg cards in recorded match order.
 *
 * @param match - Match containing the players, settings, and history.
 * @returns Leg-card data in chronological order.
 */
export function resolveTimelineLegCards(match: X01Match): MatchTimelineLegCardData[] {
  const timeline = MatchTimelineBuilder.build(match);
  const legCards: MatchTimelineLegCardData[] = [];

  for (const setEntry of timeline.setEntries.values()) {
    for (const legEntry of setEntry.legEntries.values()) {
      legCards.push(resolveLegCard(match, setEntry.setNumber, legEntry));
    }
  }

  return legCards;
}

/**
 * Resolves a single leg card from its timeline entry.
 *
 * @param match - Match containing the settings and players.
 * @param setNumber - Number of the set containing the leg.
 * @param legEntry - Timeline entry for the displayed leg.
 * @returns Leg-card data for the leg.
 */
function resolveLegCard(
  match: X01Match,
  setNumber: number,
  legEntry: X01MatchTimelineLegEntry
): MatchTimelineLegCardData {
  return {
    setNumber: setNumber,
    legNumber: legEntry.legNumber,

    bestOfType: match.matchSettings.bestOf.bestOfType,
    trackDoubles: match.matchSettings.trackDoubles,

    throwsFirst: legEntry.throwsFirst,
    winner: legEntry.winner,
    checkoutScore: legEntry.checkoutScore,

    players: resolveLegCardPlayers(match.players, legEntry)
  };
}

/**
 * Resolves player identities, standings, and leg statistics in match player order.
 *
 * @param players - Match players in match order.
 * @param legEntry - Timeline entry containing standings and leg values.
 * @returns Player data for the leg card.
 */
function resolveLegCardPlayers(
  players: readonly X01MatchPlayer[],
  legEntry: X01MatchTimelineLegEntry
): MatchTimelineLegCardPlayerData[] {
  return players.map((player, index) => {
    const timelinePlayerEntry = legEntry.players[player.playerId];

    if (timelinePlayerEntry === undefined) {
      throw new Error(`Missing timeline values for player '${player.playerId}'.`);
    }

    const legValues = timelinePlayerEntry.legValues;

    return {
      playerId: player.playerId,
      playerTag: getPlayerTag(index + 1),
      standing: timelinePlayerEntry.standing,

      dartsUsed: legValues.dartsThrown,
      average: calculateX01Average(legValues.pointsThrown, legValues.dartsThrown),
      remaining: legValues.remaining,
      doublesMissed: legValues.doublesMissed
    };
  });
}
