import {Injectable} from '@angular/core';
import {HttpClient, HttpEventType} from '@angular/common/http';
import {BehaviorSubject, interval, Observable, switchMap} from 'rxjs';
import * as spotbieGlobals from '../globals';
import {map, tap} from "rxjs/operators";
import {environment} from "../../environments/environment.prod";

const UPDATE_API = spotbieGlobals.API + 'business-app';

@Injectable({
  providedIn: 'root',
})
export class UpdateAppService {

  appNeedsUpdate$: Observable<boolean>;

  constructor(
    private http: HttpClient,
  ) {
    this.initUpdateCheck();
  }

  checkApp(): Observable<any> {
    const updateApi = `${UPDATE_API}/check`;
    return this.http.put<any>(updateApi, { installedVersion: environment.installedVersion }).pipe(
      tap((r) => console.log('App Health:', r)),
    );
  }

  initUpdateCheck() {
    // Check every 15 minutes
    this.appNeedsUpdate$ = interval(15000).pipe(
      switchMap(_ => this.checkApp()),
      map((r: { needsUpdate: boolean }) => r.needsUpdate)
    );
  }
}

/**
 * Function borrowed from StackOverflow answer
 * @param blob
 */
function blobToBase64(blob) {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
