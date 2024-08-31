import {Injectable} from '@angular/core';
import * as spotbieGlobals from '../../globals';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

const SIGN_UP_API = spotbieGlobals.API + 'user';

@Injectable({
  providedIn: 'root',
})
export class SignUpService {
  constructor(private http: HttpClient) {}

  initRegister(register_object: any): Observable<any> {
    const sign_up_api = SIGN_UP_API + '/sign-up';
    return this.http.post<any>(sign_up_api, register_object);
  }
}
