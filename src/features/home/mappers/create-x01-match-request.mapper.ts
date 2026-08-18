import {
  CreateX01MatchFormModel,
  X01ClearByTwoType
} from '../components/create-x01-match-form/create-x01-match-form.model';
import {CreateX01MatchRequestDto} from '../../../data/dto/create-x01-match-request.dto';
import {PlayerType} from '../../../data/model/match/player-type';

/**
 * Maps the create X01 match form model to the API request DTO.
 *
 * @param form - Create X01 match form model to map.
 * @returns Create X01 match request DTO.
 */
export function mapToCreateX01MatchRequest(form: CreateX01MatchFormModel): CreateX01MatchRequestDto {
  return {
    matchSettings: {
      x01: form.x01,
      trackDoubles: form.trackDoubles,
      bestOf: {
        sets: form.bestOf.sets,
        legs: form.bestOf.legs,
        bestOfType: form.bestOf.bestOfType,
        clearByTwoSetsRule: {
          enabled: form.clearByTwo.selectedTypes.includes(X01ClearByTwoType.SETS),
          limit: form.clearByTwo.setLimit,
        },
        clearByTwoLegsRule: {
          enabled: form.clearByTwo.selectedTypes.includes(X01ClearByTwoType.LEGS),
          limit: form.clearByTwo.legLimit,
        },
        clearByTwoLegsInFinalSetRule: {
          enabled: form.clearByTwo.selectedTypes.includes(
            X01ClearByTwoType.LEGS_FINAL_SET,
          ),
          limit: form.clearByTwo.finalSetLegLimit,
        },
      },
    },
    players: form.players.map(player => ({
      playerName: player.playerName,
      playerType: player.playerType,
      x01DartBotSettings:
        player.playerType === PlayerType.DART_BOT &&
        player.threeDartAverage !== null
          ? {threeDartAverage: player.threeDartAverage}
          : undefined,
    })),
  };
}
