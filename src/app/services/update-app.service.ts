import {Injectable} from '@angular/core';
import {HttpClient, HttpEventType} from '@angular/common/http';
import {BehaviorSubject, interval, Observable, switchMap} from 'rxjs';
import * as spotbieGlobals from '../globals';
import {map, tap} from "rxjs/operators";
import {environment} from "../../environments/environment.prod";
import {ModalController} from "@ionic/angular";

const UPDATE_API = spotbieGlobals.API + 'business-app';

@Injectable({
  providedIn: 'root',
})
export class UpdateAppService {

  appNeedsUpdate$: Observable<boolean>;
  _downloaded$: BehaviorSubject<boolean | null | 'downloading'> = new BehaviorSubject<boolean | null | 'downloading'>(null);
  _progress$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  constructor(
    private http: HttpClient,
    private modalCtrl: ModalController
  ) {
    this.initUpdateCheck();
  }

  downloadApp(): Observable<any> {
    const updateApi = `${UPDATE_API}/download`;
    return this.http.get(updateApi, {
      reportProgress: true,
      observe: 'events',
    })
      .pipe(
        tap( event => {
          if (event.type === HttpEventType.DownloadProgress) {
            this.downloader(Math.round(100 * event.loaded / 151176512));
          } else if (event.type === HttpEventType.Response){
            this.downloader(event.body);
          }
        }),
    );
  }

  private downloader(progress: number): void {
    if (progress === 100) {
      // finished downloading?
      this._downloaded$.next(true);
    } else {
      this._progress$.next(progress);
      this._downloaded$.next('downloading');
    }
  }

  get progress$() {
    return this._progress$;
  }

  get downloaded$() {
    return this._downloaded$;
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
