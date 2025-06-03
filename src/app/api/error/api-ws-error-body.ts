import {ApiErrorBody, isApiErrorBody} from './api-error-body';

export interface ApiWsErrorBody extends ApiErrorBody {
  destination: string;
}

export function isApiWsErrorBody(obj: any): obj is ApiWsErrorBody {
  return (
    isApiErrorBody(obj) &&
    'destination' in obj &&
    typeof obj.destination === 'string'
  );
}
