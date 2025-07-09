import {Component, inject, ViewChild} from '@angular/core';
import {MatchFormComponent} from '../../components/match-form/match-form.component';
import {MatchFormResult} from '../../components/match-form/match-form';
import {DartsMatcherApiService} from '../../../../api/services/darts-matcher-api.service';
import {HttpErrorResponse} from '@angular/common/http';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {ApiErrorBody, isApiErrorBody} from '../../../../api/error/api-error-body';
import {DtoMapperService} from '../../../../api/services/dto-mapper.service';
import {Router} from '@angular/router';
import {AppEndpoints} from '../../../../core/app.endpoints';
import {BaseComponent} from '../../../../shared/components/base/base.component';
import {MatchIdFormComponent} from '../../components/match-id-form/match-id-form.component';
import {BehaviorSubject, finalize} from 'rxjs';
import {withLoading} from '../../../../shared/operators/operators';


@Component({
  selector: 'app-home',
  imports: [
    MatchFormComponent,
    MatchIdFormComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  standalone: true
})
export class HomePageComponent extends BaseComponent {

  @ViewChild(MatchFormComponent) matchFormComponent!: MatchFormComponent;
  @ViewChild(MatchIdFormComponent) matchIdFormComponent!: MatchIdFormComponent;

  createMatchLoading$ = new BehaviorSubject(false);
  getMatchExistsLoading$ = new BehaviorSubject(false);

  private dartsMatcherApi = inject(DartsMatcherApiService);
  private router = inject(Router);
  private dtoMapperService = inject(DtoMapperService);

  /**
   * Handler for when a match form is submitted. On submission will map the form input to the required request body for
   * creating a match. After transforming to the request body, the api will be called to create a match.
   * The result (success and error) will be delegated to their handles.
   *
   * @param matchFormResult - The form result for creating a x01 match
   */
  onMatchFormResult(matchFormResult: MatchFormResult) {
    const sub = this.dartsMatcherApi.createMatch(this.dtoMapperService.fromMatchFormResult(matchFormResult))
      .pipe(withLoading(this.createMatchLoading$)).subscribe({
        next: (match: X01Match) => this.navigateToMatch(match.id),
        error: (err: HttpErrorResponse) => this.handleCreateMatchError(err)
      });
    this.subscription.add(sub);
  }

  /**
   * Handler for when a match id form is submitted.
   * Uses the api to check whether the match exists. If it does it will navigate towards it. Otherwise, Display an error.
   *
   * @param matchId - The form result containing the match id in string format.
   */
  onMatchIdResult(matchId: string) {
    const sub = this.dartsMatcherApi.getMatchExists(matchId)
      .pipe(withLoading(this.getMatchExistsLoading$)).subscribe({
        next: () => this.navigateToMatch(matchId),
        error: (err: HttpErrorResponse) => this.handleMatchExistsError(err)
      });
    this.subscription.add(sub);
  }

  /**
   * Navigate to match component for a match id.
   *
   * @param matchId - The match id to navigate to.
   */
  private navigateToMatch(matchId: string) {
    this.router.navigateByUrl(AppEndpoints.match(matchId)).then(success => {
      if (!success) throw new Error('Navigate url failed');
    });
  }

  /**
   * When an error occurred creating a match.
   * The form component will display the error message at the corresponding form field.
   *
   * @param err - The http error response.
   */
  private handleCreateMatchError(err: HttpErrorResponse) {
    if (isApiErrorBody(err.error)) {
      const apiErrorBody = err.error as ApiErrorBody;
      this.matchFormComponent.handleApiError(apiErrorBody);
    }
  }

  /**
   * When an error occurred while checking whether a match exists.
   * The form component will display the error message at the corresponding form field.
   * @param err - The http error response.
   */
  private handleMatchExistsError(err: HttpErrorResponse) {
    if (isApiErrorBody(err.error)) {
      const apiErrorBody = err.error as ApiErrorBody;
      this.matchIdFormComponent.handleApiError(apiErrorBody);
    }
  }
}
