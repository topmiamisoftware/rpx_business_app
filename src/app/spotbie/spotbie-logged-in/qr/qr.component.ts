import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AllowedAccountTypes } from 'src/app/helpers/enum/account-type.enum';
import { LoyaltyPointBalance } from 'src/app/models/loyalty-point-balance';
import { Business } from 'src/app/models/business';
import { LoyaltyPointsService } from 'src/app/services/loyalty-points/loyalty-points.service';
import { UserauthService } from 'src/app/services/userauth.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Redeemable } from 'src/app/models/redeemable';
import { RewardCreatorService } from 'src/app/services/spotbie-logged-in/business-menu/reward-creator/reward-creator.service';
import { Reward } from 'src/app/models/reward';
import { map } from 'rxjs/operators';
import * as spotbieGlobals from '../../../globals';

const QR_CODE_LOYALTY_POINTS_SCAN_BASE_URL = spotbieGlobals.API+'redeemable'

@Component({
  selector: 'app-qr',
  templateUrl: './qr.component.html',
  styleUrls: ['./qr.component.css', '../reward-menu/reward-menu.component.css']
})
export class QrComponent implements OnInit {

  @Input() fullScreenWindow: boolean = false

  @Output() closeThisEvt = new EventEmitter()
  @Output() openUserLPBalanceEvt = new EventEmitter()
  @Output() closeQrUserEvt = new EventEmitter()
  @Output() notEnoughLpEvt = new EventEmitter()

  @ViewChild('sbEarnedPoints') sbEarnedPoints: ElementRef

  business = new Business()
  redeemable = new Redeemable()
  userHash: string = null
  qrType: string = 'url'
  isBusiness: boolean = false
  userLoyaltyPoints: any = 0
  loyaltyPointWorth: number = 0
  businessLoyaltyPointsForm: UntypedFormGroup
  businessLoyaltyPointsFormUp: boolean = false
  rewardPrompted: boolean = false
  promptForRewardTimeout
  rewardPrompt: boolean = false
  loyaltyPointReward: number = null
  loyaltyPointRewardDollarValue: number = null
  qrCodeLink: string = null
  qrCodeLoyaltyPointsBaseUrl: string = QR_CODE_LOYALTY_POINTS_SCAN_BASE_URL
  loyaltyPointBalance: any;
  businessLoyaltyPointsSubmitted: boolean = false
  qrWidth: number = 0
  scanSuccess: boolean = false
  awarded: boolean = false
  reward: Reward = null
  rewarded: boolean = false
  pointsCharged: number
  totalSpentModified: number = 0;

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
    if( this.loyaltyPointBalance.balance === null ||
        this.loyaltyPointBalance.balance === 0    ||
        this.loyaltyPointBalance.balance === undefined )
    {
      // Open the users Loyalty Points Balance Window
      this.openUserLPBalanceEvt.emit()

      // Close the window if full-screened
      if(this.fullScreenWindow) this.closeQr()

      alert('First set a balance & dollar-to-loyalty point ratio.')
      return false
    } else {
      return true
    }
  }

  async startAwardProcess() {
    if (this.loyaltyPointBalance.balance === 0) {
      this.notEnoughLpEvt.emit()
      return
    }

    this.businessLoyaltyPointsSubmitted = true

    if (this.businessLoyaltyPointsForm.invalid) return

    const settingsCheck = await this.checkForSetLoyaltyPointSettings()

    if (!settingsCheck) {
      return
    } else {
      this.createRedeemable()
    }
  }

  createRedeemable(){
    const percentValue: number = parseFloat(this.loyaltyPointBalance.loyalty_point_dollar_percent_value.toString())

    this.totalSpentModified = this.totalSpent;
    if(this.totalSpent > 90) {
      this.totalSpentModified = 90;
    }

    this.loyaltyPointRewardDollarValue = this.totalSpentModified * (percentValue / 100);
    this.loyaltyPointReward = (this.loyaltyPointRewardDollarValue * 100);

    this.rewardPrompt = true
  }

  yes(){
    const redeemableObj = {
      amount: this.loyaltyPointReward,
      total_spent: this.totalSpentModified,
      dollar_value: this.loyaltyPointRewardDollarValue
    }

    this.loyaltyPointsService.createRedeemable(redeemableObj).subscribe(resp =>{
        this.createRedeemableCb(resp)
      })
  }

  createRedeemableCb(resp: any){
    if(resp.success){
      this.redeemable.uuid = `${this.qrCodeLoyaltyPointsBaseUrl}?&r=${resp.redeemable.uuid}&t=lp`
      this.promptForRewardTimeout = null

      this.rewardPrompt = false
      this.rewardPrompted = true
    } else
      alert(resp.message)

  }

  addLp(addLpObj){
    this.loyaltyPointsService.addLoyaltyPoints(addLpObj, (resp) => {
        this.scanSuccessHandlerCb(resp)
      })
  }

  claimReward(addLpObj){
    this.rewardService.claimReward(addLpObj, (resp) => {
        this.claimRewardCb(resp)
      })
  }

  claimRewardCb(resp){
    if(resp.success){
      this.rewarded = true
      this.reward = resp.reward
      this.pointsCharged = this.reward.point_cost
      this.sbEarnedPoints.nativeElement.style.display = 'block'
    } else {
      alert(resp.message)
    }
    this.scanSuccess = false
  }

  scanSuccessHandler(urlString: string){
    if(this.scanSuccess) return

    this.scanSuccess = true

    const url = new URL(urlString)
    const urlParams = new URLSearchParams(url.search)
    const redeemableType = urlParams.get('t')
    const addLpObj = {
      redeemableHash: urlParams.get('r'),
      redeemableType
    }

    switch(redeemableType) {
      case 'lp':
        this.addLp(addLpObj)
        break
      case 'claim_reward':
        this.claimReward(addLpObj)
        break
    }
  }

  scanSuccessHandlerCb(resp: any){
    if(resp.success){
      this.awarded = true
      this.userLoyaltyPoints = resp.redeemable.amount
      this.sbEarnedPoints.nativeElement.style.display = 'block'
    } else {
      alert(resp.message)
    }
    this.scanSuccess = false
  }

  scanErrorHandler(event){
    console.log('scan error', event)
  }

  scanFailureHandler(event){
    console.log('scan failure', event)
  }

  no(){
    this.rewardPrompt = false
    this.rewardPrompted = false
  }

  get totalSpent() { return this.businessLoyaltyPointsForm.get('totalSpent').value }
  get f() { return this.businessLoyaltyPointsForm.controls }

  getQrCode(){
    this.loyaltyPointsService.getLoyaltyPointBalance()

    this.userAuthService.getSettings().subscribe(resp => {
        this.userHash = resp.user.hash
        this.business.address = resp.business.address
        this.business.name = resp.business.name
        this.business.qr_code_link = resp.business.qr_code_link
        this.business.trial_ends_at = resp.business.trial_ends_at
       })

    const totalSpentValidators = [Validators.required]

    this.businessLoyaltyPointsForm = this.formBuilder.group({
      totalSpent: ['', totalSpentValidators]
    })

    this.businessLoyaltyPointsFormUp = true
  }

  startQrCodeScanner(){
    this.loyaltyPointsService.getLoyaltyPointBalance()
    this.isBusiness = false
  }

  closeQr(){
    this.rewardPrompted = false
  }

  closeQrUser(){
    this.closeQrUserEvt.emit(null)
  }

  ngOnInit(): void {
    if (this.deviceDetectorService.isMobile())
      this.qrWidth = 250
    else
      this.qrWidth = 450

    const accountType = parseInt(localStorage.getItem('spotbie_userType'), 10)

    if (accountType === AllowedAccountTypes.Personal) {
      this.loyaltyPointsService.userLoyaltyPoints$.subscribe(loyaltyPointBalance => {
        this.userLoyaltyPoints = loyaltyPointBalance
      });
      this.startQrCodeScanner()
    } else {
      this.loyaltyPointsService.userLoyaltyPoints$.subscribe(loyaltyPointBalance => {
        this.loyaltyPointBalance = loyaltyPointBalance
      });
      this.isBusiness = true
      this.getQrCode()
    }
  }
}
