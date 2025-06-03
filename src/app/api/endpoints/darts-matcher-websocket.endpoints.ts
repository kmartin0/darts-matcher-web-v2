import {environment} from '../../../environments/environment';

export const DARTS_MATCHER_WEBSOCKET_BASE_URL = environment.dartsMatcherWebsocketUrl;

export enum WsDestType {
  BROADCAST = '/topic',
  SINGLE_RESPONSE = '/app',
  USER = '/user',
  PUBLISH = '/app'
}

export const DARTS_MATCHER_WS_DESTINATIONS = {
  SUBSCRIBE: {
    X01_GET_MATCH: (matchId: string, type: (WsDestType.BROADCAST | WsDestType.SINGLE_RESPONSE)) => `${type}/matches/x01/${matchId}`,
    ERROR_QUEUE: `${WsDestType.USER}/queue/errors`
  },
  PUBLISH: {
    X01_ADD_TURN: `${WsDestType.PUBLISH}/matches/x01/turn:add`,
    X01_TURN_DART_BOT: `${WsDestType.PUBLISH}/matches/x01/turn:dart-bot`,
    X01_EDIT_TURN: `${WsDestType.PUBLISH}/matches/x01/turn:edit`,
    X01_DELETE_TURN: `${WsDestType.PUBLISH}/matches/x01/turn:delete`,
    X01_DELETE_LEG: `${WsDestType.PUBLISH}/matches/x01/leg:delete`,
    X01_DELETE_SET: `${WsDestType.PUBLISH}/matches/x01/set:delete`,
  }
};
