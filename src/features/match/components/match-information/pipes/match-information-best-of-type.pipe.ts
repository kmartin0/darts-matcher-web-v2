import {Pipe, PipeTransform} from '@angular/core';
import {X01BestOfType} from '../../../../../data/model/x01/rules/x01-best-of-type';

/**
 * Formats a best-of type for Match Information.
 */
@Pipe({name: 'matchInformationBestOfType'})
export class MatchInformationBestOfTypePipe implements PipeTransform {
  /**
   * Formats the unit used to decide the match.
   *
   * @param bestOfType - Best-of type to format.
   * @returns Human-readable best-of type.
   */
  transform(bestOfType: X01BestOfType): string {
    switch (bestOfType) {
      case X01BestOfType.SETS:
        return 'Sets';

      case X01BestOfType.LEGS:
        return 'Legs';
    }
  }
}
