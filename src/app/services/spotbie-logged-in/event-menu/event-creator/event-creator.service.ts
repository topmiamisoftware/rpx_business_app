import { Injectable } from '@angular/core'
import * as spotbieGlobals from '../../../../globals'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs';
import { handleError } from '../../../../helpers/error-helper';
import { catchError } from 'rxjs/operators';
import { SpEvent } from '../../../../models/event';

const REWARD_API = `${spotbieGlobals.API}reward` 

@Injectable({
  providedIn: 'root'
})
export class EventCreatorService {

  constructor(private http: HttpClient) {}

  public saveItem(itemObj: SpEvent): Observable<any>{

    const placeToEatRewardApi = `${REWARD_API}/create`

    const itemObjToSave = {
      name: itemObj.name,    
      description: itemObj.description,
      images: itemObj.images,
      point_cost: itemObj.point_cost,
      type: itemObj.type
    }

    return this.http.post<any>(placeToEatRewardApi, itemObjToSave).pipe(
      catchError(handleError("completeReset"))
    ) 

  }

  public updateItem(itemObj: SpEvent): Observable<any>{

    const placeToEatRewardApi = `${REWARD_API}/update`

    const itemObjToSave = {
      name: itemObj.name,    
      description: itemObj.description,
      images: itemObj.images,
      point_cost: itemObj.point_cost,
      type: itemObj.type,
      id: itemObj.id
    }

    return this.http.post<any>(placeToEatRewardApi, itemObjToSave).pipe(
      catchError(handleError("completeReset"))
    ) 

  }

  public deleteMe(itemObj: SpEvent): Observable<any>{

    const placeToEatRewardApi = `${REWARD_API}/delete`

    const itemObjToSave = {
      id: itemObj.id
    }

    return this.http.post<any>(placeToEatRewardApi, itemObjToSave).pipe(
      catchError(handleError("completeReset"))
    ) 
  }


}
