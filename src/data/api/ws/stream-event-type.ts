export type StreamEventType<T> =
  | { type: 'data'; data: T }
  | { type: 'connection'; state: StreamConnectionState };

export type StreamConnectionState = 'connecting' | 'connected' | 'disconnected';
