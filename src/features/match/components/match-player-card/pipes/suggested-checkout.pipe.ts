import {Pipe, PipeTransform} from '@angular/core';
import {X01Checkout} from '../../../../../data/model/x01/checkout/x01-checkout';
import {getAreaPrefix} from '../../../../../data/model/dartboard/dartboard-section-area';
import {DARTBOARD_SECTION_TO_NUMBER} from '../../../../../data/model/dartboard/dartboard-section';

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
    if (checkout === null) {
      return '';
    }

    return checkout.suggested
      .map(dart => `${getAreaPrefix(dart.area)}${DARTBOARD_SECTION_TO_NUMBER[dart.section]}`)
      .join(', ');
  }
}
