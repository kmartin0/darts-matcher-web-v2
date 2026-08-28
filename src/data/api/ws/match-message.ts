import {X01Match} from '../../model/x01/x01-match';
import {MatchMessageType} from './match-message-type';
import {WebSocketMessage} from './websocket-message';

export type ProcessMatchMessage = WebSocketMessage<MatchMessageType.PROCESS_MATCH, X01Match>;

export type AddHumanTurnMessage = WebSocketMessage<MatchMessageType.ADD_HUMAN_TURN, X01Match>;

export type AddBotTurnMessage = WebSocketMessage<MatchMessageType.ADD_BOT_TURN, X01Match>;

export type EditTurnMessage = WebSocketMessage<MatchMessageType.EDIT_TURN, X01Match>;

export type DeleteLastTurnMessage = WebSocketMessage<MatchMessageType.DELETE_LAST_TURN, X01Match>;

export type ResetMatchMessage = WebSocketMessage<MatchMessageType.RESET_MATCH, X01Match>;

export type DeleteMatchMessage = WebSocketMessage<MatchMessageType.DELETE_MATCH, string>;

export type MatchMessageUnion =
  | ProcessMatchMessage
  | AddHumanTurnMessage
  | AddBotTurnMessage
  | EditTurnMessage
  | DeleteLastTurnMessage
  | ResetMatchMessage
  | DeleteMatchMessage;

export type MatchUpdateMessage =
  | ProcessMatchMessage
  | AddHumanTurnMessage
  | AddBotTurnMessage
  | EditTurnMessage
  | DeleteLastTurnMessage
  | ResetMatchMessage;
