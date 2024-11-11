import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {handleError} from '../helpers/error-helper';
import {User} from '../models/user';

import * as spotbieGlobals from '../globals';
import {AllowedAccountTypes} from "../helpers/enum/account-type.enum";
import {Business} from "../models/business";

const USER_API = spotbieGlobals.API + 'user';
const BUSINESS_API = spotbieGlobals.API + 'business'

@Injectable({
  providedIn: 'root',
})
export class UserauthService {
  userRememberMe: string;
  userTimezone: string;
  route: string;
  userProfile: User;
  userProfile$ = new BehaviorSubject<User>(null);

  constructor(private http: HttpClient) {}

  async checkIfLoggedIn(): Promise<any> {
    const checkLoginObject = {};
    const loginApi = `${USER_API}/check-user-auth`;

    return new Promise((resolve, reject) => {
      this.http.post<any>(loginApi, checkLoginObject).subscribe(resp => {
        if (resp.message === '1') {
          resolve(resp);
        } else {
          reject();
        }
      });
    });
  }

  verifyBusiness(businessInfo: any): Observable<any>{
    let apiUrl

    switch(businessInfo.accountType){
      case AllowedAccountTypes.PlaceToEat:
      case AllowedAccountTypes.Shopping:
      case AllowedAccountTypes.Events:
        apiUrl = `${BUSINESS_API}/verify`
        break
    }

    const businessInfoObj = {
      name: businessInfo.name,
      description: businessInfo.description,
      address: businessInfo.address,
      photo: businessInfo.photo,
      loc_x: businessInfo.loc_x,
      loc_y: businessInfo.loc_y,
      passkey: businessInfo.passkey,
      categories: businessInfo.categories,
      city: businessInfo.city,
      country: businessInfo.country,
      line1: businessInfo.line1,
      line2: businessInfo.line2,
      postal_code: businessInfo.postal_code,
      state: businessInfo.state,
      accountType: businessInfo.accountType,
      is_food_truck: Boolean(businessInfo.is_food_truck),
      lp_rate: businessInfo.lp_rate,
    }

    return this.http.post<any>(apiUrl, businessInfoObj)
      .pipe(
        catchError(handleError('verifyBusiness'))
      )
  }

  saveBusiness(businessInfo: any): Observable<any>{
    let apiUrl

    switch(businessInfo.accountType){
      case AllowedAccountTypes.PlaceToEat:
      case AllowedAccountTypes.Shopping:
      case AllowedAccountTypes.Events:
        apiUrl = `${BUSINESS_API}/save-business`
        break
    }

    const businessInfoObj = {
      name: businessInfo.name,
      description: businessInfo.description,
      address: businessInfo.address,
      photo: businessInfo.photo,
      loc_x: businessInfo.loc_x,
      loc_y: businessInfo.loc_y,
      categories: businessInfo.categories,
      city: businessInfo.city,
      country: businessInfo.country,
      line1: businessInfo.line1,
      line2: businessInfo.line2,
      postal_code: businessInfo.postal_code,
      state: businessInfo.state,
      accountType: businessInfo.accountType,
      is_food_truck: businessInfo.is_food_truck,
    }

    return this.http.post<any>(apiUrl, businessInfoObj)
      .pipe(
        catchError(handleError('saveBusiness'))
      )
  }

  logOut(): Observable<any> {
    const logOutApi = `${USER_API}/logout`;
    return this.http.post<any>(logOutApi, null);
  }

  initLogin(
    userLogin: string,
    userPassword: string,
    userRememberMe: string
  ): Observable<any> {
    this.userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const params = {
      login: userLogin,
      password: userPassword,
      remember_me_opt: userRememberMe,
      timezone: this.userTimezone,
      route: '/business',
    };

    const logInApi = `${USER_API}/login`;

    return this.http.post<any>(logInApi, params).pipe(
      catchError(err => {
        throw err;
      })
    );
  }

  getSettings(): Observable<any> {
    const getSettingsApi = `${USER_API}/settings`;

    return this.http.post<any>(getSettingsApi, null).pipe(
      tap(settings => {
        this.userProfile = settings;
        this.userProfile$.next(this.userProfile);
      }),
      catchError(err => {
        throw err;
      })
    );
  }

  saveSettings(user: User): Observable<any> {
    const saveSettingsApi = `${USER_API}/update`;

    let saveSettingsObj;

    if (!user.business) {
      saveSettingsObj = {
        username: user.username,
        email: user.email,
        first_name: user.spotbie_user.first_name,
        last_name: user.spotbie_user.last_name,
        phone_number: user.spotbie_user.phone_number,
        ghost_mode: user.spotbie_user.ghost_mode,
        privacy: user.spotbie_user.privacy,
        account_type: user.spotbie_user.user_type,
        sms_opt_in: false
      };
    } else {
      saveSettingsObj = {
        username: user.username,
        email: user.email,
        first_name: user.spotbie_user.first_name,
        last_name: user.spotbie_user.last_name,
        phone_number: user.spotbie_user.phone_number,
        ghost_mode: user.spotbie_user.ghost_mode,
        privacy: user.spotbie_user.privacy,
        account_type: user.spotbie_user.user_type,
        origin_description: user.business.description,
        origin_address: user.business.address,
        origin_title: user.business.name,
        origin_x: user.business.loc_x,
        origin_y: user.business.loc_y,
        sms_opt_in: false,
      };
    }

    return this.http.put<any>(saveSettingsApi, saveSettingsObj).pipe(
      catchError(err => {
        throw err;
      })
    );
  }

  setPassResetPin(emailOrPhone: string): Observable<any> {
    const resetPasswordApi = `${USER_API}/send-pass-email`;
    const setPassResetObj = {
      email: emailOrPhone,
    };

    return this.http.post<any>(resetPasswordApi, setPassResetObj).pipe(
      catchError(err => {
        throw err;
      })
    );
  }

  creatAccount(account: AccountCreation): Observable<any> {
    return this.http.post(`${USER_API}/create-user`, account);
  }

  completeReset(
    password: string,
    passwordConfirmation: string,
    email: string,
    token: string
  ): Observable<any> {
    const resetPasswordApi = `${USER_API}/complete-pass-reset`;
    const passResetObj = {
      _method: 'PUT',
      password,
      password_confirmation: passwordConfirmation,
      email,
      token,
    };

    return this.http
      .post<any>(resetPasswordApi, passResetObj)
      .pipe(catchError(handleError('completeReset')));
  }

  passwordChange(passwordChangeObj: any): Observable<any> {
    const resetPasswordApi = `${USER_API}/change-password`;

    const passResetObj = {
      _method: 'PUT',
      password: passwordChangeObj.password,
      password_confirmation: passwordChangeObj.passwordConfirmation,
      current_password: passwordChangeObj.currentPassword,
    };

    return this.http
      .post<any>(resetPasswordApi, passResetObj)
      .pipe(catchError(handleError('passwordChange')));
  }

  deactivateAccount(
    password: string,
    is_social_account: boolean
  ): Observable<any> {
    const resetPasswordApi = `${USER_API}/deactivate`;
    const passResetObj = {
      _method: 'DELETE',
      password,
      is_social_account,
    };

    return this.http
      .post<any>(resetPasswordApi, passResetObj)
      .pipe(catchError(handleError('deactivateAccount')));
  }

  saveLocation(businessInfo: any): Observable<any> {
    const apiUrl = `${BUSINESS_API}/save-location`;

    const businessInfoObj = {
      address: businessInfo.address,
      photo: businessInfo.photo,
      loc_x: businessInfo.loc_x,
      loc_y: businessInfo.loc_y,
      city: businessInfo.city,
      country: businessInfo.country,
      line1: businessInfo.line1,
      line2: businessInfo.line2,
      postal_code: businessInfo.postal_code,
      state: businessInfo.state,
    };

    return this.http
      .put<any>(apiUrl, businessInfoObj)
      .pipe(catchError(handleError('saveLocation')));
  }
}

export interface AccountCreation {
  email: string,
  phone_number: string,
  firstName: string,
  promotion: {
    timeRangeOne: string,
    timeRangeTwo: string,
    timeRangeThree: string,
    day: string,
    businessId: string,
  },
}
