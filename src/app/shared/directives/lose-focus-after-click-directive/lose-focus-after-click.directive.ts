import {Directive, ElementRef, HostListener, inject} from '@angular/core';

@Directive({
  selector: '[appLoseFocusAfterClick]',
  standalone: true
})
export class LoseFocusAfterClickDirective {

  private elRef = inject(ElementRef);

  @HostListener('click') onClick() {
    this.elRef.nativeElement.blur();
  }

}
