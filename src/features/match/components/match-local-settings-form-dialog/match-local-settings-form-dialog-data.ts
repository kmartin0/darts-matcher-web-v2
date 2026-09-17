import {LocalMatchSettings} from '../../../../data/model/settings/local-match-settings';
import {X01MatchPlayer} from '../../../../data/model/x01/match/x01-match-player';

export interface MatchLocalSettingsFormDialogData {
  players: readonly X01MatchPlayer[];
  localMatchSettings: LocalMatchSettings;
}
