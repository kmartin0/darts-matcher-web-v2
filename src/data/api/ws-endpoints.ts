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
      ): string => `${type}/matches/x01/${matchId}`,
    },

    PUBLISH: {
      ADD_TURN: (matchId: string): string => `${WsDestinationType.PUBLISH}/matches/x01/${matchId}/turns/add`,
      EDIT_TURN: (matchId: string): string => `${WsDestinationType.PUBLISH}/matches/x01/${matchId}/turns/edit`,
      DELETE_LAST_TURN: (matchId: string): string => `${WsDestinationType.PUBLISH}/matches/x01/${matchId}/turns/delete-last`,
      DELETE_MATCH: (matchId: string): string => `${WsDestinationType.PUBLISH}/matches/x01/${matchId}/delete`,
      RESET_MATCH: (matchId: string): string => `${WsDestinationType.PUBLISH}/matches/x01/${matchId}/reset`,
      REPROCESS_MATCH: (matchId: string): string => `${WsDestinationType.PUBLISH}/matches/x01/${matchId}/reprocess`,
      REMATCH: (matchId: string): string => `${WsDestinationType.PUBLISH}/matches/x01/${matchId}/rematch`
    },
  },

  RESPONSE_QUEUE: `${WsDestinationType.USER}/queue/responses`,
  ERROR_QUEUE: `${WsDestinationType.USER}/queue/errors`,
};
