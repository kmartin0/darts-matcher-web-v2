import {Pipe, PipeTransform} from '@angular/core';
import {X01Checkout} from '../../../../../data/model/x01/checkout/x01-checkout';
import {getAreaPrefix} from '../../../../../data/model/dartboard/dartboard-section-area';
import {DARTBOARD_SECTION_TO_NUMBER} from '../../../../../data/model/dartboard/dartboard-section';

/**
 * Formats the checkout suggestion displayed in the Match Player Card.
 */
@Pipe({
  name: 'suggestedCheckout'
})
export class SuggestedCheckoutPipe implements PipeTransform {

  /**
   * Formats the suggested darts using conventional board notation.
   *
   * Example: `T20, T20, D20`.
   * Returns an empty string when no checkout is available.
   *
   * @param checkout - Checkout suggestion to format.
   * @returns Formatted suggested dart sequence, or an empty string when unavailable.
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
