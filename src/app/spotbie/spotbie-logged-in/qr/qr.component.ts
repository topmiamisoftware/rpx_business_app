import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AllowedAccountTypes } from '../../../helpers/enum/account-type.enum';
import { Business } from '../../../models/business';
import { LoyaltyPointsService } from '../../../services/loyalty-points/loyalty-points.service';
import { UserauthService } from '../../../services/userauth.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Redeemable } from '../../../models/redeemable';
import { RewardCreatorService } from '../../../services/spotbie-logged-in/business-menu/reward-creator/reward-creator.service';
import * as spotbieGlobals from '../../../globals';
import {Preferences} from "@capacitor/preferences";
import {BehaviorSubject} from "rxjs";

const QR_CODE_LOYALTY_POINTS_SCAN_BASE_URL = spotbieGlobals.API+'redeemable'

@Component({
  selector: 'app-qr',
  templateUrl: './qr.component.html',
  styleUrls: [
    './qr.component.css',
    '../reward-menu/reward-menu.component.css'
  ]
})
export class QrComponent implements OnInit {

  @Input() fullScreenWindow: boolean = false

  @Output() closeThisEvt = new EventEmitter()
  @Output() openUserLPBalanceEvt = new EventEmitter()
  @Output() closeQrUserEvt = new EventEmitter()
  @Output() notEnoughLpEvt = new EventEmitter()

  business = new Business()
  redeemable = new Redeemable()
  userHash$ =  new BehaviorSubject<string>(null);
  qrType$ =  new BehaviorSubject<string>('url');
  isBusiness$ = new BehaviorSubject<boolean>(false);
  userLoyaltyPoints$ = new BehaviorSubject<number>(0);
  loyaltyPointWorth$ = new BehaviorSubject<number>(0);
  businessLoyaltyPointsForm: UntypedFormGroup
  businessLoyaltyPointsFormUp$ = new BehaviorSubject<boolean>(false);
  rewardPrompted$ = new BehaviorSubject<boolean>(false);
  rewardPrompt$ = new BehaviorSubject<boolean>(false);
  loyaltyPointReward$ = new BehaviorSubject<number>(null);
  loyaltyPointRewardDollarValue$ = new BehaviorSubject<number>(null);
  qrCodeLink$ = new BehaviorSubject<string>(null);
  qrCodeLoyaltyPointsBaseUrl$= new BehaviorSubject<string>(QR_CODE_LOYALTY_POINTS_SCAN_BASE_URL);
  loyaltyPointBalance$ = new BehaviorSubject<any>(null);
  businessLoyaltyPointsSubmitted$ = new BehaviorSubject<boolean>(false);
  qrWidth: number = 320;
  totalSpentModified: number = 0;
  promptForRewardTimeout$ = new BehaviorSubject<any>(null);

  constructor(private userAuthService: UserauthService,
              private loyaltyPointsService: LoyaltyPointsService,
              private deviceDetectorService: DeviceDetectorService,
              private formBuilder: UntypedFormBuilder,
              private rewardService: RewardCreatorService) { }

  getWindowClass(){
    if(this.fullScreenWindow)
      return 'spotbie-overlay-window'
    else
      return ''
  }

  checkForSetLoyaltyPointSettings(){
    const lp = this.loyaltyPointBalance$.getValue();
    if( lp.balance === null ||
        lp.balance === 0    ||
        lp.balance === undefined )
    {
      // Open the users Loyalty Points Balance Window
      this.openUserLPBalanceEvt.emit();

      // Close the window if full-screened
      if(this.fullScreenWindow) {
        this.closeQr();
      }

      alert('First set a balance & dollar-to-loyalty point ratio.');
      return false;
    } else {
      return true;
    }
  }

  async startAwardProcess() {
    const lp = this.loyaltyPointBalance$.getValue();

    if (lp.balance === 0) {
      this.notEnoughLpEvt.emit();
      return;
    }

    this.businessLoyaltyPointsSubmitted$.next(true);

    if (this.businessLoyaltyPointsForm.invalid) {
      return;
    }

    const settingsCheck = await this.checkForSetLoyaltyPointSettings()

    if (!settingsCheck) {
      return;
    } else {
      this.createRedeemable();
    }
  }

  createRedeemable(){
    const percentValue: number = parseFloat(this.loyaltyPointBalance$.getValue().loyalty_point_dollar_percent_value.toString());

    this.loyaltyPointRewardDollarValue$.next(this.totalSpent * (percentValue / 100));
    this.loyaltyPointReward$.next((this.loyaltyPointRewardDollarValue$.getValue() * 100));

    this.rewardPrompt$.next(true);
  }

  yes(){
    const redeemableObj = {
      amount: this.loyaltyPointReward$.getValue(),
      total_spent: this.totalSpentModified,
      dollar_value: this.loyaltyPointRewardDollarValue$.getValue()
    };

    this.loyaltyPointsService.createRedeemable(redeemableObj).subscribe(resp => {
        this.createRedeemableCb(resp);
      });
  }

  createRedeemableCb(resp: any){
    if(resp.success){
      this.redeemable.uuid = `${this.qrCodeLoyaltyPointsBaseUrl$.getValue()}?&r=${resp.redeemable.uuid}&t=lp`
      this.promptForRewardTimeout$.next(null);

      this.rewardPrompt$.next(false);
      this.rewardPrompted$.next(true);
    } else {
      alert(resp.message);
    }
  }

  no(){
    this.rewardPrompt$.next(false);
    this.rewardPrompted$.next(false);
  }

  get totalSpent() { return this.businessLoyaltyPointsForm.get('totalSpent').value }
  get f() { return this.businessLoyaltyPointsForm.controls }

  getQrCode(){
    this.loyaltyPointsService.getLoyaltyPointBalance();

    this.userAuthService.getSettings().subscribe(resp => {
        this.userHash$.next(resp.user.hash);
        this.business.address = resp.business.address
        this.business.name = resp.business.name
        this.business.qr_code_link = resp.business.qr_code_link
        this.business.trial_ends_at = resp.business.trial_ends_at
       });

    const totalSpentValidators = [Validators.required];

    this.businessLoyaltyPointsForm = this.formBuilder.group({
      totalSpent: ['', totalSpentValidators]
    });

    this.businessLoyaltyPointsFormUp$.next(true);
  }

  startQrCodeScanner(){
    this.loyaltyPointsService.getLoyaltyPointBalance();
    this.isBusiness$.next(false);
  }

  closeQr(){
    this.rewardPrompted$.next(false);
  }

  closeQrUser(){
    this.closeQrUserEvt.emit(null);
  }

  async ngOnInit() {
    let a = await Preferences.get({key: 'spotbie_userType'});
    let accountType = parseInt(a.value, 10);

    if (accountType === AllowedAccountTypes.Personal) {
      this.loyaltyPointsService.userLoyaltyPoints$.subscribe(loyaltyPointBalance => {
        this.userLoyaltyPoints$.next(loyaltyPointBalance);
      });
      this.startQrCodeScanner();
    } else {
      this.loyaltyPointsService.userLoyaltyPoints$.subscribe(loyaltyPointBalance => {
        this.loyaltyPointBalance$.next(loyaltyPointBalance);
      });
      this.isBusiness$.next(true);
      this.getQrCode();
    }
  }
}
