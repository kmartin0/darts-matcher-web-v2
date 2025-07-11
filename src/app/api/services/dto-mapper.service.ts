import {Injectable} from '@angular/core';
import {MatchFormResult} from '../../modules/home/components/match-form/match-form';
import {CreateMatchRequestDto} from '../dto/create-match-request.dto';
import {PlayerType} from '../../models/basematch/player-type';
import {ClearByTwoType} from '../../models/common/clear-by-two-type';

@Injectable({providedIn: 'root'})
export class DtoMapperService {
  fromMatchFormResult(result: MatchFormResult): CreateMatchRequestDto {
    return {
      matchSettings: {
        bestOf: {
          sets: result.bestOf.sets ?? 1,
          legs: result.bestOf.legs,
          clearByTwoSetsRule: {
            enabled: result.clearByTwo.selectedTypes.includes(ClearByTwoType.SETS),
            limit: result.clearByTwo.extraSetLimit
          },
          clearByTwoLegsRule: {
            enabled: result.clearByTwo.selectedTypes.includes(ClearByTwoType.LEGS),
            limit: result.clearByTwo.extraLegLimit
          },
          clearByTwoLegsInFinalSetRule: {
            enabled: result.clearByTwo.selectedTypes.includes(ClearByTwoType.LEGS_FINAL_SET),
            limit: result.clearByTwo.extraLegLimitFinalSet
          },
        },
        trackDoubles: result.trackDoubles,
        x01: result.x01
      },
      players: result.players.map(player => ({
        playerName: player.name,
        playerType: player.type,
        x01DartBotSettings: player.type === PlayerType.DART_BOT && player.avg !== null
          ? {threeDartAverage: player.avg}
          : undefined
      }))
    };
  }
}
