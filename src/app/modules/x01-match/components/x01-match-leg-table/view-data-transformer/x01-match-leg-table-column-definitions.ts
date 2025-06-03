import {PlayerMap} from '../../../../../types/player-map';

export interface X01MatchLegTableColumnDefinitions {
  default: {
    id: string,
    labels: {
      round: string,
      darts: string
    }
  },
  players: PlayerMap<{
    score: string,
    remaining: string
  }>
}
