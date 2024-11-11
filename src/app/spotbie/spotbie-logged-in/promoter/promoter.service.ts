import { Injectable } from '@angular/core';
import {Observable} from "rxjs/internal/Observable";
import {HttpClient, HttpParams} from "@angular/common/http";
import {map, tap} from "rxjs/operators";
import {environment} from "../../../../environments/environment";
import {Business} from "../../../models/business";
import * as spotbieGlobals from '../../../globals';

const PROMOTER_API = `${spotbieGlobals.API}}promoter/update-location`;
const SORR_API = `${spotbieGlobals.API}promoter/surrounding-business`;

interface PromoterLocationUpdateResponse {
  new_tablet_location: string,
  updated_at: string
}

interface PromoterDevicePromotionResponse {
  business_list: Business[],
}

@Injectable({
  providedIn: 'root'
})
export class PromoterService {

  constructor(private httpClient: HttpClient) { }

  updateTabletLocation(locationUpdate: {loc_x: string, loc_y: string}): Observable<PromoterLocationUpdateResponse> {
    const updatedAlternator = {
      loc_x: locationUpdate.loc_x,
      loc_y: locationUpdate.loc_y
    }

    return this.httpClient.post(PROMOTER_API, updatedAlternator).pipe(
      map((a: PromoterLocationUpdateResponse) => ({
        new_tablet_location: a.new_tablet_location,
        updated_at: a.updated_at
      })),
      tap(a => console.log('location updated', a))
    );
  }

  retrieveDevicePromotion(): Observable<Business[]> {
    const deviceID = environment.promoter.deviceId;
    return this.httpClient.get(`${SORR_API}?device_id=${deviceID}`).pipe(
      tap(a => console.log("reward list", a)),
      map((a: PromoterDevicePromotionResponse) => a.business_list),
    );
  }
}
