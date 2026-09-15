import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute} from '@angular/router';
import {catchError, EMPTY, map, Observable, switchMap, tap} from 'rxjs';
import {ALL_API_ERROR_CODES, ApiErrorCode} from '../../../../data/api/errors/api-error-code';
import {isApiErrorResponse} from '../../../../data/api/errors/api-error-response';
import {isValidObjectId} from '../../../../data/api/utils/object-id.util';
import {DeleteMatchMessage, MatchMessageUnion, MatchUpdateMessage} from '../../../../data/api/ws/match-message';
import {MatchMessageType} from '../../../../data/api/ws/match-message-type';
import {StreamEventType} from '../../../../data/api/ws/stream-event-type';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {CheckoutRepository} from '../../../../data/repository/checkout-repository';
import {MatchRepository} from '../../../../data/repository/match-repository';
import {RecentMatchesRepository} from '../../../../data/repository/recent-matches-repository';
import {INITIAL_MATCH_PAGE_STATE, MatchPageState} from './match-page-state';
import {mapToEditTurnRequestDto} from '../../mappers/edit-turn-request.mapper';
import {mapToEditTurnErrorMessage} from '../../mappers/edit-turn-error.mapper';
import {CreateTurnInput, EditTurnInput} from '../../model/turn-input';
import {mapToCreateTurnRequestDto} from '../../mappers/create-turn-request.mapper';
import {mapToCreateTurnErrorMessage} from '../../mappers/create-turn-error.mapper';

@Injectable()
export class MatchPageStore {
  private readonly matchRepository = inject(MatchRepository);
  private readonly recentMatchesRepository = inject(RecentMatchesRepository);
  private readonly checkoutRepository = inject(CheckoutRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _state = signal<MatchPageState>(INITIAL_MATCH_PAGE_STATE);
  readonly state = this._state.asReadonly();

  constructor() {
    this.loadCheckouts();
    this.registerRouteParamsObserver();
  }

  /**
   * Repairs the currently loaded match.
   *
   * Clears existing command errors before execution and exposes a toolbar error
   * when the repair operation fails.
   */
  repairMatch(): void {
    this.executeMatchCommand(
      match => this.matchRepository.reprocessMatch(match.id, ALL_API_ERROR_CODES),
      () => this.patchState({toolbarError: 'Failed to repair match'})
    );
  }

  /**
   * Resets the currently loaded match.
   *
   * Clears existing command errors before execution and exposes a toolbar error
   * when the reset operation fails.
   */
  resetMatch(): void {
    this.executeMatchCommand(
      match => this.matchRepository.resetMatch(match.id, ALL_API_ERROR_CODES),
      () => this.patchState({toolbarError: 'Failed to reset match'})
    );
  }

  /**
   * Deletes the currently loaded match.
   *
   * Clears existing command errors before execution and exposes a toolbar error
   * when the delete operation fails.
   */
  deleteMatch(): void {
    this.executeMatchCommand(
      match => this.matchRepository.deleteMatch(match.id, ALL_API_ERROR_CODES),
      () => this.patchState({toolbarError: 'Failed to delete match'})
    );
  }

  /**
   * Deletes the last turn from the current match.
   *
   * Displays a toolbar error when the operation fails.
   */
  deleteLastTurn(): void {
    this.executeMatchCommand(
      match => this.matchRepository.deleteLastTurn(match.id, ALL_API_ERROR_CODES),
      () => this.patchState({toolbarError: 'Failed to delete last turn'})
    );
  }

  /**
   * Edits an existing turn in the current match.
   *
   * Maps the resolved edit-turn input to the API request DTO and executes the edit command for the loaded match.
   *
   * @param editTurnInput - Resolved values required to edit the turn.
   */
  editTurn(editTurnInput: EditTurnInput): void {
    const editTurnRequestDto = mapToEditTurnRequestDto(editTurnInput);

    this.executeMatchCommand(
      match => this.matchRepository.editTurn(match.id, editTurnRequestDto, ALL_API_ERROR_CODES),
      error => {
        const errorResponse = isApiErrorResponse(error) ? error : undefined;
        const errorMessage = mapToEditTurnErrorMessage(errorResponse);
        this.patchState({scoreInputError: errorMessage});
      }
    );
  }

  /**
   * Adds a turn to the current match.
   *
   * Maps the resolved create-turn input to the API request DTO and executes the add command for the loaded match.
   *
   * @param createTurnInput - Resolved values required to create the turn.
   */
  addTurn(createTurnInput: CreateTurnInput): void {
    const createTurnRequestDto = mapToCreateTurnRequestDto(createTurnInput);

    this.executeMatchCommand(
      match => this.matchRepository.addTurn(match.id, createTurnRequestDto, ALL_API_ERROR_CODES),
      error => {
        const errorResponse = isApiErrorResponse(error) ? error : undefined;
        const errorMessage = mapToCreateTurnErrorMessage(errorResponse)
        this.patchState({scoreInputError: errorMessage});
      }
    );
  }

  /**
   * Loads the checkout suggestions required by the match page.
   */
  private loadCheckouts(): void {
    this.patchState({checkouts: {status: 'loading'}});

    this.checkoutRepository.getCheckouts().pipe(
      tap(checkouts =>
        this.patchState({checkouts: {status: 'loaded', data: checkouts}})
      ),
      catchError(() => {
        this.patchState({
          checkouts: {status: 'error'},
          toolbarError: 'Failed to load checkouts'
        });

        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  /**
   * Registers the observer that handles route parameter changes.
   *
   * Invalid match IDs are represented as an error state. Using switchMap ensures
   * the previous match observation is canceled when the route parameter changes.
   */
  private registerRouteParamsObserver(): void {
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
   * Observes the match stream and updates the page state from incoming stream events.
   *
   * @param matchId - ID of the match to observe.
   * @returns Observable representing the match stream.
   */
  private observeMatch(matchId: string): Observable<StreamEventType<MatchMessageUnion>> {
    this.patchState({match: {status: 'loading'}});

    return this.matchRepository.streamMatch(matchId, ALL_API_ERROR_CODES).pipe(
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
  private handleStreamMatchEvent(event: StreamEventType<MatchMessageUnion>): void {
    switch (event.type) {
      case 'data':
        this.handleMatchMessage(event.data);
        break;

      case 'connection':
        this.patchState({streamConnectionState: event.state});
        break;
    }
  }

  /**
   * Handles an incoming match message.
   *
   * @param message - Match message to handle.
   */
  private handleMatchMessage(message: MatchMessageUnion): void {
    switch (message.messageType) {
      case MatchMessageType.PROCESS_MATCH:
      case MatchMessageType.ADD_HUMAN_TURN:
      case MatchMessageType.ADD_BOT_TURN:
      case MatchMessageType.EDIT_TURN:
      case MatchMessageType.DELETE_LAST_TURN:
      case MatchMessageType.RESET_MATCH:
        this.handleMatchUpdate(message);
        break;

      case MatchMessageType.DELETE_MATCH:
        this.handleDeleteMatchMessage(message);
        break;
    }
  }

  /**
   * Handles a match update message.
   *
   * Updates with an equal or older broadcast version are ignored. The match is
   * added to recent matches when it is loaded for the first time.
   *
   * @param message - Match update message to handle.
   */
  private handleMatchUpdate(message: MatchUpdateMessage): void {
    const match = message.payload;
    const currentMatchState = this._state().match;

    if (
      currentMatchState.status === 'loaded' &&
      currentMatchState.data.broadcastVersion >= match.broadcastVersion
    ) {
      return;
    }

    if (currentMatchState.status !== 'loaded') {
      this.recentMatchesRepository.addMatch(match.id);
    }

    this.patchState({match: {status: 'loaded', data: match}});
  }

  /**
   * Handles a match deletion message.
   *
   * Removes the deleted match from recent matches and marks the page as deleted.
   *
   * @param message - Delete match message to handle.
   */
  private handleDeleteMatchMessage(message: DeleteMatchMessage): void {
    const matchId = message.payload;

    this.recentMatchesRepository.deleteMatch(matchId);
    this.patchState({match: {status: 'deleted'}});
  }

  /**
   * Handles a match observation failure.
   *
   * Deletes the match from recent matches when it no longer exists and marks
   * the match state as errored.
   *
   * @param matchId - ID of the match being observed.
   * @param error - Error returned by the match stream.
   */
  private handleObserveMatchError(matchId: string, error: unknown): void {
    const errorResponse = isApiErrorResponse(error) ? error : undefined;

    if (errorResponse?.type === ApiErrorCode.RESOURCE_NOT_FOUND) {
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

    if (matchState.status !== 'loaded') {
      return;
    }

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
