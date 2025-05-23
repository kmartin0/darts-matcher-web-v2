import {CollectionViewer} from '@angular/cdk/collections';
import {DataSource} from '@angular/cdk/table';
import {Observable, ReplaySubject} from 'rxjs';
import {PlayerMap} from '../../../../types/player-map';

export interface X01LegTableRow {
  round: number;
  dartsThrown: number;
  players: PlayerMap<X01LegTableRowPlayerData>
}

export interface X01LegTableRowPlayerData {
  score: number;
  remaining: number;
}

export class X01LegTableDataSource extends DataSource<X01LegTableRow> {
  private _dataStream = new ReplaySubject<X01LegTableRow[]>();

  constructor(initialData: X01LegTableRow[]) {
    super();
    this.setData(initialData);
  }

  override connect(collectionViewer: CollectionViewer): Observable<readonly X01LegTableRow[]> {
    return this._dataStream;
  }

  override disconnect(collectionViewer: CollectionViewer): void {
  }

  setData(data: X01LegTableRow[]) {
    this._dataStream.next(data);
  }
}
