import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {from, Observable, switchMap} from 'rxjs';
import {Preferences} from '@capacitor/preferences';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return from(Preferences.get({key: 'spotbiecom_session'})).pipe(
      switchMap(getRes => {
        const token = getRes.value;
        let modifiedReq;

        if (token && token !== 'null') {
          modifiedReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          modifiedReq = req.clone();
        }

        return next.handle(modifiedReq);
      })
    );
  }
}
