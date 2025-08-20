import {DataSource} from '@angular/cdk/table';
import {Observable, ReplaySubject} from 'rxjs';
import {CollectionViewer} from '@angular/cdk/collections';

export interface X01MatchTimelineLegTableRow {
  playerId: string;
  initials: string;
  setsWon: number;
  legsWonInSet: number;
  dartsUsed: number;
  average: number;
  remaining: number;
  checkoutHit: number;
  doublesMissed: number;
}

/**
 * Data source for the X01 Timeline leg table, managing and emitting rows of match data.
 * Extends Angular CDK DataSource to provide data stream for the table.
 */
export class X01MatchTimelineLegTableDataSource extends DataSource<X01MatchTimelineLegTableRow> {
  private _dataStream = new ReplaySubject<X01MatchTimelineLegTableRow[]>();

  /**
   * Creates an instance of X01MatchLegTableDataSource with initial data.
   *
   * @param initialData - Initial array of rows to populate the data source.
   */
  constructor(initialData: X01MatchTimelineLegTableRow[]) {
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
  override connect(collectionViewer: CollectionViewer): Observable<readonly X01MatchTimelineLegTableRow[]> {
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
   * @param data - Array of X01MatchTimelineLegTableRow objects to emit.
   */
  setData(data: X01MatchTimelineLegTableRow[]) {
    this._dataStream.next(data);
  }

  getData() {
    return this._dataStream;
  }
}
