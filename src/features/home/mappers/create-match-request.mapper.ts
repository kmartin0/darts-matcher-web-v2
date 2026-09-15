import {X01CreateMatchRequestDto} from '../../../data/dto/x01-create-match-request.dto';
import {PlayerType} from '../../../data/model/base-match/player-type';
import * as CreateMatchFormModel from '../components/create-match-form/create-match-form.model';

/**
 * Maps the create match form model to the API request DTO.
 *
 * @param formModel - Create match form model to map.
 * @returns Create match request DTO.
 */
export function mapToCreateMatchRequest(formModel: CreateMatchFormModel.FormModel): X01CreateMatchRequestDto {
  const selectedTypes = formModel.clearByTwo.selectedTypes;

  return {
    matchSettings: {
      x01: formModel.x01,
      trackDoubles: formModel.trackDoubles,
      bestOf: {
        sets: formModel.bestOf.sets,
        legs: formModel.bestOf.legs,
        bestOfType: formModel.bestOf.bestOfType,
        clearByTwoSetsRule: {
          enabled: selectedTypes.includes(CreateMatchFormModel.ClearByTwoType.SETS),
          limit: formModel.clearByTwo.setLimit,
        },
        clearByTwoLegsRule: {
          enabled: selectedTypes.includes(CreateMatchFormModel.ClearByTwoType.LEGS),
          limit: formModel.clearByTwo.legLimit,
        },
        clearByTwoLegsInFinalSetRule: {
          enabled: selectedTypes.includes(CreateMatchFormModel.ClearByTwoType.LEGS_FINAL_SET),
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
