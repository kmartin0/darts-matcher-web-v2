import {Observable} from 'rxjs';
import {ApiService} from './api.service';
import {DARTS_MATCHER_API_ENDPOINTS} from '../endpoints/darts-matcher-api.endpoints';
import {CreateMatchRequestDto} from '../dto/create-match-request.dto';
import {X01Match} from '../../models/x01-match/x01-match';
import {Injectable} from '@angular/core';
import {ObjectId} from '../../models/object-id';

@Injectable({
  providedIn: 'root'
})
export class DartsMatcherApiService {

  constructor(private api: ApiService) {
  }

  createMatch(body: CreateMatchRequestDto): Observable<X01Match> {
    return this.api.makePost(DARTS_MATCHER_API_ENDPOINTS.CREATE_MATCH, body);
  }

  getMatch(matchId: ObjectId): Observable<X01Match> {
    return this.api.makeGet(DARTS_MATCHER_API_ENDPOINTS.GET_MATCH(matchId));
  }

}
