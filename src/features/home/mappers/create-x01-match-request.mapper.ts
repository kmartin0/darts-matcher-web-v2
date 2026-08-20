import * as CreateX01MatchFormModel from '../components/create-x01-match-form/create-x01-match-form.model';
import {CreateX01MatchRequestDto} from '../../../data/dto/create-x01-match-request.dto';
import {PlayerType} from '../../../data/model/match/player-type';

/**
 * Maps the create X01 match form model to the API request DTO.
 *
 * @param form - Create X01 match form model to map.
 * @returns Create X01 match request DTO.
 */
export function mapToCreateX01MatchRequest(form: CreateX01MatchFormModel.FormModel): CreateX01MatchRequestDto {
  return {
    matchSettings: {
      x01: form.x01,
      trackDoubles: form.trackDoubles,
      bestOf: {
        sets: form.bestOf.sets,
        legs: form.bestOf.legs,
        bestOfType: form.bestOf.bestOfType,
        clearByTwoSetsRule: {
          enabled: form.clearByTwo.selectedTypes.includes(CreateX01MatchFormModel.ClearByTwoType.SETS),
          limit: form.clearByTwo.setLimit,
        },
        clearByTwoLegsRule: {
          enabled: form.clearByTwo.selectedTypes.includes(CreateX01MatchFormModel.ClearByTwoType.LEGS),
          limit: form.clearByTwo.legLimit,
        },
        clearByTwoLegsInFinalSetRule: {
          enabled: form.clearByTwo.selectedTypes.includes(
            CreateX01MatchFormModel.ClearByTwoType.LEGS_FINAL_SET,
          ),
          limit: form.clearByTwo.finalSetLegLimit,
        },
      },
    },
    players: form.players.map(player => ({
      playerName: player.playerName,
      playerType: player.playerType,
      ...(player.playerType === PlayerType.DART_BOT && player.threeDartAverage !== null && {
        x01DartBotSettings: {
          threeDartAverage: player.threeDartAverage,
        },
      }),
    })),
  };
}
