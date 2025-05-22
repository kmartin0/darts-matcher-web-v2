import {ColumnMetadata} from '../../../../../models/common/column-meta-data';

export interface X01MatchTableColumnDefinitions {
  round: ColumnMetadata,
  darts: ColumnMetadata,
  playerColumns: {
    playerId: string
    score: ColumnMetadata,
    remaining: ColumnMetadata,
  }[],
}
