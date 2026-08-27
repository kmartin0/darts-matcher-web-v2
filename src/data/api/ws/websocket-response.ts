export interface WebSocketResponse<T> {
  body: T;
  publishId?: string;
}
