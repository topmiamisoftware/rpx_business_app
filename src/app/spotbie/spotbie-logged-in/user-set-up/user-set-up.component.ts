import {Component, OnInit, ViewChild} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LoyaltyPointsService } from '../../../services/loyalty-points/loyalty-points.service';
import { UserauthService } from '../../../services/userauth.service';
import {BehaviorSubject, debounceTime, EMPTY} from "rxjs";
import {BusinessLoyaltyPointsState} from "../state/business.lp.state";
import {catchError, filter, tap} from "rxjs/operators";
import {User} from "../../../models/user";
import {SpotbieUser} from "../../../models/spotbieuser";

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

  accountLookUpForm: UntypedFormGroup;
  accountLookUpFormUp$ = new BehaviorSubject<boolean>(false);
  accountLookUpFormSubmitted$ = new BehaviorSubject<boolean>(false);

  createUserButton$ = new BehaviorSubject<boolean>(false);

  accountSetUpForm: UntypedFormGroup;
  accountSetUpFormUp$ = new BehaviorSubject<boolean>(false);
  accountSetUpFormSubmitted$ = new BehaviorSubject<boolean>(false);

  loading$ = new BehaviorSubject<boolean>(false);

  user$ = new BehaviorSubject<UserForBusiness>(null);

  awardLpPoints$ = new BehaviorSubject<boolean>(false);

  constructor(private userAuthService: UserauthService,
              private loyaltyPointsService: LoyaltyPointsService,
              private formBuilder: UntypedFormBuilder,
              private businessLoyaltyPointsState: BusinessLoyaltyPointsState) {
  }

  async ngOnInit() {
    this.initCustomerLookUp();
  }

  get customerEmail() { return this.accountSetUpForm.get('customerEmail').value }
  get customerFirstName() { return this.accountSetUpForm.get('customerFirstName').value }
  get h() { return this.accountSetUpForm.controls }

  initCustomerSetUp() {
    const customerPhoneNumberValidators = [Validators.required];

    this.accountLookUpForm = this.formBuilder.group({
      customerPhoneNumber: ['', customerPhoneNumberValidators]
    });

    this.accountSetUpFormUp$.next(true);
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

  lookEmUp() {
    this.user$.next(null);

    if (this.accountLookUpForm.invalid) {
      return;
    } else {
      this.phoneNumberLabel.nativeElement.innerHTML = 'Enter the customer\'s phone number.';
    }

    this.loyaltyPointsService.lookUpCustomer(this.customerPhoneNumber)
      .pipe(
        debounceTime(2000),
        catchError((err) => {
          this.createUserButton$.next(true);
          this.phoneNumberLabel.nativeElement.innerHTML = 'Phone number not found.';
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
          }
        }),
      )
      .subscribe();
  }

  goBack() {
    this.accountLookUpFormUp$.next(true);
    this.awardLpPoints$.next(false);
    this.accountSetUpFormUp$.next(false);
    this.accountLookUpForm.reset();
  }
}
