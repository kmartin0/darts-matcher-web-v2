import {DestroyRef, Injectable} from '@angular/core';
import {fromEvent, Observable, Subject, Subscription} from 'rxjs';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

/**
 * Service to provide a shared observable stream of `keydown` events across the application.
 *
 * It maintains a stack-like subscription mechanism, only dispatching events to the most recently registered subscriber.
 */
@Injectable({providedIn: 'root'})
export class KeydownEventDispatcherService {
  private subscriberStack: { subject: Subject<KeyboardEvent>; dialogRef?: MatDialogRef<any> }[] = [];
  private keydownSubscription: Subscription | null = null;

  constructor(private matDialog: MatDialog) {
  }

  /**
   * Registers a new observable stream for keydown events, tied to the caller's destroy lifecycle.
   * Events are only forwarded to the most recently active subscriber.
   *
   * @param destroyRef - Angular destroy reference to auto-unsubscribe when the consumer is destroyed
   * @param dialogRef
   * @returns Observable that emits `KeyboardEvent`s for the active subscriber
   */
  getKeyDownObservable(destroyRef: DestroyRef, dialogRef?: MatDialogRef<any>): Observable<KeyboardEvent> {
    const subject = new Subject<KeyboardEvent>();
    this.addSubscriber(subject, dialogRef);

    destroyRef.onDestroy(() => {
      this.removeSubscriber(subject);
    });

    return new Observable<KeyboardEvent>(observer => {
      const subscription = subject.subscribe(observer);

      return () => {
        subscription.unsubscribe();
        this.removeSubscriber(subject);
      };
    });
  }

  /**
   * Adds a subject to the internal subscriber list and ensures global keydown listening is active.
   *
   * @param subject - Subject that will receive keydown events
   * @param dialogRef
   */
  private addSubscriber(subject: Subject<KeyboardEvent>, dialogRef?: MatDialogRef<any>) {
    this.subscriberStack.push({subject, dialogRef});
    this.startKeydownSubscription();
  }

  /**
   * Starts listening to global keydown events if not already listening.
   */
  private startKeydownSubscription() {
    if (!this.keydownSubscription && this.subscriberStack.length > 0) {
      this.keydownSubscription = fromEvent<KeyboardEvent>(window, 'keydown')
        .subscribe(event => this.handleKeyboardEvent(event));
    }
  }

  /**
   * Emits the keyboard event to the most recently added subscriber.
   *
   * @param event - The keyboard event to be dispatched
   */
  private handleKeyboardEvent(event: KeyboardEvent) {
    const lastSubscriber = this.subscriberStack.at(-1);

    const openDialogs = this.matDialog.openDialogs;
    if(openDialogs.length === 0 || (lastSubscriber?.dialogRef && openDialogs.includes(lastSubscriber.dialogRef))) {
      lastSubscriber?.subject.next(event);
    }
  }

  /**
   * Removes a subscriber from the list and stops listening globally if none remain.
   *
   * @param subject - The subscriber to remove
   */
  private removeSubscriber(subject: Subject<KeyboardEvent>) {
    subject.complete();
    subject.unsubscribe();
    this.subscriberStack = this.subscriberStack.filter(sub => sub.subject !== subject);
    this.stopKeydownSubscription();
  }

  /**
   * Stops the global keydown listener if there are no active subscribers.
   */
  private stopKeydownSubscription() {
    if (this.subscriberStack.length === 0) {
      this.keydownSubscription?.unsubscribe();
      this.keydownSubscription = null;
    }
  }
}
