import {Component, OnInit, ViewChild} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LoyaltyPointsService } from '../../../services/loyalty-points/loyalty-points.service';
import { UserauthService } from '../../../services/userauth.service';
import {BehaviorSubject, debounceTime, EMPTY, Observable, of, scan, Subscription, switchMap} from "rxjs";
import {BusinessLoyaltyPointsState} from "../state/business.lp.state";
import {catchError, filter, tap} from "rxjs/operators";
import {User} from "../../../models/user";
import {SpotbieUser} from "../../../models/spotbieuser";
import {ToastController} from "@ionic/angular";

export interface UserForBusiness {
  user: User;
  spotbie_user: SpotbieUser;
  lp_in_business: {balance: number, balance_aggregate: number};
  lp_balance: {balance: number};
}

@Component({
  selector: 'app-user-set-up',
  templateUrl: './user-set-up.component.html',
  styleUrls: [
    './user-set-up.component.css',
    '../reward-menu/reward-menu.component.css'
  ]
})
export class UserSetUpComponent implements OnInit {

  @ViewChild('phoneNumberLabel') phoneNumberLabel;
  @ViewChild('spotbieSignUpIssues') spotbieSignUpIssues;

  accountLookUpForm: UntypedFormGroup;
  accountLookUpFormUp$ = new BehaviorSubject<boolean>(false);
  accountLookUpFormSubmitted$ = new BehaviorSubject<boolean>(false);

  createUserButton$ = new BehaviorSubject<boolean>(false);

  accountSetUpForm: UntypedFormGroup;
  accountSetUpFormUp$ = new BehaviorSubject<boolean>(false);
  accountSetUpFormSubmitted$ = new BehaviorSubject<boolean>(false);

  loading$ = new BehaviorSubject<boolean>(false);
  user$ = new BehaviorSubject<UserForBusiness>(null);
  showLpAward$ = new BehaviorSubject<boolean>(false);
  awardLpPoints$ = new BehaviorSubject<boolean>(false);
  signingUp$ = new BehaviorSubject<boolean>(false);

  tapEvent$ = new BehaviorSubject(null);
  tapEventSub$: Subscription;

  constructor(private userAuthService: UserauthService,
              private loyaltyPointsService: LoyaltyPointsService,
              private formBuilder: UntypedFormBuilder,
              private businessLoyaltyPointsState: BusinessLoyaltyPointsState,
              private toastService: ToastController) {
    this.setUpLpTapButton();
  }

  async ngOnInit() {
    this.initCustomerLookUp();
  }

  get customerEmail() { return this.accountSetUpForm.get('customerEmail').value }
  get customerFirstName() { return this.accountSetUpForm.get('customerFirstName').value }
  get h() { return this.accountSetUpForm.controls }

  initCustomerSetUp() {
    const customerEmailValidators = [Validators.required, Validators.email];
    const customerNameValidators = [Validators.required];

    this.accountSetUpForm = this.formBuilder.group({
      customerEmail: ['', customerEmailValidators],
      customerFirstName: ['', customerNameValidators],
    });

    this.accountSetUpFormUp$.next(true);
  }

  createAccount() {
    this.accountSetUpFormSubmitted$.next(true);
    this.accountSetUpForm.updateValueAndValidity();

    if (this.accountSetUpForm.invalid) {
      return;
    }

    this.userAuthService.creatAccount({
      firstName: this.customerFirstName,
      email: this.customerEmail,
      phone_number: '+1'+this.customerPhoneNumber
    }).pipe(
      catchError(this.signUpError()),
    ).subscribe((resp) => {
      this.setUpCallback(resp);
    });
  }

  get customerPhoneNumber() { return this.accountLookUpForm.get('customerPhoneNumber').value }
  get g() { return this.accountLookUpForm.controls }

  initCustomerLookUp() {
    const customerPhoneNumberValidators = [Validators.required];

    this.accountLookUpForm = this.formBuilder.group({
      customerPhoneNumber: ['', customerPhoneNumberValidators]
    });

    this.accountLookUpFormUp$.next(true);
  }

  createUser() {
    this.accountLookUpFormUp$.next(false);

    this.initCustomerSetUp();
  }

  private async setUpCallback(resp: any) {
    const signUpInstructions = this.spotbieSignUpIssues.nativeElement;

    if (resp?.message === 'success') {
      signUpInstructions.innerHTML = "User account created successfully.";
      this.lookEmUpServiceCall();

      setTimeout(() => {
        this.accountSetUpFormUp$.next(false);
      }, 2300);
    } else {

      const toast = await this.toastService.create({
        message: 'There was an error creating the account.',
        duration: 1500,
        position: 'bottom',
      });
      await toast.present();
      return of(resp);
    }

    this.loading$.next(false);
    this.signingUp$.next(false);
  }

  signUpError<T>(operation = 'operation', result?: T) {
    this.signingUp$.next(false);
    this.loading$.next(false);

    return (error: any): Observable<T> => {
      const signUpInstructions = this.spotbieSignUpIssues.nativeElement;
      signUpInstructions.style.display = 'none';

      const errorList = error.error.errors;

      if (errorList?.email) {
        const errors: {[k: string]: any} = {};
        errorList.email.forEach(error => {
          errors[error] = true;
        });
        this.accountSetUpForm.get('customerEmail').setErrors(errors);
        document.getElementById('user_email').style.border = '1px solid red';
      } else {
        document.getElementById('user_email').style.border = 'unset';
      }

      this.signingUp$.next(false);

      setTimeout(() => {
        signUpInstructions.style.display = 'block';
      }, 200);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  lookEmUp() {
    this.user$.next(null);

    if (this.accountLookUpForm.invalid) {
      return;
    } else {
      this.phoneNumberLabel.nativeElement.innerHTML = 'Enter the customer\'s phone number.';
    }

    this.lookEmUpServiceCall();
  }

  lookEmUpServiceCall() {
    this.loyaltyPointsService.lookUpCustomer('+1'+this.customerPhoneNumber)
      .pipe(
        debounceTime(2000),
        catchError((err) => {
          this.phoneNumberLabel.nativeElement.innerHTML = err.message;
          return EMPTY;
        }),
        filter((res) => !!res),
        tap((res: {
          message: string,
          user: User,
          spotbie_user: SpotbieUser,
          lp_in_business: any,
          lp_balance: any
        }) => {
          if (res && res.user && res.spotbie_user) {
            this.user$.next({
              user: res.user,
              spotbie_user: res.spotbie_user,
              lp_balance: res.lp_balance,
              lp_in_business: res.lp_in_business
            });
            this.accountLookUpFormUp$.next(false);
            this.awardLpPoints$.next(true);
          } else {
            this.createUserButton$.next(true);
            this.phoneNumberLabel.nativeElement.innerHTML = 'Phone number not found.';
          }
        }),
      )
      .subscribe();
  }

  userAwarded() {
    this.lookEmUpServiceCall();
  }

  tapForLp($event) {
    this.tapEvent$.next(0);
  }

  goBack() {
    this.showLpAward$.next(false);
    this.setUpLpTapButton();
    this.accountLookUpFormUp$.next(true);
    this.awardLpPoints$.next(false);
    this.accountSetUpFormUp$.next(false);
    this.accountLookUpForm.reset();
    this.accountLookUpForm.setErrors(null);
    this.createUserButton$.next(false);
  }

  setUpLpTapButton(){
    this.tapEventSub$ = this.tapEvent$.pipe(
      scan((count: number) => (count > 4) ? 0 : count + 1, 0),
      switchMap((a) => {
        if (a === 5) {
          this.showLpAward$.next(true);
          return of(0);
        }
        return of(a);
      }),
    ).subscribe();
  }

  removeWhiteSpace(key) {
    this.accountSetUpForm.get(key).setValue(this.accountSetUpForm.get(key).value.trim());
  }
}
