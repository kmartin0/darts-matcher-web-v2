import {Injectable} from '@angular/core';
import {MatchFormResult} from '../../modules/home/components/match-form/match-form';
import {CreateMatchRequestDto} from '../dto/create-match-request.dto';
import {PlayerType} from '../../models/basematch/player-type';

@Injectable({providedIn: 'root'})
export class DtoMapperService {
  fromMatchFormResult(result: MatchFormResult): CreateMatchRequestDto {
    return {
      matchSettings: {
        bestOf: {
          legs: result.bestOf.legs,
          sets: result.bestOf.sets
        },
        trackDoubles: result.trackDoubles,
        x01: result.x01
      },
      players: result.players.map(player => ({
        playerName: player.name,
        playerType: player.type,
        x01DartBotSettings: player.type === PlayerType.DART_BOT && player.avg !== null
          ? { threeDartAverage: player.avg }
          : undefined
      }))
    };
  }
}
