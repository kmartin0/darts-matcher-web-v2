import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[appLoseFocusAfterClick]',
  standalone: true
})
export class LoseFocusAfterClickDirective {

  constructor(private elRef: ElementRef) {
  }

  @HostListener('click') onClick() {
    this.elRef.nativeElement.blur();
  }

}
