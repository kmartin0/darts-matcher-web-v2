import {inject, Injectable} from '@angular/core';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {X01MatchTimelineViewmodel} from './x01-match-timeline-viewmodel';
import {X01MatchPlayer} from '../../../../models/x01-match/x01-match-player';
import {X01SetEntry} from '../../../../models/x01-match/x01-set-entry';
import {X01LegEntry} from '../../../../models/x01-match/x01-leg-entry';
import {
  X01MatchTimelineLegTableDataSource,
  X01MatchTimelineLegTableRow
} from './x01-match-timeline-leg-table-data-source';
import {X01Leg} from '../../../../models/x01-match/x01-leg';
import {
  X01LegStandings,
  X01SetStandingsTimeline,
  X01StandingsTimeline
} from '../../../../models/x01-match/x01-standings-timeline';
import {
  X01MatchTimelineService
} from '../../../../shared/services/x01-match-timeline-service/x01-match-timeline.service';
import {X01MatchService} from '../../../../shared/services/x01-match-service/x01-match.service';
import {X01LegRoundScore} from '../../../../models/x01-match/x01-leg-round-score';

@Injectable({providedIn: 'root'})
export class X01MatchTimelineViewmodelMapper {
  matchService: X01MatchService = inject(X01MatchService);
  matchTimelineService: X01MatchTimelineService = inject(X01MatchTimelineService);

  /**
   * Maps an `X01Match` object to a timeline view model.
   *
   * @param match The match to map, or `null` if no match exists.
   * @returns A {@link X01MatchTimelineViewmodel} or `null`.
   */
  mapToViewModel(match: X01Match | null): X01MatchTimelineViewmodel | null {
    if (!match) return null;

    const playersDetails = this.mapPlayers(match.players);

    return {
      trackDoubles: match.matchSettings.trackDoubles,
      bestOfType: match.matchSettings.bestOf.bestOfType,
      players: playersDetails,
      sets: this.mapSets(match.sets, match.matchSettings.x01, playersDetails, this.matchTimelineService.createStandingsTimeline(match))
    };
  }

  /**
   * Builds a map of players with their details (id, name, initials).
   *
   * @param players The list of match players.
   * @returns A Map with key player ID and value player details object.
   */
  private mapPlayers(players: X01MatchPlayer[]): X01MatchTimelineViewmodel['players'] {
    const playersDetails: X01MatchTimelineViewmodel['players'] = new Map();

    // Fill player map with id, name, and generated initials
    players.forEach(player => {
      playersDetails.set(player.playerId, {
        id: player.playerId,
        name: player.playerName,
        initials: this.createPlayerInitials(player.playerName),
      });
    });

    // Append a number to duplicate initials to ensure uniqueness.
    this.resolveDuplicateInitials(playersDetails);

    return playersDetails;
  }

  /**
   * Ensures players with duplicate initials receive numeric suffixes.
   *
   * @param playersDetails Map of players keyed by ID.
   */
  private resolveDuplicateInitials(playersDetails: X01MatchTimelineViewmodel['players']) {
    // Count how many times each set of initials occurs
    const initialsCount: Record<string, number> = {};
    playersDetails.forEach((playerDetails => {
      initialsCount[playerDetails.initials] = (initialsCount[playerDetails.initials] || 0) + 1;
    }));

    // Append suffix if initials are not unique
    const appendedSuffixCount: Record<string, number> = {};
    playersDetails.forEach(playerDetails => {
      if (initialsCount[playerDetails.initials] > 1) {
        const suffixNum = (appendedSuffixCount[playerDetails.initials] ?? 0) + 1;
        appendedSuffixCount[playerDetails.initials] = suffixNum;
        playerDetails.initials = `${playerDetails.initials}-${suffixNum}`;
      }
    });
  }

  /**
   * Generates initials from a player's name.
   *
   * @param playerName The player's full name.
   * @returns Uppercased initials (first character of each word).
   */
  private createPlayerInitials(playerName: string) {
    return playerName.split(' ')
      .filter(word => word.length > 0)
      .map(word => word[0].toUpperCase())
      .join('');
  }

  /**
   * Maps set entries to view model sets.
   *
   * @param sets The match's sets.
   * @param x01 The x01 setting for the match
   * @param playersDetails Map of players keyed by ID.
   * @param standingsTimeline The standings timeline for the match.
   * @returns View model sets array.
   */
  private mapSets(
    sets: X01SetEntry[],
    x01: number,
    playersDetails: X01MatchTimelineViewmodel['players'],
    standingsTimeline: X01StandingsTimeline
  ): X01MatchTimelineViewmodel['sets'] {
    return sets.map(setEntry => {
      return {
        setNumber: setEntry.setNumber,
        legs: this.mapLegs(setEntry.set.legs, x01, playersDetails, standingsTimeline.get(setEntry.setNumber))
      };
    });
  }

  /**
   * Maps leg entries within a set to view model legs.
   *
   * @param legs List of leg entries.
   * @param x01 The x01 setting for the match
   * @param playersDetails Map of players keyed by ID.
   * @param setStandings Standings timeline for the current set.
   * @returns Array of leg view models.
   */
  private mapLegs(
    legs: X01LegEntry[],
    x01: number,
    playersDetails: X01MatchTimelineViewmodel['players'],
    setStandings: X01SetStandingsTimeline | undefined
  ): X01MatchTimelineViewmodel['sets'][number]['legs'] {
    return legs.map(legEntry => {
      return {
        legNumber: legEntry.legNumber,
        throwsFirstId: playersDetails.get(legEntry.leg.throwsFirst)?.id ?? '-',
        winnerId: legEntry.leg.winner ?? null,
        winnerCheckout: this.matchService.getCheckoutScore(legEntry.leg),
        tableDatasource: this.MapLegTableDataSource(legEntry.leg, x01, playersDetails, setStandings?.get(legEntry.legNumber))
      };
    });
  }

  /**
   * Builds the data source for a leg's statistics table.
   *
   * @param leg The leg to map.
   * @param x01 The x01 setting for the match
   * @param playersDetails Map of players keyed by ID.
   * @param legStandings Standings snapshot for this leg.
   * @returns {@link X01MatchTimelineLegTableDataSource} for the ui table.
   */
  private MapLegTableDataSource(
    leg: X01Leg,
    x01: number,
    playersDetails: X01MatchTimelineViewmodel['players'],
    legStandings: X01LegStandings | undefined
  ): X01MatchTimelineLegTableDataSource {
    const lastRoundNumber = leg.rounds.at(-1)?.roundNumber ?? 0;
    const tableRowMap: Map<string, X01MatchTimelineLegTableRow> = this.initializeTableRows(playersDetails, legStandings, x01);

    // Build a map with key playerId and for value the player stats in this leg.
    leg.rounds.forEach(roundEntry => {
      Object.entries(roundEntry.round.scores).forEach(([playerId, roundScore]) => {
        const playerRow = tableRowMap.get(playerId);
        if (!playerRow) return;

        this.updatePlayerRowForRound(playerRow, roundScore, leg, roundEntry.roundNumber, lastRoundNumber, x01);
      });
    });

    // Convert the table row map to an array.
    return new X01MatchTimelineLegTableDataSource(Array.from(tableRowMap.values()));
  }

  /**
   * Initializes the table rows for each player.
   *
   * @param playersDetails Map of players keyed by ID.
   * @param legStandings Standings snapshot for the leg (optional).
   * @param x01 The x01 setting for the match
   * @returns A Map of player ID to {@link X01MatchTimelineLegTableRow} with initial values.
   */
  private initializeTableRows(
    playersDetails: X01MatchTimelineViewmodel['players'],
    legStandings: X01LegStandings | undefined,
    x01: number
  ): Map<string, X01MatchTimelineLegTableRow> {
    const tableRowMap: Map<string, X01MatchTimelineLegTableRow> = new Map();

    // For each player create an initial player row.
    playersDetails.forEach(player => {
      tableRowMap.set(player.id, {
        playerId: player.id,
        initials: player.initials,
        setsWon: legStandings?.standings.get(player.id)?.setsWon ?? 0,
        legsWonInSet: legStandings?.standings.get(player.id)?.legsWonInSet ?? 0,
        dartsUsed: 0,
        average: 0,
        remaining: x01,
        checkoutHit: 0,
        doublesMissed: 0
      });
    });

    return tableRowMap;
  }

  /**
   * Updates a single player's row based on the score of a round.
   *
   * @param playerRow The row object to update.
   * @param roundScore The score entry for the player in this round.
   * @param leg The leg the round belongs to.
   * @param currentRoundNumber The number of the current round.
   * @param lastRoundNumber The number of the last round in the leg.
   * @param x01 The starting score for the match
   */
  private updatePlayerRowForRound(
    playerRow: X01MatchTimelineLegTableRow,
    roundScore: X01LegRoundScore,
    leg: X01Leg,
    currentRoundNumber: number,
    lastRoundNumber: number,
    x01: number
  ) {
    const hasPlayerWonLeg = leg.winner === playerRow.playerId;
    const defaultDartsUsed = 3;

    // Update darts used
    playerRow.dartsUsed += (hasPlayerWonLeg && currentRoundNumber === lastRoundNumber && leg.checkoutDartsUsed)
      ? leg.checkoutDartsUsed
      : defaultDartsUsed;

    // Update remaining and average
    playerRow.remaining = roundScore.remaining;
    playerRow.average = ((x01 - roundScore.remaining) / playerRow.dartsUsed) * 3;

    // Track doubles missed and checkout hits
    if (roundScore.doublesMissed) playerRow.doublesMissed += roundScore.doublesMissed;
    if (roundScore.remaining === 0) playerRow.checkoutHit += 1;
  }
}
