export interface WebSocketMessage<M, P> {
  messageType: M;
  payload: P;
}
