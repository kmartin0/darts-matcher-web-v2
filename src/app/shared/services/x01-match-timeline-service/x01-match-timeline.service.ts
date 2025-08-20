import {Injectable} from '@angular/core';
import {X01Match} from '../../../models/x01-match/x01-match';
import {
  X01LegStandings,
  X01PlayerLegStanding,
  X01SetStandingsTimeline,
  X01StandingsTimeline
} from '../../../models/x01-match/x01-standings-timeline';
import {X01SetEntry} from '../../../models/x01-match/x01-set-entry';
import {X01MatchPlayer} from '../../../models/x01-match/x01-match-player';
import {X01Set} from '../../../models/x01-match/x01-set';
import {ResultType} from '../../../models/basematch/result-type';
import {X01LegEntry} from '../../../models/x01-match/x01-leg-entry';
import {X01Leg} from '../../../models/x01-match/x01-leg';

@Injectable({providedIn: 'root'})
export class X01MatchTimelineService {

  /**
   * Builds the timeline of the standings throughout a match.
   *
   * @param match - The X01Match for which to build the timeline of the match standings.
   * @returns An {@link X01StandingsTimeline} mapping all sets and legs to the standings at that point in the match.
   */
  public createStandingsTimeline(match: X01Match | null): X01StandingsTimeline {
    if (!match) return new Map();

    const standingsTimeline: X01StandingsTimeline = new Map();
    let prevSetStandingTimeline: X01SetStandingsTimeline = new Map();

    // Create a set timeline for each set and add it to the standings timeline.
    match.sets.forEach(setEntry => {
      const setStandings = this.createSetStandingsTimeline(setEntry, match.players, prevSetStandingTimeline);
      standingsTimeline.set(setEntry.setNumber, setStandings);
      prevSetStandingTimeline = setStandings;
    });

    return standingsTimeline;
  }

  /**
   * Builds the standings timeline for a set.
   *
   * @param setEntry - The set entry being processed.
   * @param players - The players in the match.
   * @param prevSetStandings - Standings timeline of the previous set or null if there is no previous set standings.
   * @returns An {@link X01SetStandingsTimeline} with the standings for this set.
   */
  private createSetStandingsTimeline(
    setEntry: X01SetEntry,
    players: X01MatchPlayer[],
    prevSetStandings: X01SetStandingsTimeline | null
  ): X01SetStandingsTimeline {
    const setStandings: X01SetStandingsTimeline = new Map();

    // Initialize previous leg standings with the last leg standings of the previous set.
    let prevLegStandings: X01LegStandings | null = Array.from(prevSetStandings?.values() ?? []).at(-1) ?? null;

    // Build standings for each leg in this set.
    setEntry.set.legs.forEach(legEntry => {
      const legStandings = this.createLegStandings(setEntry, legEntry, players, prevLegStandings);
      setStandings.set(legEntry.legNumber, legStandings);
      prevLegStandings = legStandings;
    });

    // Apply set-level win/draw results to increment sets won
    this.updateSetsWon(setEntry.set, prevLegStandings);

    return setStandings;
  }

  /**
   * Updates the setsWon counter for players if a set is finished.
   * Increments for players who WIN or DRAW in the set result.
   *
   * @param set The completed set.
   * @param lastLegStandings The final leg standings of this set.
   */
  private updateSetsWon(set: X01Set, lastLegStandings: X01LegStandings | null) {
    if (set.result) {
      Object.entries(set.result).forEach(([playerId, playerResult]) => {
        if (lastLegStandings && (playerResult === ResultType.WIN || playerResult === ResultType.DRAW)) {
          const playerStanding = lastLegStandings?.standings.get(playerId);
          if (playerStanding) playerStanding.setsWon++;
        }
      });
    }
  }

  /**
   * Builds the standings for a leg by carrying over the previous leg standings and incrementing `legsWonInSet` for
   * whoever won this leg.
   *
   * @param setEntry The set this leg belongs to.
   * @param legEntry The leg entry being processed.
   * @param players The players in the match.
   * @param prevLegStanding The previous leg standings, or null.
   * @returns A new leg standings object.
   */
  private createLegStandings(
    setEntry: X01SetEntry,
    legEntry: X01LegEntry,
    players: X01MatchPlayer[],
    prevLegStanding: X01LegStandings | null
  ): X01LegStandings {
    // Configure initial leg standings object.
    let legStandings: X01LegStandings = this.initEmptyLegStanding(setEntry.setNumber, legEntry.legNumber);

    // If no previous leg exists, previous leg is set to set 0, leg 0.
    if (!prevLegStanding) {
      prevLegStanding = this.initEmptyLegStanding(0, 0);
    }

    // Build standings entry for each player
    players.forEach(player => {
      const playerId = player.playerId;
      const prevPlayerStanding: X01PlayerLegStanding = this.getPrevPlayerStanding(prevLegStanding, playerId);
      const standingsEntry: X01PlayerLegStanding = this.buildPlayerStanding(setEntry.setNumber, legEntry.leg, playerId, prevPlayerStanding, prevLegStanding);
      legStandings.standings.set(playerId, standingsEntry);
    });

    return legStandings;
  }

  /**
   * Creates an empty leg standings object by initializing the set and leg number and an empty standings map.
   *
   * @param setNumber The set number this leg belongs to.
   * @param legNumber The leg number being initialized.
   * @returns A leg standings object with empty player standings.
   */
  private initEmptyLegStanding(setNumber: number, legNumber: number): X01LegStandings {
    return {
      setNumber: setNumber,
      legNumber: legNumber,
      standings: new Map()
    };
  }

  /**
   * Retrieves the previous standing for a given player.
   * If not found, initializes a new standing with zero wins.
   *
   * @param prevLegStanding The standings from the previous leg, or null.
   * @param playerId The ID of the player.
   * @returns The player's previous leg standing, or a new default standing.
   */
  private getPrevPlayerStanding(
    prevLegStanding: X01LegStandings | null,
    playerId: string
  ): X01PlayerLegStanding {
    return (
      prevLegStanding?.standings.get(playerId) ?? {
        setsWon: 0,
        legsWonInSet: 0
      }
    );
  }

  /**
   * Builds the current leg standing for a player.
   * Uses setsWon and legsWonInSet from the previous standing, resets legsWonInSet on new set.
   * Increments legsWonInSet if the player won the leg.
   *
   * @param setNumber The current set number.
   * @param leg The current leg object.
   * @param playerId The ID of the player.
   * @param prevPlayerStanding The player's standing from previous leg.
   * @param prevLegStanding The previous leg standings for comparison.
   * @returns The updated player leg standing.
   */
  private buildPlayerStanding(
    setNumber: number,
    leg: X01Leg,
    playerId: string,
    prevPlayerStanding: X01PlayerLegStanding,
    prevLegStanding: X01LegStandings
  ): X01PlayerLegStanding {
    const standingsEntry: X01PlayerLegStanding = {
      // Carry forward the setsWon from the previous leg standing.
      setsWon: prevPlayerStanding.setsWon,

      // Reset legsWonInSet when a new set starts
      legsWonInSet: prevLegStanding.setNumber === setNumber ? prevPlayerStanding.legsWonInSet : 0
    };

    // Increment legsWonInSet if this player won the leg
    if (leg.winner && playerId === leg.winner) {
      standingsEntry.legsWonInSet++;
    }

    return standingsEntry;
  }
}
