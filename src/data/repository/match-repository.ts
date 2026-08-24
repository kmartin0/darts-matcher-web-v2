import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CreateMatchRequestDto} from '../dto/create-match-request.dto';
import {delay, dematerialize, materialize, Observable, throwError} from 'rxjs';
import {X01Match} from '../model/x01/x01-match';
import {DARTS_MATCHER_API_ENDPOINTS} from '../api/api-endpoints';

@Injectable({providedIn: 'root'})
export class MatchRepository {
  private readonly http = inject(HttpClient);

  createMatch(body: CreateMatchRequestDto): Observable<X01Match> {
    return this.http.post<X01Match>(DARTS_MATCHER_API_ENDPOINTS.X01.MATCHES, body);
  }

  getMatch(matchId: string): Observable<X01Match> {
    return this.http.get<X01Match>(DARTS_MATCHER_API_ENDPOINTS.X01.MATCH(matchId));
  }

  getMatches(matchIds: string[]): Observable<X01Match[]> {
    return this.http.get<X01Match[]>(DARTS_MATCHER_API_ENDPOINTS.X01.MATCHES_BY_IDS(matchIds));
  }

  matchExists(matchId: string): Observable<void> {
    return this.http.get<void>(DARTS_MATCHER_API_ENDPOINTS.X01.MATCH_EXISTS(matchId));
  }
}
