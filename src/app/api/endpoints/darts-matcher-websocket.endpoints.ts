import {environment} from '../../../environments/environment';

export const DARTS_MATCHER_WEBSOCKET_BASE_URL = environment.dartsMatcherWebsocketUrl;

export const WebsocketDestinationPrefix = {
  BROADCAST: '/topic',
  SINGLE_RESPONSE: '/app',
  SEND: '/app',
  USER: '/user'
};

export const DARTS_MATCHER_WEBSOCKET_DESTINATIONS = {
  SUBSCRIBE: {
    BROADCAST: {
      X01_GET_MATCH: (matchId: string) => `${WebsocketDestinationPrefix.BROADCAST}/matches/x01/${matchId}`,
      ERROR_QUEUE: `${WebsocketDestinationPrefix.USER}/queue/errors`
    },
    SINGLE_RESPONSE: {
      X01_GET_MATCH: (matchId: string) => `${WebsocketDestinationPrefix.SINGLE_RESPONSE}/matches/x01/${matchId}`,
    }
  },
  SEND: {
    X01_ADD_TURN: `${WebsocketDestinationPrefix.SEND}/matches/x01/turn:add`,
    X01_TURN_DART_BOT: `${WebsocketDestinationPrefix.SEND}/matches/x01/turn:dart-bot`,
    X01_EDIT_TURN: `${WebsocketDestinationPrefix.SEND}/matches/x01/turn:edit`,
    X01_DELETE_TURN: `${WebsocketDestinationPrefix.SEND}/matches/x01/turn:delete`,
    X01_DELETE_LEG: `${WebsocketDestinationPrefix.SEND}/matches/x01/leg:delete`,
    X01_DELETE_SET: `${WebsocketDestinationPrefix.SEND}/matches/x01/set:delete`,
  }
};
