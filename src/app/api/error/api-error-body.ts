import {TargetErrors} from './target-errors';
import {ApiErrorEnum} from './api-error-enum';

export interface ApiErrorBody {
  error: ApiErrorEnum | string;
  description?: string;
  error_description?: string;
  code: number;
  details?: TargetErrors; // array of details for targets containing the target and the error.
}

export function isApiErrorBody(obj: any): obj is ApiErrorBody {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'error' in obj &&
    'code' in obj &&
    typeof obj.code === 'number'
  );
}
