import {Component, ViewChild} from '@angular/core';
import {MatchFormComponent} from '../../components/match-form/match-form.component';
import {MatchFormResult} from '../../components/match-form/match-form';
import {DartsMatcherApiService} from '../../../../api/services/darts-matcher-api.service';
import {HttpErrorResponse} from '@angular/common/http';
import {X01Match} from '../../../../models/x01-match/x01-match';
import {ApiErrorBody} from '../../../../api/error/api-error-body';
import {DtoMapperService} from '../../../../api/services/dto-mapper.service';

@Component({
  selector: 'app-home',
  imports: [
    MatchFormComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  standalone: true
})
export class HomePageComponent {

  @ViewChild(MatchFormComponent) matchFormComponent!: MatchFormComponent;

  constructor(private dartsMatcherApi: DartsMatcherApiService, private dtoMapperService: DtoMapperService) {
  }

  onMatchFormResult(matchFormResult: MatchFormResult) {
    console.log(`This is emitted: ${JSON.stringify(matchFormResult)}`);
    this.dartsMatcherApi.createMatch(this.dtoMapperService.fromMatchFormResult(matchFormResult)).subscribe({
      next: (value: X01Match) => {
        console.log("Api Success Result")
        console.log(value);
      },
      error: (err: HttpErrorResponse) => {
        console.log("Api Error Result")
        console.log(err);
        const apiErrorBody = err.error as ApiErrorBody;
        this.matchFormComponent.handleApiError(apiErrorBody);
      }
    });
  }
}
