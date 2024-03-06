import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import {catchError, tap} from 'rxjs/operators'
import { Observable } from 'rxjs'
import { handleError } from '../../helpers/error-helper'
import { LoyaltyPointBalance } from '../../models/loyalty-point-balance'
import * as spotbieGlobals from '../../globals'
import {LoyaltyTier} from '../../models/loyalty-point-tier.balance';

const LOYATLY_POINTS_API = spotbieGlobals.API+'loyalty-points'
const LOYATLY_POINTS_TIER_API = spotbieGlobals.API+'lp-tiers';
const REDEEMABLE_API = spotbieGlobals.API+'redeemable'

@Injectable({
  providedIn: 'root'
})
export class LoyaltyPointsService {
  loyaltyPointBalance: LoyaltyPointBalance;
  existingTiers: Array<LoyaltyTier> = [];

  constructor(private http: HttpClient) {
  }

  getLoyaltyPointBalance(): any {
    const apiUrl = `${LOYATLY_POINTS_API}/show`;

    return this.http
      .post<any>(apiUrl, null)
      .pipe(catchError(handleError('getLoyaltyPointBalance')));
  }


  public createRedeemable(createRedeemableObj: any): Observable<any>{
    const apiUrl = `${REDEEMABLE_API}/create`

    return this.http.post<any>(apiUrl, createRedeemableObj).pipe(
      catchError(handleError('createRedeemable'))
    );
  }

  getExistingTiers(): Observable<any> {
    const apiUrl = `${LOYATLY_POINTS_TIER_API}/index`

    return this.http.get<any>(apiUrl).pipe(
      tap((existingTiers) => {
        existingTiers.data.forEach((tier) => {
          tier.entranceValue = tier.lp_entrance;
          this.existingTiers.push(tier);
        });
      }),
      catchError(handleError('existingTiers')),
    );
  }

  updateTier(tier: LoyaltyTier): Observable<any> {
    const apiUrl = `${LOYATLY_POINTS_TIER_API}/update/${tier.uuid}`

    return this.http.patch<any>(apiUrl, tier).pipe(
      catchError(handleError('updateTier'))
    );
  }

  createTier(tier: LoyaltyTier): Observable<any> {
    const apiUrl = `${LOYATLY_POINTS_TIER_API}/store`

    console.log('createTier', tier);

    return this.http.post<any>(apiUrl, tier).pipe(
      catchError(handleError('createTier'))
    );
  }

  deleteTier(tierUuid: string): Observable<any> {
    const apiUrl = `${LOYATLY_POINTS_TIER_API}/destroy/${tierUuid}`

    return this.http.delete<any>(apiUrl).pipe(
      catchError(handleError('deleteTier'))
    );
  }
}
