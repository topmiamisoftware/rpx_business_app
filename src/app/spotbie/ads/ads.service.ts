import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { catchError } from 'rxjs/operators'
import { handleError } from 'src/app/helpers/error-helper'
import * as spotbieGlobals from 'src/app/globals'

const ADS_API = spotbieGlobals.API+'in-house'

@Injectable({
  providedIn: 'root'
})
export class AdsService {

  constructor(private http: HttpClient) { }

  public getHeaderBanner(headerBannerReqObj: any): Observable<any>{

    const getAd = `${ADS_API}/header-banner`

    return this.http.post(getAd, headerBannerReqObj).pipe(
      catchError(
        handleError("getHeaderBanner")
      )
    )

  }

  public getNearByFeatured(nearByFeaturedReqObj: any): Observable<any>{

    const getAd = `${ADS_API}/featured-ad-list`

    return this.http.post(getAd, nearByFeaturedReqObj).pipe(
      catchError(
        handleError("getNearByFeatured")
      )
    )

  }  

  public getAds():  Observable<any>{
    
    const getAdsApi = `${ADS_API}/index`

    return this.http.post(getAdsApi, null).pipe(
      catchError(
        handleError("getAds")
      )
    )

  }

  public getAdByUUID(searchObjSb: any):  Observable<any>{
    
    const getAdsApi = `${ADS_API}/get-by-uuid`

    return this.http.post(getAdsApi, searchObjSb).pipe(
      catchError(
        handleError("getAdByUUID")
      )
    )

  }

  public getBottomHeader(searchObjSb: any):  Observable<any>{

    const getAdsApi = `${ADS_API}/footer-banner`

    return this.http.post(getAdsApi, searchObjSb).pipe(
      catchError(
        handleError("getBottomHeader")
      )
    )

  }

  
}
