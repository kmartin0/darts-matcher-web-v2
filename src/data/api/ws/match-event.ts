import {X01Match} from '../../model/x01/x01-match';
import {MatchEventType} from './match-event-type';

interface MatchEvent<T> {
  eventType: MatchEventType;
  payload: T;
}

export interface ProcessMatchEvent extends MatchEvent<X01Match> {
  eventType: MatchEventType.PROCESS_MATCH;
}

export interface AddHumanTurnEvent extends MatchEvent<X01Match> {
  eventType: MatchEventType.ADD_HUMAN_TURN;
}

export interface AddBotTurnEvent extends MatchEvent<X01Match> {
  eventType: MatchEventType.ADD_BOT_TURN;
}

export interface EditTurnEvent extends MatchEvent<X01Match> {
  eventType: MatchEventType.EDIT_TURN;
}

export interface DeleteLastTurnEvent extends MatchEvent<X01Match> {
  eventType: MatchEventType.DELETE_LAST_TURN;
}

export interface ResetMatchEvent extends MatchEvent<X01Match> {
  eventType: MatchEventType.RESET_MATCH;
}

export interface DeleteMatchEvent extends MatchEvent<string> {
  eventType: MatchEventType.DELETE_MATCH;
}

export type MatchEventUnion =
  | ProcessMatchEvent
  | AddHumanTurnEvent
  | AddBotTurnEvent
  | EditTurnEvent
  | DeleteLastTurnEvent
  | ResetMatchEvent
  | DeleteMatchEvent;
