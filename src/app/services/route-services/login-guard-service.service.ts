import { Injectable } from '@angular/core'
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { logOutCallback } from 'src/app/helpers/logout-callback'
import { UserauthService } from '../userauth.service'

@Injectable({
  providedIn: 'root'
})
export class LoginGuardServiceService {

  constructor(private router: Router,
              private userAuthService: UserauthService) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    await this.userAuthService.checkIfLoggedIn().then((reason) => {
      if (reason.message === '1') {
        return true;
      } else {
        logOutCallback({success : true});
        return false;
      }
    }, (reason) => {
      return true;
    });
  }
}
