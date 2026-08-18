import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CreateX01MatchRequestDto} from '../dto/create-x01-match-request.dto';
import {Observable} from 'rxjs';
import {X01Match} from '../model/x01/x01-match';
import {DARTS_MATCHER_API_ENDPOINTS} from '../api/api-endpoints';

@Injectable({providedIn: 'root'})
export class X01MatchRepository {
  private readonly http = inject(HttpClient);

  createMatch(body: CreateX01MatchRequestDto): Observable<X01Match> {
    return this.http.post<X01Match>(DARTS_MATCHER_API_ENDPOINTS.X01_MATCHES, body);
  }

  getX01Match(matchId: string): Observable<X01Match> {
    return this.http.get<X01Match>(DARTS_MATCHER_API_ENDPOINTS.X01_MATCH(matchId));
  }
}
