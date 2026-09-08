import {Pipe, PipeTransform} from '@angular/core';
import {X01Checkout} from '../../../../../data/model/x01/x01-checkout';
import {getAreaPrefix} from '../../../../../data/model/x01/dartboard-section-area';
import {DartboardSectionToNumber} from '../../../../../data/model/x01/dartboard-section';


/**
 * Formats an X01 checkout suggestion for display.
 */
@Pipe({
  name: 'suggestedCheckout'
})
export class SuggestedCheckoutPipe implements PipeTransform {

  /**
   * Formats the suggested dart sequence of a checkout.
   *
   * @param checkout - Checkout suggestion to format.
   * @returns Formatted checkout suggestion, or an empty string when none is available.
   */
  transform(checkout: X01Checkout | null): string {
    if (!checkout) {
      return '';
    }

    return checkout.suggested
      .map(dart => `${getAreaPrefix(dart.area)}${DartboardSectionToNumber[dart.section]}`)
      .join(', ');
  }
}
