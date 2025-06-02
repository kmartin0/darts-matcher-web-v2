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

/**
 * Data source for the X01 leg table, managing and emitting rows of match data.
 * Extends Angular CDK DataSource to provide data stream for the table.
 */
export class X01LegTableDataSource extends DataSource<X01LegTableRow> {
  private _dataStream = new ReplaySubject<X01LegTableRow[]>();

  /**
   * Creates an instance of X01LegTableDataSource with initial data.
   *
   * @param initialData - Initial array of rows to populate the data source.
   */
  constructor(initialData: X01LegTableRow[]) {
    super();
    this.setData(initialData);
  }

  /**
   * Connects the data source to the collection viewer (table).
   * Returns an observable stream of data that the table will render.
   *
   * @param collectionViewer - The component that views the collection (usually the table).
   * @returns Observable that emits arrays of table rows.
   */
  override connect(collectionViewer: CollectionViewer): Observable<readonly X01LegTableRow[]> {
    return this._dataStream;
  }

  /**
   * Disconnects the data source from the collection viewer.
   *
   * @param collectionViewer - The component that views the collection.
   */
  override disconnect(collectionViewer: CollectionViewer): void {
  }

  /**
   * Updates the data source with new table row data.
   * Emits the new data to all subscribers.
   *
   * @param data - Array of X01LegTableRow objects to emit.
   */
  setData(data: X01LegTableRow[]) {
    this._dataStream.next(data);
  }
}
