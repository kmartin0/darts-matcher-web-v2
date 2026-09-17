import {LocalMatchSettings} from '../../../../data/model/settings/local-match-settings';
import {X01MatchPlayer} from '../../../../data/model/x01/match/x01-match-player';

export interface PlayerSelection {
  playerId: string;
  selected: boolean;
}

export interface FormModel {
  playerSelections: PlayerSelection[];
}

/**
 * Creates the initial local match settings form model.
 *
 * @param players - Match players available for selection.
 * @param localMatchSettings - Current local settings used to initialize the selections.
 * @returns Initial local match settings form model.
 */
export function createInitialFormModel(players: readonly X01MatchPlayer[], localMatchSettings: LocalMatchSettings): FormModel {
  const selectedPlayerIds = new Set(localMatchSettings.scoreForPlayerIds);

  return {
    playerSelections: players.map(player => ({
      playerId: player.playerId,
      selected: selectedPlayerIds.has(player.playerId)
    }))
  };
}
