import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http: HttpClient = inject(HttpClient);

  makePost<T>(url: string, body?: any): Observable<T> {
    return this.http.post<T>(url, body);
  }

  makeGet<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  makeDelete(url: string): Observable<any> {
    return this.http.delete(url);
  }

  makePut<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(url, body);
  }

}
