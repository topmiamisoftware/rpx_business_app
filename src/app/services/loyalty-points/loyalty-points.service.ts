import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import {catchError, tap} from 'rxjs/operators'
import { Observable } from 'rxjs'
import { handleError } from 'src/app/helpers/error-helper'
import { Store } from '@ngrx/store'
import { setValue } from 'src/app/spotbie/spotbie-logged-in/loyalty-points/loyalty-points.actions'
import { LoyaltyPointBalance } from 'src/app/models/loyalty-point-balance'
import * as spotbieGlobals from 'src/app/globals'
import {LoyaltyTier} from '../../models/loyalty-point-tier.balance';

const LOYATLY_POINTS_API = spotbieGlobals.API+'loyalty-points'
const LOYATLY_POINTS_TIER_API = spotbieGlobals.API+'lp-tiers';
const REDEEMABLE_API = spotbieGlobals.API+'redeemable'

@Injectable({
  providedIn: 'root'
})
export class LoyaltyPointsService {

  userLoyaltyPoints$: Observable<LoyaltyPointBalance | number> = this.store.select('loyaltyPoints');
  loyaltyPointBalance: LoyaltyPointBalance;
  existingTiers: Array<LoyaltyTier> = [];

  constructor(private http: HttpClient,
              private store: Store<{ loyaltyPoints }>) {
  }

  getLedger(request: any): Observable<any>{
    const apiUrl = `${REDEEMABLE_API}/ledger?page=${request.page}`

    return this.http.get<any>(apiUrl, request).pipe(
      catchError(handleError( 'getLedger'))
    )
  }

  getBalanceList(request: any): Observable<any>{
    const apiUrl = `${REDEEMABLE_API}/balance-list?page=${request.page}`

    return this.http.get<any>(apiUrl, request).pipe(
      catchError(handleError( 'getBalanceList'))
    )
  }

  getRedeemed(request: any): Observable<any>{
    const apiUrl = `${REDEEMABLE_API}/lp-redeemed?page=${request.page}`

    return this.http.get<any>(apiUrl, request).pipe(
      catchError(handleError('getRedeemed'))
    )
  }

  getRewards(request: any): Observable<any>{
    const apiUrl = `${REDEEMABLE_API}/index?page=${request.page}`

    return this.http.get<any>(apiUrl, request).pipe(
      catchError(handleError( 'getRewards'))
    )
  }

  getLoyaltyPointBalance(): any{
    const apiUrl = `${LOYATLY_POINTS_API}/show`

    this.http.post<any>(apiUrl, null).pipe(
      catchError(handleError('getLoyaltyPointBalance'))
    ).subscribe(resp => {
          if(resp.success){
            const loyaltyPointBalance: number = resp.loyalty_points
            this.store.dispatch( setValue({loyaltyPointBalance}) )
          }
        });
  }

  addLoyaltyPoints(businessLoyaltyPointsObj: any, callback): any{
    const apiUrl = `${REDEEMABLE_API}/redeem`

    this.http.post<any>(apiUrl, businessLoyaltyPointsObj).pipe(
      catchError(handleError('saveLoyaltyPoint'))
    ).subscribe(resp => {
        if(resp.success){
          const loyaltyPointBalance: number = resp.loyalty_points
          this.store.dispatch( setValue({loyaltyPointBalance}) )
        }
        callback(resp)
      });
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
