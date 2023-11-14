import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { handleError } from '../../helpers/error-helper'
import * as spotbieGlobals from '../../globals'

const ADS_API = spotbieGlobals.API+'in-house'

@Injectable({
  providedIn: 'root'
})
export class AdsService {

  constructor(private http: HttpClient) { }

  getHeaderBanner(headerBannerReqObj: any): Observable<any>{
    const getAd = `${ADS_API}/header-banner`

    return this.http.post(getAd, headerBannerReqObj).pipe(
      catchError(handleError("getHeaderBanner"))
    );
  }

  getNearByFeatured(nearByFeaturedReqObj: any): Observable<any>{
    const getAd = `${ADS_API}/featured-ad-list`

    return this.http.post(getAd, nearByFeaturedReqObj).pipe(
      catchError(handleError("getNearByFeatured"))
    );
  }  

  getAds():  Observable<any>{
    const getAdsApi = `${ADS_API}/index`

    return this.http.post(getAdsApi, null).pipe(
      catchError(handleError("getAds")),
    );

  }

  getAdByUUID(searchObjSb: any):  Observable<any>{
    const getAdsApi = `${ADS_API}/get-by-uuid`

    return this.http.post(getAdsApi, searchObjSb).pipe(
      catchError(handleError("getAdByUUID")),
    );
  }

  getBottomHeader(searchObjSb: any):  Observable<any>{
    const getAdsApi = `${ADS_API}/footer-banner`

    return this.http.post(getAdsApi, searchObjSb).pipe(
      catchError(handleError("getBottomHeader")),
    );
  }
}
