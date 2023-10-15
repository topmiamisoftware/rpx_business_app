import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { handleError } from '../../helpers/error-helper';
import * as spotbieGlobals from '../../globals';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';

const USER_LOCATION_API   = `${spotbieGlobals.API}user-location`
const SEARCH_BUSINESS_API = `${spotbieGlobals.API}surroundings/search-businesses`
const SB_COMMUNITY_MEMBERS_API = `${spotbieGlobals.API}surroundings/get-community-members`
const SEARCH_EVENTS_API   = `${spotbieGlobals.API}surroundings/search-events`
const GET_CLASSIFICATIONS = `${spotbieGlobals.API}surroundings/get-classifications`

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private http: HttpClient) { }
  
  public getClassifications(): Observable<any>{

    const getClassificationsApi = `${GET_CLASSIFICATIONS}`

    return this.http.get<any>(getClassificationsApi).pipe(
      catchError(handleError("getClassifications"))
    )
    
  }

  public getEvents(searchObj: any): Observable<any> {

    const getEventsApi = `${SEARCH_EVENTS_API}`

    return this.http.post<any>(getEventsApi, searchObj).pipe(
      catchError(handleError("getEvents"))
    )

  }

  public getBusinesses(searchObj: any): Observable<any> {

    const getBusinessesApi = `${SEARCH_BUSINESS_API}`

    return this.http.post<any>(getBusinessesApi, searchObj).pipe(
      catchError(handleError("getBusinesses"))
    )

  }

  public getSpotBieCommunityMemberList(searchObj: any): Observable<any> {

    const getBusinessesApi = `${SB_COMMUNITY_MEMBERS_API}`

    return this.http.post<any>(getBusinessesApi, searchObj).pipe(
      catchError(handleError("getSpotBieCommunityMemberList"))
    )

  }

  public saveCurrentLocation(saveLocationObj: any) {

    const locationApi = `${USER_LOCATION_API}/save-current-location`;

    return this.http.post<any>(locationApi, saveLocationObj).pipe(
      catchError(handleError("saveCurrentLocation Error"))
    )

  }

  public retrieveSurroudings(retrieve_surroundings_obj: any){

    let location_api = `${USER_LOCATION_API}/retrieve-surroundings`;

    return this.http.post<any>(location_api, retrieve_surroundings_obj).pipe(
      catchError(handleError("retrieveSurroudings Error"))
    )  

  }

}
