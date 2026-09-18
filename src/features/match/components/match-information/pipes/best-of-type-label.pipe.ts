import {Pipe, PipeTransform} from '@angular/core';
import {X01BestOfType} from '../../../../../data/model/x01/rules/x01-best-of-type';

/**
 * Formats the best-of-type label displayed in Match Information.
 */
@Pipe({
  name: 'bestOfTypeLabel'
})
export class BestOfTypeLabelPipe implements PipeTransform {

  /**
   * Formats the unit used to decide the match.
   *
   * Returns `Sets` for a set-based match and `Legs` for a leg-based match.
   *
   * @param bestOfType - Best-of type to format.
   * @returns Human-readable best-of-type label.
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
