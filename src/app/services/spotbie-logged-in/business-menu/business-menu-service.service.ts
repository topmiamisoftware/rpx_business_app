import { Injectable } from '@angular/core';
import * as spotbieGlobals from '../../../globals'
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { handleError } from '../../../helpers/error-helper';
import { catchError, tap } from 'rxjs/operators';

const REWARD_API = `${spotbieGlobals.API}reward`
const BUSINESS_API = `${spotbieGlobals.API}business`

@Injectable({
  providedIn: 'root'
})
export class BusinessMenuServiceService {
  constructor(private http: HttpClient) {}

  public fetchRewards(fetchRewardsReq: any = null): Observable<any>{
    const rewardsApi = `${REWARD_API}/index`;

    return this.http.post<any>(rewardsApi, fetchRewardsReq).pipe(
      catchError(handleError('fetchRewards'))
    );
  }

  public getCommunityMember(fetchRewardsReq: any){

    const communityMemberApi = `${BUSINESS_API}/show`

    return this.http.post<any>(communityMemberApi, fetchRewardsReq).pipe(
      catchError(handleError('fetchRewards'))
    )

  }

}
