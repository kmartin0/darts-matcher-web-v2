import {DestroyRef, Injectable} from '@angular/core';
import {fromEvent, Observable, Subject, Subscription} from 'rxjs';

/**
 * Service to provide a shared observable stream of `keydown` events across the application.
 *
 * It maintains a stack-like subscription mechanism, only dispatching events to the most recently registered subscriber.
 */
@Injectable({providedIn: 'root'})
export class KeydownEventDispatcherService {
  private subjects: Subject<KeyboardEvent>[] = [];
  private keydownSubscription: Subscription | null = null;

  /**
   * Registers a new observable stream for keydown events, tied to the caller's destroy lifecycle.
   * Events are only forwarded to the most recently active subscriber.
   *
   * @param destroyRef - Angular destroy reference to auto-unsubscribe when the consumer is destroyed
   * @returns Observable that emits `KeyboardEvent`s for the active subscriber
   */
  getKeyDownObservable(destroyRef: DestroyRef): Observable<KeyboardEvent> {
    const subject = new Subject<KeyboardEvent>();
    this.addSubscriber(subject);

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
   */
  private addSubscriber(subject: Subject<KeyboardEvent>) {
    this.subjects.push(subject);
    this.startKeydownSubscription();
  }


  /**
   * Starts listening to global keydown events if not already listening.
   */
  private startKeydownSubscription() {
    if (!this.keydownSubscription && this.subjects.length > 0) {
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
    this.subjects.at(-1)?.next(event);
  }

  /**
   * Removes a subscriber from the list and stops listening globally if none remain.
   *
   * @param subject - The subscriber to remove
   */
  private removeSubscriber(subject: Subject<KeyboardEvent>) {
    subject.complete();
    subject.unsubscribe();
    this.subjects = this.subjects.filter(sub => sub !== subject);
    this.stopKeydownSubscription();
  }

  /**
   * Stops the global keydown listener if there are no active subscribers.
   */
  private stopKeydownSubscription() {
    if (this.subjects.length === 0) {
      this.keydownSubscription?.unsubscribe();
      this.keydownSubscription = null;
    }
  }
}
