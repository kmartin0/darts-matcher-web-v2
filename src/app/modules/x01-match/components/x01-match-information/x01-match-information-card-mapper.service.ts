import {Injectable} from '@angular/core';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {X01BestOfType} from '../../../../models/x01-match/x01-best-of-type';
import {X01ClearByTwoRule} from '../../../../models/x01-match/x01-clear-by-two-rule';
import {epochSecondsToDate} from '../../../../shared/utils/number.utils';
import {
  InformationCardData,
  InformationCardRow,
  InformationCardSection
} from '../../../../shared/components/information-card/information-card-data';
import {MatchStatus} from '../../../../models/basematch/match-status';
import {X01StandingsEntry} from '../../../../models/x01-match/x01-standings-entry';

@Injectable({providedIn: 'root'})
export class X01MatchInformationCardMapperService {

  /**
   * Map an X01Match object to InformationCardData.
   * Which is used for displaying match information in an information card component.
   *
   * @param match The match object to be mapped.
   * @returns The mapped InformationCardData.
   */
  mapToCardData(match: X01Match | null): InformationCardData | null {
    if (!match) return null;

    return {
      header: 'Match Information',
      sections: [
        this.createResultsSection(match),
        this.createRulesSection(match),
        this.createDateSection(match),
        this.createTriviaSection(match),
      ]
    };
  }

  /**
   * Create the results section which contains a row for each player with their name, result, and sets/legs won.
   *
   * @param match The X01Match object.
   * @returns InformationCardSection containing player names, results (win/lose/draw), and sets/legs won.
   */
  private createResultsSection(match: X01Match): InformationCardSection {
    const standingRows: InformationCardRow[] = match.players.flatMap(player => {
      let formattedPlayerStanding = this.formatPlayerStanding(
        match.standings[player.playerId],
        match.matchStatus,
        match.matchSettings.bestOf.bestOfType
      )

      return {
        label: `${player.playerName}`,
        value: (player.resultType ? `${player.resultType} - ` : '') + `${formattedPlayerStanding}`
      };
    });

    return {
      sectionHeader: 'Result',
      rows: standingRows
    };
  }

  private formatPlayerStanding(playerStanding: X01StandingsEntry | undefined, matchStatus: MatchStatus, bestOfType: X01BestOfType) {
    const isMatchInPlay = matchStatus === MatchStatus.IN_PLAY;

    switch (bestOfType) {
      case X01BestOfType.SETS: {
        const setsWon = playerStanding?.setsWon ?? '';
        const legsWonInCurrentSet = playerStanding?.legsWonInCurrentSet ?? '';
        return isMatchInPlay ? `${setsWon} (${legsWonInCurrentSet})` : `${setsWon}`;
      }
      case X01BestOfType.LEGS:
      default: {
        return playerStanding?.legsWonInCurrentSet?.toString() ?? '';
      }
    }
  }


  /**
   * Creates the rules section containing the rules of the match.
   *
   * @param match The match object
   * @returns InformationCardSection containing match rules.
   */
  private createRulesSection(match: X01Match): InformationCardSection {
    const matchSettings = match.matchSettings;
    const bestOfSettings = matchSettings.bestOf;
    const isBestOfSets = bestOfSettings.bestOfType === X01BestOfType.SETS;

    return {
      sectionHeader: 'Rules',
      rows: [
        {label: 'X01', value: matchSettings.x01},
        {label: 'Format', value: 'SIDO'},
        {label: 'Goal', value: `Best of - ${this.formatBestOfType(matchSettings.bestOf.bestOfType)}`},
        ...(isBestOfSets) ? [{label: 'Sets', value: matchSettings.bestOf.sets}] : [],
        {label: 'Legs', value: matchSettings.bestOf.legs},
        ...(isBestOfSets) ? [{
          label: 'Clear by two sets',
          value: this.formatClearByTwoRule(bestOfSettings.clearByTwoSetsRule)
        }] : [],
        {label: 'Clear by two legs', value: this.formatClearByTwoRule(bestOfSettings.clearByTwoLegsRule)},
        ...(isBestOfSets) ? [{
          label: 'Clear by two legs final set',
          value: this.formatClearByTwoRule(bestOfSettings.clearByTwoLegsInFinalSetRule)
        }] : [],
        {label: 'Track Doubles', value: matchSettings.trackDoubles ? 'Yes' : 'No'}
      ]
    };
  }

  /**
   * Creates the rules section containing the start, end, and match time of the match.
   *
   * @param match The match object
   * @returns InformationCardSection containing match date and times.
   */
  private createDateSection(match: X01Match): InformationCardSection {
    return {
      sectionHeader: 'Date',
      rows: [
        {label: 'Start', value: this.formatDisplayDate(epochSecondsToDate(match.startDate))},
        {label: 'End', value: this.formatDisplayDate(epochSecondsToDate(match.endDate))},
        {label: 'Match time', value: this.formatMatchTime(match.startDate, match.endDate)}
      ]
    };
  }

  /**
   * Creates the trivia section containing trivia of the match (sets played, legs played, match id).
   *
   * @param match The match object
   * @returns InformationCardSection containing match trivia.
   */
  private createTriviaSection(match: X01Match): InformationCardSection {
    return {
      sectionHeader: 'Trivia',
      rows: [
        {label: 'Sets played', value: this.getSetsPlayed(match)},
        {label: 'Legs played', value: this.getLegsPlayed(match)},
        {label: 'Match id', value: match.id}
      ]
    };
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

  /**
   * Formats a date to a user-friendly display string.
   * Format used: 'Mon, 08/04/2025, 10:44 UTC'
   *
   * @param date The date to be displayed.
   * @returns formatted date.
   */
  private formatDisplayDate(date: Date | null): string {
    if (!date) return '';

    const formatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
      timeZone: 'UTC',
      hour12: false
    });
    return formatter.format(date);
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
    if (!endDate) {
      endDate = Date.now() / 1000;
    }

    const diffInSeconds = endDate - startDate;
    const diffInMinutes = Math.floor(diffInSeconds / 60);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes`;
    }

    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}h ${minutes}m`;
  }
}
