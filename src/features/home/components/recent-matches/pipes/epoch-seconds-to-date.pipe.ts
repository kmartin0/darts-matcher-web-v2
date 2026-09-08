import {epochSecondsToDate} from '../../../../../shared/utils/number.util';
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'epochSecondsToDate'
})
export class EpochSecondsToDatePipe implements PipeTransform {

  /**
   * Converts a Unix timestamp in seconds to a Date.
   *
   * @param epochSeconds - Unix timestamp in seconds.
   * @returns Converted date, or null when the value is invalid.
   */
  transform(epochSeconds: number | null): Date | null {
    return epochSecondsToDate(epochSeconds);
  }
}
