import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { handleError } from 'src/app/helpers/error-helper';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpotbiePaymentsService {

  constructor(private http: HttpClient) { }

  public savePayment(saveAdsObj: any, apiUrl): Observable<any>{
    
    const saveAdsApi = `${environment.apiEndpoint}${apiUrl}`

    return this.http.post(saveAdsApi, saveAdsObj).pipe(
      catchError(
        handleError("saveAdPayment")
      )
    )

  }

  public checkBusinessMembershipStatus(businessUuidObj): Observable<any>{
    
    const saveAdsApi = `${environment.apiEndpoint}user/membership-status`

    return this.http.post(saveAdsApi, businessUuidObj).pipe(
      
      catchError(
        handleError("saveAdPayment")
      )

    )

  }

  public cancelBusinessMembership(): Observable<any>{
    
    const saveAdsApi = `${environment.apiEndpoint}user/cancel-membership`

    return this.http.post(saveAdsApi, null).pipe(
      catchError(
        handleError("cancelBusinessMembership")
      )
    )

  }

}
