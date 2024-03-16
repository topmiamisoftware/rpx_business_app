import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {handleError} from '../../../../helpers/error-helper';
import {catchError} from 'rxjs/operators';
import * as spotbieGlobals from '../../../../globals';
import {Observable} from 'rxjs';
import {User} from '../../../../models/user';

const CUSTOMER_MANAGER_API = `${spotbieGlobals.API}customer-manager`;
const FEEDBACK_API = `${spotbieGlobals.API}feedback`;

@Injectable({
  providedIn: 'root',
})
export class CustomerManagerService {
  customerList: Array<User> = [];

  constructor(private http: HttpClient) {}

  getRecentGuestList(): Observable<any> {
    const api = `${CUSTOMER_MANAGER_API}/index`;

    return this.http
      .get<any>(api)
      .pipe(catchError(handleError('getCustomerList')));
  }

  getSmsGroupList(): Observable<any> {
    const api = `${CUSTOMER_MANAGER_API}/sms-group-list`;

    return this.http
      .get<any>(api)
      .pipe(catchError(handleError('getSmsGroupList')));
  }

  sendSms(sms: string): Observable<any> {
    const api = `${CUSTOMER_MANAGER_API}/sms`;

    return this.http
      .post<any>(api, {sms})
      .pipe(catchError(handleError('sendSms')));
  }

  getEmailGroupList(): Observable<any> {
    const api = `${CUSTOMER_MANAGER_API}/email-group-list`;

    return this.http
      .get<any>(api)
      .pipe(catchError(handleError('getEmailGroupList')));
  }

  sendEmail(email_body: string): Observable<any> {
    const api = `${CUSTOMER_MANAGER_API}/email`;

    return this.http
      .post<any>(api, {email_body})
      .pipe(catchError(handleError('sendEmail')));
  }

  getFeedbackList(): Observable<any> {
    const api = `${FEEDBACK_API}/index`;

    return this.http
      .get<any>(api)
      .pipe(catchError(handleError('getFeedbackList')));
  }
}
