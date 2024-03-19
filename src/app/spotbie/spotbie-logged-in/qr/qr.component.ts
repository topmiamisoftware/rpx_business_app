import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Business } from '../../../models/business';
import { LoyaltyPointsService } from '../../../services/loyalty-points/loyalty-points.service';
import { UserauthService } from '../../../services/userauth.service';
import { Redeemable } from '../../../models/redeemable';
import * as spotbieGlobals from '../../../globals';
import {BehaviorSubject} from "rxjs";
import {BusinessLoyaltyPointsState} from "../state/business.lp.state";
import {Platform} from "@ionic/angular";

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

  @Output() closeThisEvt = new EventEmitter()
  @Output() openUserLPBalanceEvt = new EventEmitter()
  @Output() closeQrUserEvt = new EventEmitter()
  @Output() notEnoughLpEvt = new EventEmitter()

  business = new Business()
  redeemable = new Redeemable()
  userHash$ =  new BehaviorSubject<string>(null);
  isBusiness$ = new BehaviorSubject<boolean>(false);
  businessLoyaltyPointsForm: UntypedFormGroup
  businessLoyaltyPointsFormUp$ = new BehaviorSubject<boolean>(false);
  rewardPrompted$ = new BehaviorSubject<boolean>(false);
  rewardPrompt$ = new BehaviorSubject<boolean>(false);
  loyaltyPointReward$ = new BehaviorSubject<number>(null);
  loyaltyPointRewardDollarValue$ = new BehaviorSubject<number>(null);
  qrCodeLoyaltyPointsBaseUrl$= new BehaviorSubject<string>(QR_CODE_LOYALTY_POINTS_SCAN_BASE_URL);
  loyaltyPointBalance$ = new BehaviorSubject<any>(null);
  businessLoyaltyPointsSubmitted$ = new BehaviorSubject<boolean>(false);
  qrWidth: number = 320;
  totalSpentModified: number = 0;
  promptForRewardTimeout$ = new BehaviorSubject<any>(null);

  constructor(private userAuthService: UserauthService,
              private loyaltyPointsService: LoyaltyPointsService,
              private formBuilder: UntypedFormBuilder,
              private platform: Platform,
              private businessLoyaltyPointsState: BusinessLoyaltyPointsState) {
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.rewardPrompt$.next(false);
      this.rewardPrompted$.next(false);
    });
  }

  async ngOnInit() {
    this.loyaltyPointBalance$.next(this.businessLoyaltyPointsState.getState());
    this.isBusiness$.next(true);
    this.getQrCode();
  }

  async startAwardProcess() {
    this.businessLoyaltyPointsSubmitted$.next(true);

    if (this.businessLoyaltyPointsForm.invalid) {
      return;
    }

    this.createRedeemable();
  }

  createRedeemable(){
    const percentValue: number = parseFloat(this.loyaltyPointBalance$.getValue().loyalty_point_dollar_percent_value.toString());

    this.loyaltyPointRewardDollarValue$.next(this.totalSpent * (percentValue / 100));
    this.loyaltyPointReward$.next((this.loyaltyPointRewardDollarValue$.getValue() * 100) / percentValue);

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

  closeQr(){
    this.rewardPrompted$.next(false);
  }
}
