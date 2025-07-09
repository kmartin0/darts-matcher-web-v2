import {defer, finalize, Observable, OperatorFunction, Subject} from 'rxjs';

/**
 * Creates an operator function that calls a callback before the source Observable is subscribed to.
 *
 * @template T - Type of the Observable emissions.
 * @param onSubscribe - Callback function to execute on subscription.
 * @returns OperatorFunction<T, T> that triggers `onSubscribe` on subscription and passes through all values.
 */
export function doOnSubscribe<T>(onSubscribe: () => void | null): OperatorFunction<T, T> {
  return (source: Observable<T>) => defer(() => {
    if (onSubscribe) onSubscribe();
    return source;
  });
}

/**
 * Operator function that sets a loading indicator to `true` when subscribed to and
 * sets it back to `false` when the Observable completes or errors.
 *
 * @template T - Type of the Observable emissions.
 * @param isLoading - Subject<boolean> that receives loading state updates.
 * @returns OperatorFunction<T, T> that manages the loading state around the source Observable.
 */
export function withLoading<T>(isLoading: Subject<boolean> | null): OperatorFunction<T, T> {
  if (!isLoading) return (source: Observable<T>) => source;

  return (source: Observable<T>): Observable<T> => source.pipe(
    doOnSubscribe(() => isLoading.next(true)),
    finalize(() => isLoading.next(false))
  );
}
