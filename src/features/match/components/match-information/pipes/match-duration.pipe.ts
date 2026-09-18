import {Pipe, PipeTransform} from '@angular/core';
import {formatCount} from '../../../../../shared/utils/number.util';

/**
 * Formats the match duration displayed in Match Information.
 */
@Pipe({
  name: 'matchDuration'
})
export class MatchDurationPipe implements PipeTransform {

  /**
   * Formats a duration in seconds as minutes or as hours and minutes.
   *
   * Incomplete minutes are discarded. Examples: `45 minutes` and `1h 15m`.
   *
   * @param durationInSeconds - Duration to format in seconds.
   * @returns Formatted match duration.
   */
  transform(durationInSeconds: number): string {
    const durationInMinutes = Math.floor(durationInSeconds / 60);

    if (durationInMinutes < 60) {
      return formatCount(durationInMinutes, 'minute', 'minutes');
    }

    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;

    return `${hours}h ${minutes}m`;
  }
}
