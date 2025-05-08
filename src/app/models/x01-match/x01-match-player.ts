import {MatchPlayer} from '../basematch/match-player';
import {X01DartBotSettings} from './x01-dart-bot-settings';
import {X01Statistics} from './x01-statistics';

export interface X01MatchPlayer extends MatchPlayer {
  legsWon: number;
  setsWon: number;
  x01DartBotSettings: X01DartBotSettings;
  statistics: X01Statistics;
}
