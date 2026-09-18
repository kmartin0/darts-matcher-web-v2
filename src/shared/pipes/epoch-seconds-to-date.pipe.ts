import {Pipe, PipeTransform} from '@angular/core';
import {epochSecondsToDate} from '../utils/number.util';

/**
 * Converts Unix epoch seconds into a Date for template formatting.
 */
@Pipe({
  name: 'epochSecondsToDate'
})
export class EpochSecondsToDatePipe implements PipeTransform {

  /**
   * Converts a Unix timestamp in seconds to a Date.
   *
   * @param epochSeconds - Unix timestamp in seconds.
   * @returns Converted date, or null when the timestamp is unavailable or invalid.
   */
  transform(epochSeconds: number | null): Date | null {
    return epochSecondsToDate(epochSeconds);
  }
}
