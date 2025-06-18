import {Component, ViewChild} from '@angular/core';
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


@Component({
  selector: 'app-home',
  imports: [
    MatchFormComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  standalone: true
})
export class HomePageComponent extends BaseComponent {

  @ViewChild(MatchFormComponent) matchFormComponent!: MatchFormComponent;

  constructor(private dartsMatcherApi: DartsMatcherApiService,
              private router: Router,
              private dtoMapperService: DtoMapperService) {
    super();
  }

  /**
   * Handler for when a match form is submitted. On submission will map the form input to the required request body for
   * creating a match. After transforming to the request body, the api will be called to create a match.
   * The result (success and error) will be delegated to their handles.
   *
   * @param matchFormResult - The form result for creating a x01 match
   */
  onMatchFormResult(matchFormResult: MatchFormResult) {
    console.log(`This is emitted: ${JSON.stringify(matchFormResult)}`);
    const sub = this.dartsMatcherApi.createMatch(this.dtoMapperService.fromMatchFormResult(matchFormResult)).subscribe({
      next: (match: X01Match) => this.handleCreateMatchSuccess(match),
      error: (err: HttpErrorResponse) => this.handleCreateMatchError(err)
    });
    this.subscription.add(sub);
  }

  /**
   * When a match is successfully created the app will navigate to match component.
   *
   * @param match - The newly created match
   */
  private handleCreateMatchSuccess(match: X01Match) {
    this.router.navigateByUrl(AppEndpoints.match(match.id)).then(success => {
      if (!success) throw new Error('Navigate url failed');
    });
  }

  /**
   * When an error occurred creating a match. The form component will display the error message at the corresponding
   * form field.
   *
   * @param err - The http error response.
   */
  private handleCreateMatchError(err: HttpErrorResponse) {
    if (isApiErrorBody(err)) {
      const apiErrorBody = err.error as ApiErrorBody;
      this.matchFormComponent.handleApiError(apiErrorBody);
    }
  }
}
