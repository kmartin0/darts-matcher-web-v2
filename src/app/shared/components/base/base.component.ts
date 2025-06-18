import {Component, OnDestroy} from '@angular/core';
import {Subject, Subscription} from 'rxjs';

@Component({
  template: ''
})
export abstract class BaseComponent implements OnDestroy {
  protected subscription: Subscription = new Subscription();
  protected destroy$ = new Subject<void>();

  ngOnDestroy() {
    this.destroy$?.next();
    this.destroy$?.complete();

    this.subscription?.unsubscribe();
  }
}
