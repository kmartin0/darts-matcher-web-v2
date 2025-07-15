import {Injectable} from '@angular/core';
import {X01Match} from '../../../models/x01-match/x01-match';
import {X01SetEntry} from '../../../models/x01-match/x01-set-entry';
import {X01Set} from '../../../models/x01-match/x01-set';
import {X01LegEntry} from '../../../models/x01-match/x01-leg-entry';
import {X01Leg} from '../../../models/x01-match/x01-leg';
import {X01LegRoundEntry} from '../../../models/x01-match/x01-leg-round-entry';
import {X01MatchPlayer} from '../../../models/x01-match/x01-match-player';
import {X01LegRoundScore} from '../../../models/x01-match/x01-leg-round-score';
import {X01PlayerStanding} from '../../../models/common/x01-player-standing';
import {ResultType} from '../../../models/basematch/result-type';

@Injectable({providedIn: 'root'})
export class X01MatchService {

  /**
   * Retrieves a set from the match by its set number.
   *
   * @param match The X01Match object or null.
   * @param setNumber The number of the set to retrieve.
   * @returns The X01SetEntry object, or null if not found.
   */
  getSet(match: X01Match | null, setNumber: number): X01SetEntry | null {
    if (!match) return null;
    return match.sets.find(set => set.setNumber === setNumber) ?? null;
  }

  /**
   * Retrieves a leg from a set by its leg number.
   * @param set The X01Set object or null.
   * @param legNumber The number of the leg to retrieve.
   * @returns The X01LegEntry object, or null if not found.
   */
  getLeg(set: X01Set | null, legNumber: number): X01LegEntry | null {
    if (!set) return null;
    return set.legs.find(leg => leg.legNumber === legNumber) ?? null;
  }

  /**
   * Retrieves a round from a leg by its round number.
   * @param leg The X01Leg object or null.
   * @param roundNumber The number of the round to retrieve.
   * @returns The X01LegRoundEntry object, or null if not found.
   */
  getRound(leg: X01Leg | null, roundNumber: number): X01LegRoundEntry | null {
    if (!leg) return null;
    return leg.rounds.find(round => round.roundNumber === roundNumber) ?? null;
  }

  /**
   * Retrieves the current set in play based on match progress.
   * @param match The X01Match object.
   * @returns The X01SetEntry for the set in play, or null if not found.
   */
  getSetInPlay(match: X01Match): X01SetEntry | null {
    const currentSetNumber = match.matchProgress.currentSet;
    return currentSetNumber !== null ? this.getSet(match, currentSetNumber) : null;
  }

  /**
   * Retrieves the current leg in play within a given set.
   * @param match The X01Match object.
   * @param setInPlay The X01Set object for the current set.
   * @returns The X01LegEntry for the leg in play, or null if not found.
   */
  getLegInPlay(match: X01Match, setInPlay: X01Set | null): X01LegEntry | null {
    const currentLegNumber = match.matchProgress.currentLeg;
    if (setInPlay === null || currentLegNumber === null) return null;
    return this.getLeg(setInPlay, currentLegNumber);
  }

  /**
   * Retrieves a player from the match by its id.
   * @param match The X01Match object.
   * @param playerId The ID of the player to retrieve.
   * @returns The X01MatchPlayer object, or null if not found.
   */
  getPlayer(match: X01Match, playerId: string | null): X01MatchPlayer | null {
    return match.players.find(player => player.playerId === playerId) ?? null;
  }

  /**
   * Retrieves the current thrower's player object.
   * @param match The X01Match object (can be null/undefined).
   * @returns The X01MatchPlayer object for the current thrower, or null.
   */
  getCurrentThrower(match: X01Match | null | undefined): X01MatchPlayer | null {
    if (!match) return null;
    return this.getPlayer(match, match.matchProgress.currentThrower);
  }

  /**
   * Calculates the remaining score for a specific player in a given leg.
   * @param leg The X01Leg object.
   * @param x01 The starting X01 score (e.g., 501, 301).
   * @param playerId The ID of the player.
   * @returns The remaining score for the player.
   */
  getRemainingForPlayer(leg: X01Leg, x01: number, playerId: string) {
    let remaining = x01;
    leg.rounds.forEach(roundEntry => {
      if (Object.hasOwn(roundEntry.round.scores, playerId)) remaining -= roundEntry.round.scores[playerId].score;
    });

    return remaining;
  }

  /**
   * Calculates the remaining score for the current player in the active leg.
   * @param match The X01Match object.
   * @returns The remaining score.
   * @throws Error if necessary match progress details are not found.
   */
  getRemainingForCurrentPlayer(match: X01Match): number {
    const setInPlayEntry = this.getSetInPlay(match);
    const legInPlayEntry = this.getLegInPlay(match, setInPlayEntry?.set ?? null);
    const currentPlayerId = match.matchProgress.currentThrower;

    if (!setInPlayEntry || !legInPlayEntry || !currentPlayerId) throw new Error('Remaining for current player not found.');

    return this.getRemainingForPlayer(legInPlayEntry.leg, match.matchSettings.x01, currentPlayerId);
  }

  /**
   * Finds the last recorded score for a specific player in a leg.
   * @param leg The X01Leg object.
   * @param playerId The ID of the player.
   * @returns The X01LegRoundScore object, or null if no score found.
   */
  findLastPlayerScore(leg: X01Leg, playerId: string): X01LegRoundScore | null {
    for (const roundEntry of leg.rounds.slice().reverse()) {
      if (Object.hasOwn(roundEntry.round.scores, playerId)) {
        return roundEntry.round.scores[playerId];
      }
    }

    return null;
  }

  /**
   * Creates a map of player standings based on the completed sets and legs in a match.
   * @param match The X01Match object.
   * @returns A Map where keys are player IDs and values are X01PlayerStanding objects.
   */
  createStandings(match: X01Match): Map<string, X01PlayerStanding> {
    const standings = this.createEmptyStandings(match);

    // Go through the match and for each won set/leg increment the winners' standings accordingly.
    match.sets.forEach(setEntry => {
      setEntry.set.legs.forEach(legEntry => {
        const legWinner = legEntry.leg.winner;
        if (legWinner) {
          const playerStanding = standings.get(legWinner);
          if (playerStanding) {
            playerStanding.legsWon++;
            if (setEntry.setNumber === match.matchProgress.currentSet) playerStanding.legsWonInCurrentSet++;
          }
        }
      });
      if (setEntry.set.result) {
        Object.entries(setEntry.set.result).forEach(([playerId, result]) => {
          const playerStanding = standings.get(playerId);
          if (playerStanding && result === ResultType.WIN) playerStanding.setsWon++;
        });
      }
    });

    return standings;
  }

  /**
   * Creates an empty map of player standings, initialized with an entry for each match player with scores set to zero.
   * @param match The X01Match object.
   * @returns A Map where keys are player IDs and values are X01PlayerStanding objects.
   */
  private createEmptyStandings(match: X01Match): Map<string, X01PlayerStanding> {
    return new Map(
      match.players.map(player => [
        player.playerId,
        {
          playerId: player.playerId,
          playerName: player.playerName,
          setsWon: 0,
          legsWon: 0,
          legsWonInCurrentSet: 0,
        }
      ])
    );
  }
}
