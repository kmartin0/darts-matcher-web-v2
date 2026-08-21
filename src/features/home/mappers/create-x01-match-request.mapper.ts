import * as CreateX01MatchFormModel from '../components/create-x01-match-form/create-x01-match-form.model';
import {CreateX01MatchRequestDto} from '../../../data/dto/create-x01-match-request.dto';
import {PlayerType} from '../../../data/model/match/player-type';

/**
 * Maps the create X01 match formModel model to the API request DTO.
 *
 * @param formModel - Create X01 match formModel model to map.
 * @returns Create X01 match request DTO.
 */
export function mapToCreateX01MatchRequest(formModel: CreateX01MatchFormModel.FormModel): CreateX01MatchRequestDto {
  return {
    matchSettings: {
      x01: formModel.x01,
      trackDoubles: formModel.trackDoubles,
      bestOf: {
        sets: formModel.bestOf.sets,
        legs: formModel.bestOf.legs,
        bestOfType: formModel.bestOf.bestOfType,
        clearByTwoSetsRule: {
          enabled: formModel.clearByTwo.selectedTypes.includes(CreateX01MatchFormModel.ClearByTwoType.SETS),
          limit: formModel.clearByTwo.setLimit,
        },
        clearByTwoLegsRule: {
          enabled: formModel.clearByTwo.selectedTypes.includes(CreateX01MatchFormModel.ClearByTwoType.LEGS),
          limit: formModel.clearByTwo.legLimit,
        },
        clearByTwoLegsInFinalSetRule: {
          enabled: formModel.clearByTwo.selectedTypes.includes(
            CreateX01MatchFormModel.ClearByTwoType.LEGS_FINAL_SET,
          ),
          limit: formModel.clearByTwo.finalSetLegLimit,
        },
      },
    },
    players: formModel.players.map(player => ({
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
