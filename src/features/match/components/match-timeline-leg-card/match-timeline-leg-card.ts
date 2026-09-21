import {Component, computed, input} from '@angular/core';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {getDartsUsedForPlayerInRound, getLastTurnForPlayerInLeg, X01Leg} from '../../../../data/model/x01/leg/x01-leg';
import {X01BestOfType} from '../../../../data/model/x01/rules/x01-best-of-type';
import {calculateX01Average} from '../../../../data/model/x01/statistics/x01-average-statistics';
import {MatchTimelineLegCardData, MatchTimelineLegCardPlayerData} from './match-timeline-leg-card-data';

interface MatchTimelineLegCardRow {
  playerId: string;
  initials: string;

  startsLeg: boolean;
  winsLeg: boolean;

  setsWon: number;
  legsWonInSet: number;

  dartsUsed: number;
  average: number | null;
  remaining: number;
  doublesMissed: number;
}

interface PlayerLegValues {
  dartsUsed: number;
  average: number | null;
  remaining: number;
  doublesMissed: number;
}

@Component({
  selector: 'app-match-timeline-leg-card',
  imports: [
    MatCard,
    MatCardContent,
    MatTable,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatIcon
  ],
  templateUrl: './match-timeline-leg-card.html',
  styleUrl: './match-timeline-leg-card.scss'
})
export class MatchTimelineLegCard {
  readonly data = input.required<MatchTimelineLegCardData>();

  protected readonly X01BestOfType = X01BestOfType;

  protected readonly displayedColumns = computed<string[]>(() =>
    this.createDisplayedColumns(this.data().trackDoubles)
  );

  protected readonly starterInitials = computed<string | null>(() =>
    this.getStarterInitials(this.data())
  );

  protected readonly winnerInitials = computed<string | null>(() =>
    this.getWinnerInitials(this.data())
  );

  protected readonly checkoutScore = computed<number | null>(() =>
    this.getCheckoutScore(this.data().leg)
  );

  protected readonly rows = computed<MatchTimelineLegCardRow[]>(() =>
    this.createRows(this.data())
  );

  /**
   * Tracks table rows by player ID.
   *
   * @param _index - Row index, which is not used.
   * @param row - Player row being tracked.
   * @returns Player ID identifying the row.
   */
  protected trackByPlayerId(_index: number, row: MatchTimelineLegCardRow): string {
    return row.playerId;
  }

  /**
   * Creates the table columns enabled by the match settings.
   *
   * @param trackDoubles - Whether to include the checkout column.
   * @returns Ordered table column IDs.
   */
  private createDisplayedColumns(trackDoubles: boolean): string[] {
    return [
      'player',
      'score',
      'darts',
      'average',
      'remaining',
      ...(trackDoubles ? ['checkout'] : [])
    ];
  }

  /**
   * Gets the initials of the player who starts the leg.
   *
   * @param data - Timeline leg-card data.
   * @returns Starter initials, or null when the player cannot be found.
   */
  private getStarterInitials(data: MatchTimelineLegCardData): string | null {
    return data.players.find(
      player => player.playerId === data.leg.throwsFirst
    )?.initials ?? null;
  }

  /**
   * Gets the initials of the player who wins the leg.
   *
   * @param data - Timeline leg-card data.
   * @returns Winner initials, or null while there is no winner.
   */
  private getWinnerInitials(data: MatchTimelineLegCardData): string | null {
    return data.players.find(
      player => player.playerId === data.leg.winner
    )?.initials ?? null;
  }

  /**
   * Gets the checkout score of the leg winner.
   *
   * @param leg - Leg containing the winner's turns.
   * @returns Checkout score, or null while there is no winner.
   */
  private getCheckoutScore(leg: X01Leg): number | null {
    if (leg.winner === null) {
      return null;
    }

    return getLastTurnForPlayerInLeg(leg, leg.winner)?.score ?? null;
  }

  /**
   * Creates player rows in the supplied player order.
   *
   * @param data - Timeline leg-card data.
   * @returns Table rows for the displayed leg.
   */
  private createRows(data: MatchTimelineLegCardData): MatchTimelineLegCardRow[] {
    return data.players.map(player => this.createRow(data, player));
  }

  /**
   * Creates the table row for a player.
   *
   * @param data - Timeline leg-card data.
   * @param player - Player and standing through the displayed leg.
   * @returns Table row for the player.
   */
  private createRow(data: MatchTimelineLegCardData, player: MatchTimelineLegCardPlayerData): MatchTimelineLegCardRow {
    const leg = data.leg;
    const legValues = this.resolvePlayerLegValues(leg, player.playerId, data.x01);

    return {
      playerId: player.playerId,
      initials: player.initials,

      startsLeg: leg.throwsFirst === player.playerId,
      winsLeg: leg.winner === player.playerId,

      setsWon: player.standing.setsWon,
      legsWonInSet: player.standing.legsWonInCurrentSet,

      dartsUsed: legValues.dartsUsed,
      average: legValues.average,
      remaining: legValues.remaining,
      doublesMissed: legValues.doublesMissed
    };
  }

  /**
   * Resolves a player's statistics within the displayed leg.
   *
   * The checkout turn uses `checkoutDartsUsed` number of darts.
   * A player without a turn has x01 for remaining and has no average.
   *
   * @param leg - Leg containing the player's turns.
   * @param playerId - ID of the player to resolve.
   * @param x01 - Starting score of the leg.
   * @returns Player values calculated from the leg.
   */
  private resolvePlayerLegValues(leg: X01Leg, playerId: string, x01: number): PlayerLegValues {
    let pointsThrown = 0;
    let dartsUsed = 0;
    let doublesMissed = 0;

    // Accumulate the player's leg values from each turn.
    for (const roundEntry of leg.rounds) {
      const turn = roundEntry.round.turns[playerId];

      if (turn === undefined) {
        continue;
      }

      pointsThrown += turn.score;
      dartsUsed += getDartsUsedForPlayerInRound(leg, roundEntry, playerId);
      doublesMissed += turn.doublesMissed ?? 0;
    }

    const lastTurn = getLastTurnForPlayerInLeg(leg, playerId);

    return {
      dartsUsed: dartsUsed,
      average: calculateX01Average(pointsThrown, dartsUsed),
      remaining: lastTurn?.remaining ?? x01,
      doublesMissed: doublesMissed
    };
  }
}
