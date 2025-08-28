import {
  isLocalX01SettingsRecord,
  LocalX01SettingsRecord
} from '../../services/local-x01-settings/local-x01-settings-record';
import {X01MatchPlayer} from '../../../models/x01-match/x01-match-player';

export interface LocalX01SettingsDialogData {
  players: X01MatchPlayer[];
  localX01SettingsRecord: LocalX01SettingsRecord;
}

export type LocalX01SettingsDialogResult = LocalX01SettingsRecord;

export function isLocalX01SettingsDialogData(obj: any): obj is LocalX01SettingsDialogData {
  return obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.players) &&
    isLocalX01SettingsRecord(obj.localX01SettingsRecord);
}
