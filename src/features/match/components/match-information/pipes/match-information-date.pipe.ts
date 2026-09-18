import {Pipe, PipeTransform} from '@angular/core';
import {epochSecondsToDate} from '../../../../../shared/utils/number.util';

const MATCH_INFORMATION_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short',
  timeZone: 'UTC',
  hour12: false
});

/**
 * Formats a match timestamp for Match Information.
 */
@Pipe({name: 'matchInformationDate'})
export class MatchInformationDatePipe implements PipeTransform {
  /**
   * Formats Unix epoch seconds as a UTC date and time.
   *
   * @param epochSeconds - Unix timestamp in seconds.
   * @returns Formatted timestamp, or a dash when unavailable or invalid.
   */
  transform(epochSeconds: number | null): string {
    const date = epochSecondsToDate(epochSeconds);

    return date === null
      ? '-'
      : MATCH_INFORMATION_DATE_FORMATTER.format(date);
  }
}
