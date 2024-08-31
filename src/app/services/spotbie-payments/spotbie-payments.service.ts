import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {catchError, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {handleError} from '../../helpers/error-helper';

@Injectable({
  providedIn: 'root',
})
export class SpotbiePaymentsService {
  constructor(private http: HttpClient) {}

  savePayment(saveAdsObj: any, apiUrl): Observable<any> {
    const saveAdsApi = `${environment.apiEndpoint}${apiUrl}`;

    return this.http
      .post(saveAdsApi, saveAdsObj)
      .pipe(catchError(handleError('saveAdPayment')));
  }

  checkBusinessMembershipStatus(businessUuidObj): Observable<any> {
    const saveAdsApi = `${environment.apiEndpoint}user/membership-status`;

    return this.http
      .post(saveAdsApi, businessUuidObj)
      .pipe(catchError(handleError('saveAdPayment')));
  }

  cancelBusinessMembership(): Observable<any> {
    const saveAdsApi = `${environment.apiEndpoint}user/cancel-membership`;

    return this.http
      .post(saveAdsApi, null)
      .pipe(catchError(handleError('cancelBusinessMembership')));
  }
}
