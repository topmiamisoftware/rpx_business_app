import { Injectable } from '@angular/core';
import * as spotbieGlobals from 'src/app/globals'
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { handleError } from 'src/app/helpers/error-helper';
import { catchError, tap } from 'rxjs/operators';

const SIGN_UP_API = spotbieGlobals.API + 'user'

@Injectable({
  providedIn: 'root'
})
export class SignUpService {

  constructor(private http : HttpClient) { }

  public initRegister(register_object: any): Observable<any>{

    let sign_up_api = SIGN_UP_API + '/sign-up'

    return this.http.post<any>(sign_up_api, register_object)

  }

}
