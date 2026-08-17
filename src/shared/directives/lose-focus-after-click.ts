import {Directive, ElementRef, HostListener, inject} from '@angular/core';

@Directive({
  selector: '[appLoseFocusAfterClick]'
})
export class LoseFocusAfterClickDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  @HostListener('click')
  protected onClick(): void {
    this.elementRef.nativeElement.blur();
  }
}
