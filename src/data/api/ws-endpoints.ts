import {environment} from '../../environments/environment';

const DARTS_MATCHER_WEB_SOCKET_BASE_URL = environment.dartsMatcherWebSocketUrl;

export enum WsDestinationType {
  BROADCAST = '/topic',
  SINGLE_RESPONSE = '/app',
  USER = '/user',
  PUBLISH = '/app',
}

export const DARTS_MATCHER_WS_DESTINATIONS = {
  X01: {
    SUBSCRIBE: {
      MATCH: (
        matchId: string,
        type: WsDestinationType.BROADCAST | WsDestinationType.SINGLE_RESPONSE
      ): string => `${type}/x01/matches/${matchId}`,
    },
    PUBLISH: {
      ADD_TURN: (matchId: string): string => `${WsDestinationType.PUBLISH}/x01/matches/${matchId}/turn/add`,
      EDIT_TURN: (matchId: string): string => `${WsDestinationType.PUBLISH}/x01/matches/${matchId}/turn/edit`,
      DELETE_LAST_TURN: (matchId: string): string => `${WsDestinationType.PUBLISH}/x01/matches/${matchId}/turn/delete-last`,
      DELETE_MATCH: (matchId: string): string => `${WsDestinationType.PUBLISH}/x01/matches/${matchId}/delete`,
      RESET_MATCH: (matchId: string): string => `${WsDestinationType.PUBLISH}/x01/matches/${matchId}/reset`,
      REPROCESS_MATCH: (matchId: string): string => `${WsDestinationType.PUBLISH}/x01/matches/${matchId}/reprocess`,
    },
  },
  ERROR_QUEUE: `${WsDestinationType.USER}/queue/errors`,
};
