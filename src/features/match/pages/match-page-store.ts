import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {MatchRepository} from '../../../data/repository/match-repository';
import {initialMatchPageState, MatchPageState} from './match-page-state';
import {catchError, EMPTY, map, Observable, switchMap, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute} from '@angular/router';
import {isValidObjectId} from '../../../data/api/utils/object-id.util';
import {X01Match} from '../../../data/model/x01/x01-match';
import {RecentMatchesRepository} from '../../../data/repository/recent-matches-repository';
import {ApiErrorCode} from '../../../data/api/errors/api-error-code';
import {isApiErrorResponse} from '../../../data/api/errors/api-error-response';
import {MatchEventType} from '../../../data/api/ws/match-event-type';
import {MatchEventUnion} from '../../../data/api/ws/match-event';
import {StreamEvent} from '../../../data/repository/stream-event.type';

@Injectable()
export class MatchPageStore {
  private readonly matchRepository = inject(MatchRepository);
  private readonly recentMatchesRepository = inject(RecentMatchesRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state = signal<MatchPageState>(initialMatchPageState);
  readonly state = this._state.asReadonly();

  /**
   * Initializes the store by observing route parameter changes.
   */
  constructor() {
    this.observeRouteParams();
  }

  /**
   * Repairs the currently loaded match.
   *
   * Clears existing command errors before execution and exposes a toolbar error
   * when the repair operation fails.
   */
  repairMatch(): void {
    this.executeMatchCommand(
      match => this.matchRepository.reprocessMatch(match.id),
      error => this.patchState({toolbarError: 'Failed to repair match'})
    );
  }

  /**
   * Resets the currently loaded match.
   *
   * Clears existing command errors before execution and exposes a toolbar error when the reset operation fails.
   */
  resetMatch(): void {
    this.executeMatchCommand(
      match => this.matchRepository.resetMatch(match.id),
      error => this.patchState({toolbarError: 'Failed to reset match'})
    );
  }

  /**
   * Deletes the currently loaded match.
   *
   * Clears existing command errors before execution and exposes a toolbar error when the delete operation fails.
   */
  deleteMatch(): void {
    this.executeMatchCommand(
      match => this.matchRepository.deleteMatch(match.id),
      error => this.patchState({toolbarError: 'Failed to delete match'})
    );
  }

  /**
   * Observes route parameter changes and starts observing the corresponding match.
   *
   * Invalid match IDs are represented as an error state. Using switchMap ensures
   * the previous match observation is canceled when the route parameter changes.
   */
  private observeRouteParams(): void {
    this.route.paramMap
      .pipe(
        map(params => params.get('matchId')),
        switchMap(matchId => {
          if (!isValidObjectId(matchId)) {
            this.patchState({match: {status: 'error'}});
            return EMPTY;
          }

          return this.observeMatch(matchId);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  /**
   * Observes the match stream and updates the page state from incoming events.
   *
   * @param matchId - ID of the match to observe.
   * @returns Observable representing the match stream.
   */
  private observeMatch(matchId: string): Observable<StreamEvent<MatchEventUnion>> {
    this.patchState({match: {status: 'loading'}});

    return this.matchRepository.streamMatch(matchId).pipe(
      tap(streamEvent => this.handleStreamMatchEvent(streamEvent)),
      catchError((error: unknown) => {
        this.handleObserveMatchError(matchId, error);
        return EMPTY;
      }),
    );
  }

  /**
   * Handles an event emitted by the match stream.
   *
   * @param event - Stream event to handle.
   */
  private handleStreamMatchEvent(event: StreamEvent<MatchEventUnion>): void {
    switch (event.type) {
      case 'data':
        this.handleMatchEvent(event.data);
        break;

      case 'connection':
        this.patchState({streamConnectionState: event.state});
        break;
    }
  }

  /**
   * Handles an incoming match event.
   *
   * @param event - Match event to handle.
   */
  private handleMatchEvent(event: MatchEventUnion): void {
    switch (event.eventType) {
      case MatchEventType.PROCESS_MATCH:
      case MatchEventType.ADD_HUMAN_TURN:
      case MatchEventType.ADD_BOT_TURN:
      case MatchEventType.EDIT_TURN:
      case MatchEventType.DELETE_LAST_TURN:
      case MatchEventType.RESET_MATCH:
        this.handleMatchUpdate(event.payload);
        break;

      case MatchEventType.DELETE_MATCH:
        this.handleDeleteMatchEvent(event.payload);
        break;
    }
  }

  /**
   * Updates the currently loaded match from an incoming match update.
   *
   * Updates with an equal or older broadcast version are ignored. The match is
   * added to recent matches when it is loaded for the first time.
   *
   * @param match - Updated match.
   */
  private handleMatchUpdate(match: X01Match): void {
    const currentMatchState = this._state().match;

    if (currentMatchState.status === 'loaded' && currentMatchState.data.broadcastVersion >= match.broadcastVersion) {
      return;
    }

    if (currentMatchState.status !== 'loaded') {
      this.recentMatchesRepository.addMatch(match.id);
    }

    this.patchState({match: {status: 'loaded', data: match}});
  }

  /**
   * Handles deletion of the currently observed match.
   *
   * Deletes the match from recent matches and marks the page as deleted.
   *
   * @param matchId - ID of the deleted match.
   */
  private handleDeleteMatchEvent(matchId: string): void {
    this.recentMatchesRepository.deleteMatch(matchId);
    this.patchState({match: {status: 'deleted'}});
  }

  /**
   * Handles a match observation failure.
   *
   * Deletes the match from recent matches when it no longer exists and marks the match state as errored.
   *
   * @param matchId - ID of the match being observed.
   * @param error - Error returned by the match stream.
   */
  private handleObserveMatchError(matchId: string, error: unknown): void {
    const errorResponse = isApiErrorResponse(error) ? error : undefined;

    if (errorResponse?.error === ApiErrorCode.RESOURCE_NOT_FOUND) {
      this.recentMatchesRepository.deleteMatch(matchId);
    }

    this.patchState({match: {status: 'error'}});
  }

  /**
   * Executes a command against the currently loaded match.
   *
   * The command is ignored when no match is loaded. Existing toolbar and score
   * input errors are cleared before execution. Command-specific failures are
   * delegated to the provided error handler.
   *
   * @param command - Command to execute against the currently loaded match.
   * @param errorHandler - Handler invoked when the command fails.
   */
  private executeMatchCommand(
    command: (match: X01Match) => Observable<unknown>,
    errorHandler: (error: unknown) => void
  ): void {
    const matchState = this._state().match;
    if (matchState.status !== 'loaded') return;

    this.patchState({toolbarError: null, scoreInputError: null});

    command(matchState.data).pipe(
      catchError((error: unknown) => {
        errorHandler(error);
        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  /**
   * Updates the current page state with the provided values.
   *
   * @param patch - Partial state containing the values to update.
   */
  private patchState(patch: Partial<MatchPageState>): void {
    this._state.update(state => ({
      ...state,
      ...patch
    }));
  }
}
