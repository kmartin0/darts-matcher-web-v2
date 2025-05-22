import {CollectionViewer} from '@angular/cdk/collections';
import {DataSource} from '@angular/cdk/table';
import {Observable, ReplaySubject} from 'rxjs';
import {PlayerMap} from '../../../../types/player-map';

export interface X01RoundTableRow {
  round: number;
  dartsThrown: number;
  players: PlayerMap<X01PlayerRoundInfo>
}

export interface X01PlayerRoundInfo {
  score: number;
  remaining: number;
}

export class X01MatchTableDataSource extends DataSource<X01RoundTableRow> {
  private _dataStream = new ReplaySubject<X01RoundTableRow[]>();

  constructor(initialData: X01RoundTableRow[]) {
    super();
    this.setData(initialData);
  }

  override connect(collectionViewer: CollectionViewer): Observable<readonly X01RoundTableRow[]> {
    return this._dataStream;
  }

  override disconnect(collectionViewer: CollectionViewer): void {
  }

  setData(data: X01RoundTableRow[]) {
    this._dataStream.next(data);
  }
}
