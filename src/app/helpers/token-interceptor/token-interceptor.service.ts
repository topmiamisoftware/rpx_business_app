import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from '../../../environments/environment.prod';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = localStorage.getItem('spotbiecom_session')

    let modifiedReq

    if(token && token !== '' && token !== 'null'){

      modifiedReq = req.clone({
        withCredentials: true,
        setHeaders: {
          Authorization : `Bearer ${token}`
        },
      });

    } else {
      modifiedReq = req.clone({
        withCredentials: true,
      });
    }

    return next.handle(modifiedReq);

  }

}
