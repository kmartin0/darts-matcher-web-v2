import {environment} from '../../../environments/environment';

export const DARTS_MATCHER_WEB_SOCKET_BASE_URL = environment.dartsMatcherWebSocketUrl;

export enum WsDestType {
  BROADCAST = '/topic',
  SINGLE_RESPONSE = '/app',
  USER = '/user',
  PUBLISH = '/app'
}

export const DARTS_MATCHER_WS_DESTINATIONS = {
  SUBSCRIBE: {
    X01_GET_MATCH: (matchId: string, type: (WsDestType.BROADCAST | WsDestType.SINGLE_RESPONSE)) => `${type}/x01/matches/${matchId}`,
    ERROR_QUEUE: `${WsDestType.USER}/queue/errors`
  },
  PUBLISH: {
    X01_ADD_TURN: (matchId: string) => `${WsDestType.PUBLISH}/x01/matches/${matchId}/turn/add`,
    X01_EDIT_TURN: (matchId: string) => `${WsDestType.PUBLISH}/x01/matches/${matchId}/turn/edit`,
    X01_DELETE_LAST_TURN: (matchId: string) => `${WsDestType.PUBLISH}/x01/matches/${matchId}/turn/delete-last`,
    X01_DELETE_MATCH: (matchId: string) => `${WsDestType.PUBLISH}/x01/matches/${matchId}/delete`,
    X01_RESET_MATCH: (matchId: string) => `${WsDestType.PUBLISH}/x01/matches/${matchId}/reset`,
    X01_REPROCESS_MATCH: (matchId: string) => `${WsDestType.PUBLISH}/x01/matches/${matchId}/reprocess`
  }
};
