export interface WebSocketMessage<TMessageType, TPayload> {
  messageType: TMessageType;
  payload: TPayload;
}
