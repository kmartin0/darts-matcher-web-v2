import {Component, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';

@Component({
  template: ''
})
export abstract class BaseComponent implements OnDestroy {
  protected subscription: Subscription = new Subscription();

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
