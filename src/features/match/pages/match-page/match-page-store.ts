import {DestroyRef, inject, Injectable, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute} from '@angular/router';
import {
  catchError,
  concatMap,
  defer,
  delay,
  EMPTY,
  exhaustMap,
  filter,
  map,
  Observable,
  of,
  switchMap,
  tap
} from 'rxjs';
import {ALL_API_ERROR_CODES, ApiErrorCode} from '../../../../data/api/errors/api-error-code';
import {isApiErrorResponse} from '../../../../data/api/errors/api-error-response';
import {isValidObjectId} from '../../../../data/api/utils/object-id.util';
import {
  DeleteMatchMessage,
  isMatchUpdateMessage,
  MatchMessageUnion,
  MatchUpdateMessage
} from '../../../../data/api/ws/match-message';
import {MatchMessageType} from '../../../../data/api/ws/match-message-type';
import {StreamConnectionState, StreamEventType} from '../../../../data/api/ws/stream-event-type';
import {X01Match} from '../../../../data/model/x01/match/x01-match';
import {CheckoutRepository} from '../../../../data/repository/checkout-repository';
import {MatchRepository} from '../../../../data/repository/match-repository';
import {RecentMatchesRepository} from '../../../../data/repository/recent-matches-repository';
import {INITIAL_MATCH_PAGE_STATE, MatchPageState, MatchToolbarErrorSource} from './match-page-state';
import {mapToEditTurnRequestDto} from '../../mappers/edit-turn-request.mapper';
import {mapToEditTurnErrorMessage} from '../../mappers/edit-turn-error.mapper';
import {CreateTurnInput, EditTurnInput} from '../../model/turn-input';
import {mapToCreateTurnRequestDto} from '../../mappers/create-turn-request.mapper';
import {mapToCreateTurnErrorMessage} from '../../mappers/create-turn-error.mapper';
import {LocalMatchSettingsRepository} from '../../../../data/repository/local-match-settings-repository';
import {MatchPlayer} from '../../../../data/model/base-match/match-player';
import {LocalMatchSettings} from '../../../../data/model/settings/local-match-settings';

const BOT_TURN_DELAY_MS = 500;

@Injectable()
export class MatchPageStore {
  private readonly matchRepository = inject(MatchRepository);
  private readonly recentMatchesRepository = inject(RecentMatchesRepository);
  private readonly localMatchSettingsRepository = inject(LocalMatchSettingsRepository);
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
   * Saves the local settings for the currently loaded match.
   *
   * Settings belonging to another match are ignored. Saved changes are received
   * through the existing settings observation. Displays a toolbar error when saving fails.
   *
   * @param localMatchSettings - Local match settings to save.
   */
  saveLocalMatchSettings(localMatchSettings: LocalMatchSettings): void {
    const matchState = this._state().match;

    if (matchState.status !== 'loaded' || matchState.data.id !== localMatchSettings.matchId) {
      return;
    }

    this.executeMatchCommand(
      () => defer(() => this.localMatchSettingsRepository.saveMatchSettings(localMatchSettings)),
      () => this.clearToolbarError('saveLocalMatchSettings'),
      () => this.setToolbarError('saveLocalMatchSettings', 'Failed to save local match settings')
    );
  }

  /**
   * Repairs the currently loaded match.
   *
   * Clears this operation's toolbar error on success and displays an error when it fails.
   */
  repairMatch(): void {
    this.executeMatchCommand(
      match => this.matchRepository.reprocessMatch(match.id, ALL_API_ERROR_CODES),
      () => this.clearToolbarError('repairMatch'),
      () => this.setToolbarError('repairMatch', 'Failed to repair match')
    );
  }

  createRematch(): void {
    this.executeMatchCommand(
      match => this.matchRepository.createRematch(match.id, ALL_API_ERROR_CODES),
      () => this.clearToolbarError('rematch'),
      () => this.setToolbarError('rematch', 'Failed to create a rematch')
    );
  }

  /**
   * Resets the currently loaded match.
   *
   * Clears this operation's toolbar error on success and displays an error when it fails.
   */
  resetMatch(): void {
    this.executeMatchCommand(
      match => this.matchRepository.resetMatch(match.id, ALL_API_ERROR_CODES),
      () => this.clearToolbarError('resetMatch'),
      () => this.setToolbarError('resetMatch', 'Failed to reset match')
    );
  }

  /**
   * Deletes the currently loaded match.
   *
   * Clears this operation's toolbar error on success and displays an error when it fails.
   */
  deleteMatch(): void {
    this.executeMatchCommand(
      match => this.matchRepository.deleteMatch(match.id, ALL_API_ERROR_CODES),
      () => this.clearToolbarError('deleteMatch'),
      () => this.setToolbarError('deleteMatch', 'Failed to delete match')
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
      () => this.clearToolbarError('deleteLastTurn'),
      () => this.setToolbarError('deleteLastTurn', 'Failed to delete last turn')
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
      () => this.patchState({scoreInputError: null}),
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
      () => this.patchState({scoreInputError: null}),
      error => {
        const errorResponse = isApiErrorResponse(error) ? error : undefined;
        const errorMessage = mapToCreateTurnErrorMessage(errorResponse);
        this.patchState({scoreInputError: errorMessage});
      }
    );
  }

  /**
   * Clears the pending rematch prompt.
   */
  clearRematchPrompt(): void {
    this.patchState({rematchPrompt: null});
  }

  /**
   * Loads the checkout suggestions required by the match page.
   */
  private loadCheckouts(): void {
    this.patchState({checkouts: {status: 'loading'}});

    this.checkoutRepository.getCheckouts().pipe(
      tap(checkouts => {
        this.patchState({checkouts: {status: 'loaded', data: checkouts}});
        this.clearToolbarError('checkouts');
      }),
      catchError(() => {
        this.patchState({checkouts: {status: 'error'}});
        this.setToolbarError('checkouts', 'Failed to load checkouts');

        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  /**
   * Observes the match identified by the current route parameter.
   *
   * Invalid match IDs are represented as an error state. For a valid ID, the
   * match stream is observed and its first match update starts the local settings
   * observation. Later match updates do not restart that ongoing observation.
   *
   * Changing the route parameter cancels both observations and starts them for the newly selected match.
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

          return this.observeMatch(matchId).pipe(
            filter(event => event.type === 'data'),
            map(event => event.data),
            filter(isMatchUpdateMessage),
            exhaustMap(message => this.observeLocalMatchSettings(message.payload.id, message.payload.players))
          );
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
      concatMap(event => this.delayBotTurnEvent(event)),
      tap(streamEvent => this.handleStreamMatchEvent(streamEvent)),
      catchError((error: unknown) => {
        this.handleObserveMatchError(matchId, error);
        return EMPTY;
      }),
    );
  }

  /**
   * Observes the local settings for a match and updates their load state.
   *
   * The observation remains active so changes made in this or another tab are
   * reflected in the page state.
   *
   * @param matchId - ID of the match whose local settings should be observed.
   * @param players - Players used to initialize and validate the settings.
   * @returns Observable emitting the current local match settings.
   */
  private observeLocalMatchSettings(matchId: string, players: readonly MatchPlayer[]): Observable<LocalMatchSettings> {
    this.patchState({localMatchSettings: {status: 'loading'}});

    return this.localMatchSettingsRepository
      .observeMatchSettings(matchId, players)
      .pipe(
        tap(localMatchSettings => {
          this.patchState(
            {localMatchSettings: {status: 'loaded', data: localMatchSettings}}
          );
          this.clearToolbarError('localMatchSettings');
        }),
        catchError(() => {
          this.patchState({localMatchSettings: {status: 'error'}});
          this.setToolbarError('localMatchSettings', 'Failed to load local match settings');
          return EMPTY;
        })
      );
  }

  /**
   * Delays incoming bot turn events while preserving stream event order.
   *
   * All other stream events receive no additional delay.
   *
   * @param event - Stream event to evaluate.
   * @returns Observable emitting the stream event, optionally delayed.
   */
  private delayBotTurnEvent(event: StreamEventType<MatchMessageUnion>): Observable<StreamEventType<MatchMessageUnion>> {
    if (event.type === 'data' && event.data.messageType === MatchMessageType.ADD_BOT_TURN) {
      return of(event).pipe(delay(BOT_TURN_DELAY_MS));
    }

    return of(event);
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
        this.handleStreamConnectionChange(event.state);
        break;
    }
  }

  /**
   * Handles an incoming match message.
   *
   * @param message - Match message to handle.
   */
  private handleMatchMessage(message: MatchMessageUnion): void {
    if (isMatchUpdateMessage(message)) {
      this.handleMatchUpdate(message);
      return;
    }

    this.handleDeleteMatchMessage(message);
  }

  /**
   * Updates the stream connection state and retries unavailable page data after the connection is restored.
   *
   * @param connectionState - Current match-stream connection state.
   */
  private handleStreamConnectionChange(connectionState: StreamConnectionState): void {
    this.patchState({streamConnectionState: connectionState});
    if (connectionState !== 'connected') {
      return;
    }

    const checkoutsLoadState = this._state().checkouts.status;
    if (checkoutsLoadState === 'idle' || checkoutsLoadState === 'error') {
      this.loadCheckouts();
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

    // Ignore stale or duplicate match updates.
    if (currentMatchState.status === 'loaded' && currentMatchState.data.broadcastVersion >= match.broadcastVersion) {
      return;
    }

    // Track the match in recent history if it wasn't previously loaded.
    if (currentMatchState.status !== 'loaded') {
      this.recentMatchesRepository.addMatch(match.id);
    }

    this.patchState({match: {status: 'loaded', data: match}});

    if (message.messageType === MatchMessageType.REMATCH && match.rematchId) {
      this.patchState({rematchPrompt: {rematchId: match.rematchId}});
    }
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
   * The command is ignored when no match is loaded. Successful completion and
   * failures are delegated to their respective handlers.
   *
   * @param command - Command to execute against the currently loaded match.
   * @param successHandler - Handler invoked when the command completes successfully.
   * @param errorHandler - Handler invoked when the command fails.
   */
  private executeMatchCommand(
    command: (match: X01Match) => Observable<unknown>,
    successHandler: () => void,
    errorHandler: (error: unknown) => void
  ): void {
    const matchState = this._state().match;

    if (matchState.status !== 'loaded') {
      return;
    }

    command(matchState.data).pipe(
      tap({
        complete: successHandler
      }),
      catchError((error: unknown) => {
        errorHandler(error);
        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  /**
   * Sets the toolbar error for the supplied source.
   *
   * @param source - Operation that owns the toolbar error.
   * @param message - Error message to display.
   */
  private setToolbarError(source: MatchToolbarErrorSource, message: string): void {
    this.patchState({
      toolbarError: {
        source: source,
        message: message
      }
    });
  }

  /**
   * Clears the toolbar error when it belongs to the supplied source.
   *
   * @param source - Error source permitted to clear the current toolbar error.
   */
  private clearToolbarError(source: MatchToolbarErrorSource): void {
    if (this._state().toolbarError?.source === source) {
      this.patchState({toolbarError: null});
    }
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
