import {Injectable} from '@angular/core';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {PlayerResults, X01MatchInformationViewmodel} from './x01-match-information-viewmodel';
import {X01BestOfType} from '../../../../models/x01-match/x01-best-of-type';
import {ResultType} from '../../../../models/basematch/result-type';
import {X01ClearByTwoRule} from '../../../../models/x01-match/x01-clear-by-two-rule';
import {epochSecondsToDate} from '../../../../shared/utils/number.utils';

@Injectable({providedIn: 'root'})
export class X01MatchInformationViewmodelMapperService {

  /**
   * Maps an X01Match object to an X01MatchInformationViewmodel.
   *
   * @param match The X01Match object top be mapped.
   * @returns The mapped viewmodel or null if input is null.
   */
  map(match: X01Match | null): X01MatchInformationViewmodel | null {
    if (!match) return null;
    const matchSettings = match.matchSettings;
    const bestOfSettings = matchSettings.bestOf;

    return {
      results: this.createResults(match),
      rules: {
        x01: matchSettings.x01,
        format: 'SIDO',
        goal: 'Best Of',
        bestOfType: matchSettings.bestOf.bestOfType,
        bestOfTypeDisplay: this.formatBestOfType(matchSettings.bestOf.bestOfType),
        sets: matchSettings.bestOf.sets,
        legs: matchSettings.bestOf.legs,
        clearByTwoSetsDisplay: this.formatClearByTwoRule(bestOfSettings.clearByTwoSetsRule),
        clearByTwoLegsDisplay: this.formatClearByTwoRule(bestOfSettings.clearByTwoLegsRule),
        clearByTwoLegsInFinalSetDisplay: this.formatClearByTwoRule(bestOfSettings.clearByTwoLegsInFinalSetRule),
      },
      date: {
        startDate: epochSecondsToDate(match.startDate),
        endDate: epochSecondsToDate(match.endDate),
        matchTimeDisplay: this.formatMatchTime(match.startDate, match.endDate),
      },
      trivia: {
        setsPlayed: this.getSetsPlayed(match),
        legsPlayed: this.getLegsPlayed(match),
        matchId: match.id
      }
    };
  }

  /**
   * Creates player results which contains the number of sets or legs won for each player depending on which
   * best of type the match is used.
   *
   * @param match The X01Match object.
   * @returns PlayerResults map containing player names, results (win/lose/draw), and sets/legs won.
   */
  private createResults(match: X01Match): PlayerResults {
    switch (match.matchSettings.bestOf.bestOfType) {
      case X01BestOfType.SETS: {
        return this.createResultsBestOfSets(match);
      }
      case X01BestOfType.LEGS: {
        return this.createResultsBestOfLegs(match);
      }
    }
  }

  /**
   * Initializes the PlayerResults map with an entry for each player id containing the player name, their result and
   * an empty number of sets/legs won.
   *
   * @param match The X01Match object.
   * @returns PlayerResults initialized with all players.
   */
  private initializeResultsMap(match: X01Match): PlayerResults {
    const initialResults: PlayerResults = {};
    match.players.forEach(player => {
      initialResults[player.playerId] = {
        name: player.playerName,
        result: player.resultType,
        numWon: 0
      };
    });

    return initialResults;
  }

  /**
   * Creates results for each player where the numWon is the total number of legs won.
   *
   * @param match The X01Match object.
   * @returns PlayerResults with number of legs won per player.
   */
  private createResultsBestOfLegs(match: X01Match): PlayerResults {
    const results = this.initializeResultsMap(match);

    const firstSetEntry = match.sets.at(0);
    if (firstSetEntry) {
      firstSetEntry.set.legs.forEach(legEntry => {
        const legWinner = legEntry.leg.winner;
        const legWinnerEntry = legWinner ? results[legWinner] : null;
        if (legWinnerEntry) legWinnerEntry.numWon += 1;
      });
    }

    return results;
  }

  /**
   * Creates results for each player where the numWon is the total number of sets won.
   *
   * @param match The X01Match object.
   * @returns PlayerResults with number of sets won per player.
   */
  private createResultsBestOfSets(match: X01Match): PlayerResults {
    const results = this.initializeResultsMap(match);

    match.sets.forEach(setEntry => {
      if (setEntry.set.result) {
        Object.entries(setEntry.set.result).forEach(([playerId, setResult]) => {
          if (setResult === ResultType.WIN || setResult === ResultType.DRAW) {
            const setWinnerEntry = results[playerId];
            if (setWinnerEntry) setWinnerEntry.numWon += 1;
          }
        });
      }
    });

    return results;
  }

  /**
   * Converts the enum bestOfType to a user-friendly display string.
   *
   * @param bestOfType The enum value of the bestOfType.
   * @returns The display string for the bestOfType.
   */
  private formatBestOfType(bestOfType: X01BestOfType): string {
    switch (bestOfType) {
      case X01BestOfType.SETS:
        return 'Sets';
      case X01BestOfType.LEGS:
        return 'Legs';
    }
  }

  /**
   * Formats the Clear By Two rule to a user-friendly display string.
   *
   * @param clearByTwoRule The rule object containing enabled flag and limit number.
   * @returns A formatted string like 'Yes - Limit X' or 'No'.
   */
  private formatClearByTwoRule(clearByTwoRule: X01ClearByTwoRule): string {
    return clearByTwoRule.enabled ? `Yes - Limit ${clearByTwoRule.limit}` : 'No';
  }

  /**
   * Formats the match time difference between start and end dates to a user-friendly display string.
   * If endDate is null, uses current UTC timestamp.
   *
   * @param startDate Epoch seconds of match start.
   * @param endDate Epoch seconds of match end or null.
   * @returns Formatted string representing match duration.
   */
  private formatMatchTime(startDate: number, endDate: number | null): string {
    // Use current UTC timestamp in seconds if endDate is null
    if (!endDate) {
      endDate = Math.floor(Date.now() / 1000);
    }

    // Get the difference in minutes.
    const diffInSeconds = endDate - startDate;
    const diffInMinutes = Math.floor(diffInSeconds / 60);

    // When the match time is under an hour only show minutes.
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes`;
    }

    // Return the match time in hours and minutes.
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h${minutes}m`;
  }

  /**
   * Count the number of sets played in the match.
   *
   * @param match The X01Match object.
   * @returns Number of completed sets.
   */
  private getSetsPlayed(match: X01Match): number {
    return match.sets.filter(setEntry => setEntry.set.result !== null).length;
  }

  /**
   * Counts the number of legs played across all sets in the match.
   *
   * @param match The X01Match object.
   * @returns Number of completed legs.
   */
  private getLegsPlayed(match: X01Match): number {
    return match.sets.flatMap(setEntry => setEntry.set.legs)
      .filter(legEntry => legEntry.leg.winner !== null)
      .length;
  }
}
