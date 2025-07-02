import {X01MatchEventType} from './x01-match-event-type';
import {X01Match} from '../../models/x01-match/x01-match';

interface X01MatchEvent<T = any> {
  eventType: X01MatchEventType;
  payload: T;
}

export interface X01ProcessMatchEvent extends X01MatchEvent<X01Match> {
  eventType: X01MatchEventType.PROCESS_MATCH;
}

export interface X01AddHumanTurnEvent extends X01MatchEvent<X01Match> {
  eventType: X01MatchEventType.ADD_HUMAN_TURN;
}

export interface X01AddBotTurnEvent extends X01MatchEvent<X01Match> {
  eventType: X01MatchEventType.ADD_BOT_TURN;
}

export interface X01EditTurnEvent extends X01MatchEvent<X01Match> {
  eventType: X01MatchEventType.EDIT_TURN;
}

export interface X01DeleteLastTurnEvent extends X01MatchEvent<X01Match> {
  eventType: X01MatchEventType.DELETE_LAST_TURN;
}

export interface X01ResetMatchEvent extends X01MatchEvent<X01Match> {
  eventType: X01MatchEventType.RESET_MATCH;
}

export interface X01DeleteMatchEvent extends X01MatchEvent<string> {
  eventType: X01MatchEventType.DELETE_MATCH;
}

export type X01MatchEventUnion =
  | X01ProcessMatchEvent
  | X01AddHumanTurnEvent
  | X01AddBotTurnEvent
  | X01EditTurnEvent
  | X01DeleteLastTurnEvent
  | X01ResetMatchEvent
  | X01DeleteMatchEvent;
