import {Pipe, PipeTransform} from '@angular/core';
import {epochSecondsToDate} from '../../../../../shared/utils/number.util';

const MATCH_DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
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
 * Formats a match date and time displayed in Match Information.
 */
@Pipe({
  name: 'matchDateTime'
})
export class MatchDateTimePipe implements PipeTransform {

  /**
   * Formats Unix epoch seconds as an English-language UTC date and time.
   *
   * Example: `Fri, 09/18/2026, 14:30 UTC`.
   * Returns `-` when the timestamp is unavailable or invalid.
   *
   * @param epochSeconds - Unix timestamp in seconds.
   * @returns Formatted match date and time, or a dash when unavailable or invalid.
   */
  transform(epochSeconds: number | null): string {
    const date = epochSecondsToDate(epochSeconds);

    return date === null
      ? '-'
      : MATCH_DATE_TIME_FORMATTER.format(date);
  }
}
