import {PlayerType} from '../../models/basematch/player-type';

export interface CreateMatchRequestDto {
  matchSettings: {
    x01: number;
    trackDoubles: boolean;
    bestOf: {
      sets: number;
      legs: number;
    }
  },
  players: {
    playerName: string;
    playerType: PlayerType;
    x01DartBotSettings?: {
      threeDartAverage: number;
    }
  } []
}
