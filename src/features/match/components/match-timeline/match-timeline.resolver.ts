import {isWinOrDrawResult} from '../../../../data/model/base-match/result-type';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {X01MatchPlayer} from '../../../../data/model/x01/match/x01-match-player';
import {isLastLegInSet} from '../../../../data/model/x01/set/x01-set';
import {X01StandingsEntry} from '../../../../data/model/x01/standings/x01-standings-entry';
import {
  MatchTimelineLegCardData,
  MatchTimelineLegCardPlayerData
} from '../match-timeline-leg-card/match-timeline-leg-card-data';

export interface MatchTimelinePlayerData {
  playerId: string;
  name: string;
  initials: string;
}

export interface MatchTimelineData {
  players: MatchTimelinePlayerData[];
  legCards: MatchTimelineLegCardData[];
}

/**
 * Resolves player identities and leg cards for the match timeline.
 *
 * Traverses sets and legs in their recorded chronological order. Each card
 * contains standings through its leg, inclusive. Leg wins restart for each
 * set; recorded set wins and draws are included at the set's final leg.
 *
 * @param match - Match containing the players, settings, and history.
 * @returns Player identities and chronologically ordered leg cards.
 */
export function resolveMatchTimeline(match: X01Match): MatchTimelineData {
  const players = resolvePlayers(match.players);
  const standingsById = createInitialStandings(players);
  const legCards: MatchTimelineLegCardData[] = [];

  for (const setEntry of match.sets) {
    // Start each set with zero leg wins while retaining accumulated set wins.
    standingsById.forEach(standing => {
      standing.legsWonInCurrentSet = 0;
    });

    for (const legEntry of setEntry.set.legs) {
      const leg = legEntry.leg;

      if (leg.winner !== null) {
        const winnerStanding = standingsById.get(leg.winner);

        if (winnerStanding !== undefined) {
          winnerStanding.legsWonInCurrentSet++;
        }
      }

      // Include the set result only when its final recorded leg is reached.
      if (
        setEntry.set.result !== null &&
        isLastLegInSet(setEntry.set, legEntry.legNumber)
      ) {
        for (const [playerId, result] of Object.entries(setEntry.set.result)) {
          if (!isWinOrDrawResult(result)) {
            continue;
          }

          const standing = standingsById.get(playerId);

          if (standing !== undefined) {
            standing.setsWon++;
          }
        }
      }

      legCards.push({
        setNumber: setEntry.setNumber,
        legNumber: legEntry.legNumber,

        x01: match.matchSettings.x01,
        bestOfType: match.matchSettings.bestOf.bestOfType,
        trackDoubles: match.matchSettings.trackDoubles,

        leg: leg,
        players: createPlayerSnapshots(players, standingsById)
      });
    }
  }

  return {
    players: players,
    legCards: legCards
  };
}

/**
 * Resolves player identities in match player order.
 *
 * Players with duplicate initials receive numeric suffixes in player order.
 *
 * @param players - Match players to resolve.
 * @returns Player identities with distinct initials.
 */
function resolvePlayers(players: readonly X01MatchPlayer[]): MatchTimelinePlayerData[] {
  const resolvedPlayers = players.map(player => ({
    playerId: player.playerId,
    name: player.playerName,
    initials: createInitials(player.playerName)
  }));

  const initialsCounts = new Map<string, number>();

  resolvedPlayers.forEach(player => {
    initialsCounts.set(
      player.initials,
      (initialsCounts.get(player.initials) ?? 0) + 1
    );
  });

  const initialsOccurrences = new Map<string, number>();

  return resolvedPlayers.map(player => {
    if (initialsCounts.get(player.initials) === 1) {
      return player;
    }

    const occurrence = (initialsOccurrences.get(player.initials) ?? 0) + 1;
    initialsOccurrences.set(player.initials, occurrence);

    return {
      ...player,
      initials: `${player.initials}-${occurrence}`
    };
  });
}

/**
 * Creates up to three uppercase initials from a player's name.
 *
 * @param playerName - Player name from which to create initials.
 * @returns Up to three uppercase player initials.
 */
function createInitials(playerName: string): string {
  return playerName
    .split(/\s+/)
    .filter(word => word.length > 0)
    .slice(0, 3)
    .map(word => word[0].toUpperCase())
    .join('');
}

/**
 * Creates zeroed standings for every match player.
 *
 * @param players - Players whose standings will be accumulated.
 * @returns Mutable standings keyed by player ID.
 */
function createInitialStandings(players: readonly MatchTimelinePlayerData[]): Map<string, X01StandingsEntry> {
  return new Map(
    players.map(player => [
      player.playerId,
      {
        setsWon: 0,
        legsWonInCurrentSet: 0
      }
    ])
  );
}

/**
 * Creates player snapshots through the displayed leg in match player order.
 *
 * Each standing is copied so subsequent leg wins and set resets cannot
 * change the standings already supplied to an earlier card.
 *
 * @param players - Ordered player identities.
 * @param standingsById - Accumulated standings through the displayed leg.
 * @returns Player identities and independent standing snapshots.
 */
function createPlayerSnapshots(
  players: readonly MatchTimelinePlayerData[],
  standingsById: ReadonlyMap<string, X01StandingsEntry>
): MatchTimelineLegCardPlayerData[] {
  return players.map(player => {
    const standing = standingsById.get(player.playerId);

    if (standing === undefined) {
      throw new Error(`Missing timeline standing for player '${player.playerId}'.`);
    }

    return {
      playerId: player.playerId,
      initials: player.initials,
      standing: {
        setsWon: standing.setsWon,
        legsWonInCurrentSet: standing.legsWonInCurrentSet
      }
    };
  });
}
