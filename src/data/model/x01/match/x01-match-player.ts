import {MatchPlayer} from '../../base-match/match-player';
import {X01DartBotSettings} from '../dart-bot/x01-dart-bot-settings';
import {X01Statistics} from '../statistics/x01-statistics';

export interface X01MatchPlayer extends MatchPlayer {
  x01DartBotSettings: X01DartBotSettings | null;
  statistics: X01Statistics;
}
