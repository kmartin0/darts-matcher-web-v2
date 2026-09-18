import {Pipe, PipeTransform} from '@angular/core';
import {formatCount} from '../../../../../shared/utils/number.util';

/**
 * Formats a match duration for Match Information.
 */
@Pipe({name: 'matchInformationDuration'})
export class MatchInformationDurationPipe implements PipeTransform {
  /**
   * Formats a duration in seconds as minutes or hours and minutes.
   *
   * @param durationInSeconds - Duration to format in seconds.
   * @returns Formatted duration such as `45 minutes` or `1h 15m`.
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
