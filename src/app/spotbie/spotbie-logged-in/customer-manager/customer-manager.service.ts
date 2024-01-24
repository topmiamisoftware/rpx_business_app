import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {handleError} from '../../../helpers/error-helper';
import {catchError, tap} from 'rxjs/operators';
import * as spotbieGlobals from '../../../globals';
import {Observable} from 'rxjs';
import {User} from "../../../models/user";

const CUSTOMER_MANAGER_API = `${spotbieGlobals.API}customer-manager`;

@Injectable({
  providedIn: 'root'
})
export class CustomerManagerService {

  customerList: Array<User> = [];

  constructor(private http: HttpClient) { }

  getCustomerList(): Observable<any> {
    const api = `${CUSTOMER_MANAGER_API}/index`;

    return this.http.get<any>(api).pipe(
      tap((r) => this.customerList = r.data),
      catchError(handleError('getCustomerList')),
    );
  }

  downloadFullCustomerList(): Observable<any> {
    const api = `${CUSTOMER_MANAGER_API}/csv`;

    return this.http.get<any>(api).pipe(
      catchError(handleError('getCustomerList'))
    );
  }

  sendTextMessage() {

  }

  sendEmail() {

  }
}
