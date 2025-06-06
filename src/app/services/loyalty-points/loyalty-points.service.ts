import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import {catchError, tap} from 'rxjs/operators'
import {BehaviorSubject, Observable, take} from 'rxjs'
import { handleError } from '../../helpers/error-helper'
import * as spotbieGlobals from '../../globals'
import {LoyaltyTier} from '../../models/loyalty-point-tier';
import {Reward} from "../../models/reward";

const LOYALTY_POINTS_API = spotbieGlobals.API+'loyalty-points'
const LOYALTY_POINTS_TIER_API = spotbieGlobals.API+'lp-tiers';
const REDEEMABLE_API = spotbieGlobals.API+'redeemable'
const USER_API = spotbieGlobals.API+'user'
const REWARDS_API = spotbieGlobals.API+'reward'

@Injectable({
  providedIn: 'root'
})
export class LoyaltyPointsService {
  existingTiers$ = new BehaviorSubject<LoyaltyTier[]>(null);

  constructor(private http: HttpClient) {
  }

  getLoyaltyPointBalance(): Observable<any> {
    const apiUrl = `${LOYALTY_POINTS_API}/show`;

    return this.http
      .post<any>(apiUrl, null)
      .pipe(catchError(handleError('getLoyaltyPointBalance')));
  }


  createRedeemable(createRedeemableObj: any): Observable<any>{
    const apiUrl = `${REDEEMABLE_API}/create`

    return this.http.post<any>(apiUrl, createRedeemableObj).pipe(
      catchError(handleError('createRedeemable'))
    );
  }

  getExistingTiers(): Observable<any> {
    const apiUrl = `${LOYALTY_POINTS_TIER_API}/index`;

    return this.http.get<any>(apiUrl).pipe(
      take(1),
      tap(existingTiers => this.existingTiers$.next(existingTiers.data)),
      catchError(handleError('existingTiers'))
    );
  }

  updateTier(tier: LoyaltyTier): Observable<any> {
    const apiUrl = `${LOYALTY_POINTS_TIER_API}/update/${tier.uuid}`;

    return this.http
      .patch<any>(apiUrl, tier)
      .pipe(catchError(handleError('updateTier')));
  }

  createTier(tier: LoyaltyTier): Observable<any> {
    const apiUrl = `${LOYALTY_POINTS_TIER_API}/store`;

    return this.http
      .post<any>(apiUrl, tier)
      .pipe(catchError(handleError('createTier')));
  }

  deleteTier(tierUuid: string): Observable<any> {
    const apiUrl = `${LOYALTY_POINTS_TIER_API}/destroy/${tierUuid}`;

    return this.http
      .delete<any>(apiUrl)
      .pipe(catchError(handleError('deleteTier')));
  }

  lookUpCustomer(phoneNumber: string){
    return this.http.get(`${USER_API}/get-user?phone_number=${encodeURIComponent(phoneNumber)}`);
  }

  redeem(reward: Reward, user_id: number): Observable<any> {
    return this.http.post(`${REWARDS_API}/claim`, {
      redeemableHash: reward.uuid,
      user_id,
    })
  }

  addLoyaltyPoints(businessLoyaltyPointsObj: any): Observable<any> {
    const apiUrl = `${REDEEMABLE_API}/redeem`;

    return this.http
      .post<any>(apiUrl, businessLoyaltyPointsObj)
      .pipe(catchError(handleError('saveLoyaltyPoint')));
  }
}
