import {Observable} from 'rxjs';
import {ApiService} from './api.service';
import {DARTS_MATCHER_API_ENDPOINTS} from '../endpoints/darts-matcher-api.endpoints';
import {CreateMatchRequestDto} from '../dto/create-match-request.dto';
import {X01Match} from '../../models/x01-match/x01-match';
import {inject, Injectable} from '@angular/core';
import {X01Checkout} from '../../models/x01-match/x01-checkout';

@Injectable({
  providedIn: 'root'
})
export class DartsMatcherApiService {
  private api = inject(ApiService);

  createMatch(body: CreateMatchRequestDto): Observable<X01Match> {
    return this.api.makePost(DARTS_MATCHER_API_ENDPOINTS.CREATE_MATCH, body);
  }

  getMatch(matchId: string): Observable<X01Match> {
    return this.api.makeGet(DARTS_MATCHER_API_ENDPOINTS.GET_MATCH(matchId));
  }

  getCheckoutSuggestions(): Observable<X01Checkout[]> {
    return this.api.makeGet(DARTS_MATCHER_API_ENDPOINTS.GET_X01_CHECKOUTS);
  }

  getMatchExists(matchId: string): Observable<null> {
    return this.api.makeGet(DARTS_MATCHER_API_ENDPOINTS.X01_MATCH_EXISTS(matchId));
  }

}
