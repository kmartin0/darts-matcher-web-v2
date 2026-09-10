import {Component, computed, input} from '@angular/core';
import {isCheckoutPossible, X01CheckoutsMap} from '../../../../data/model/x01/checkout/x01-checkout';
import {X01Leg} from '../../../../data/model/x01/leg/x01-leg';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {LegSelection} from '../match-board/leg-selection';
import {MatchPlayerCard} from '../match-player-card/match-player-card';
import {MatchPlayerCardData} from '../match-player-card/match-player-card-data';

@Component({
  selector: 'app-match-player-cards',
  templateUrl: './match-player-cards.html',
  imports: [
    MatchPlayerCard
  ],
  styleUrl: './match-player-cards.scss'
})
export class MatchPlayerCards {
  readonly match = input.required<X01Match>();
  readonly legSelection = input.required<LegSelection>();
  readonly checkouts = input.required<X01CheckoutsMap>();

  protected readonly playerCards = computed<MatchPlayerCardData[]>(() =>
    this.createPlayerCardData(
      this.match(),
      this.legSelection().legEntry.leg,
      this.checkouts()
    )
  );

  /**
   * Creates the player card data for the selected leg.
   *
   * Initializes the player data, applies values derived from the leg rounds,
   * and resolves available checkout suggestions.
   *
   * @param match - Match containing the players and current match state.
   * @param leg - Selected leg to derive player data from.
   * @param checkouts - Checkout suggestions keyed by remaining score.
   * @returns Player card data for the selected leg.
   */
  private createPlayerCardData(
    match: X01Match,
    leg: X01Leg,
    checkouts: X01CheckoutsMap
  ): MatchPlayerCardData[] {
    const playerCardDataMap = this.createInitialPlayerCardDataMap(match, leg.throwsFirst);

    this.updatePlayerCardDataFromLegRounds(leg, playerCardDataMap);
    this.updatePlayerCheckoutSuggestions(checkouts, playerCardDataMap);

    return Array.from(playerCardDataMap.values());
  }

  /**
   * Creates the initial player card data keyed by player ID.
   *
   * Leg-dependent values are initialized to their starting values and updated
   * separately from the selected leg rounds.
   *
   * @param match - Match containing the players and current match state.
   * @param startsLegPlayerId - ID of the player who starts the selected leg.
   * @returns Initial player card data keyed by player ID.
   */
  private createInitialPlayerCardDataMap(
    match: X01Match,
    startsLegPlayerId: string
  ): Map<string, MatchPlayerCardData> {
    const playerCardDataMap = new Map<string, MatchPlayerCardData>();

    match.players.forEach(player => {
      const standing = match.standings[player.playerId];
      const playerStatistics = player.statistics;

      playerCardDataMap.set(player.playerId, {
        playerId: player.playerId,
        name: player.playerName,
        playerResult: player.resultType,
        bestOfType: match.matchSettings.bestOf.bestOfType,
        setsWon: standing?.setsWon ?? 0,
        legsWonInCurrentSet: standing?.legsWonInCurrentSet ?? 0,
        currentThrowerId: match.matchProgress.currentThrower,
        startsLegPlayerId: startsLegPlayerId,
        remaining: match.matchSettings.x01,
        suggestedCheckout: null,
        average: playerStatistics.averageStats.average,
        averageFirstNine: playerStatistics.averageStats.averageFirstNine,
        lastScore: null,
        dartsUsed: 0
      });
    });

    return playerCardDataMap;
  }

  /**
   * Updates remaining score, last score, and darts used from the rounds of a leg.
   *
   * Checkout turns use the actual number of checkout darts instead of assuming
   * that all three darts were used.
   *
   * @param leg - Leg containing the rounds to process.
   * @param playerCardDataMap - Player card data keyed by player ID.
   */
  private updatePlayerCardDataFromLegRounds(leg: X01Leg, playerCardDataMap: Map<string, MatchPlayerCardData>): void {
    const checkoutDartsUsed = leg.checkoutDartsUsed;

    leg.rounds.forEach((roundEntry, index) => {
      const isFinalRound = index === leg.rounds.length - 1;

      Object.entries(roundEntry.round.turns).forEach(([playerId, turn]) => {
        const playerCardData = playerCardDataMap.get(playerId);
        const isCheckoutTurn = isFinalRound && leg.winner === playerId && checkoutDartsUsed !== null;

        if (playerCardData) {
          playerCardData.remaining = turn.remaining;
          playerCardData.lastScore = turn.score;
          playerCardData.dartsUsed += isCheckoutTurn ? checkoutDartsUsed : 3;
        }
      });
    });
  }

  /**
   * Updates each player's checkout suggestion based on their remaining score.
   *
   * @param checkouts - Checkout suggestions keyed by remaining score.
   * @param playerCardDataMap - Player card data keyed by player ID.
   */
  private updatePlayerCheckoutSuggestions(
    checkouts: X01CheckoutsMap,
    playerCardDataMap: Map<string, MatchPlayerCardData>
  ): void {
    playerCardDataMap.forEach(playerCardData => {
      if (isCheckoutPossible(playerCardData.remaining)) {
        playerCardData.suggestedCheckout = checkouts.get(playerCardData.remaining) ?? null;
      }
    });
  }
}
