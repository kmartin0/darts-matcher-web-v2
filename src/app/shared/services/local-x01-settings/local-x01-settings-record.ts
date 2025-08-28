export interface LocalX01SettingsRecord {
  matchId: string;
  scoreFor?: string[]; // Array of player id's
}

export function isLocalX01SettingsRecord(obj: any): obj is LocalX01SettingsRecord {
  return obj != null &&
    typeof obj === 'object' &&
    typeof obj.matchId === 'string' &&
    (obj.scoreFor === undefined || Array.isArray(obj.scoreFor));
}
