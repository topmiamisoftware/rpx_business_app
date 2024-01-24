import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountTypes } from '../../../helpers/enum/account-type.enum';
import { LoyaltyPointBalance } from '../../../models/loyalty-point-balance';
import { LoyaltyPointsService } from '../../../services/loyalty-points/loyalty-points.service';
import {Preferences} from "@capacitor/preferences";

@Component({
  selector: 'app-loyalty-points',
  templateUrl: './loyalty-points.component.html',
  styleUrls: ['./loyalty-points.component.css']
})
export class LoyaltyPointsComponent implements OnInit {

  @Output() closeWindow = new EventEmitter();
  @Output() openRedeemed = new EventEmitter();

  @Input() fullScreenWindow: boolean = true;

  @ViewChild('newBalanceLoyaltyPoints') newBalanceLoyaltyPoints;
  @ViewChild('businessLoyaltyPointsInfo') businessLoyaltyPointsInfo;
  // @ViewChild('businessLoyaltyTierInfo') businessLoyaltyTierInfo;

  eAllowedAccountTypes = AccountTypes;
  loading = false;
  userPointToDollarRatio: number | string = 0;
  businessLoyaltyPointsOpen = false;
  personalLoyaltyPointsOpen = false;
  businessLoyaltyPointsForm: UntypedFormGroup;
  businessLoyaltyPointsFormUp = false;
  monthlyDollarValueCalculated = false;
  openTiers = false;
  helpEnabled = false;
  qrCodeLink: string = null;
  userHash: string = null;
  loyaltyPointReward: number = null;
  totalSpent: number = null;
  newUserLoyaltyPoints: number;
  userType: number = null;
  loyaltyPointBalance: any = 0;
  loyaltyPointBalanceBusiness: any = new LoyaltyPointBalance();

  constructor(private loyaltyPointsService: LoyaltyPointsService,
              private formBuilder: UntypedFormBuilder,
              private router: Router,
              route: ActivatedRoute){
      if(this.router.url.indexOf('scan') > -1) {
         this.qrCodeLink = route.snapshot.params.qrCode;
         this.loyaltyPointReward = route.snapshot.params.loyaltyPointReward;
         this.totalSpent = route.snapshot.params.totalSpent;
         this.userHash = route.snapshot.params.userHash;
      }
  }

  getWindowClass(){
    if(this.fullScreenWindow)
      return 'spotbie-overlay-window d-flex align-items-center justify-content-center'
    else
      return ''
  }

  async getLoyaltyPointBalance(){
    await this.loyaltyPointsService.getLoyaltyPointBalance();
  }

  loyaltyPointsClass(){
    if( this.userType !== AccountTypes.Personal)
      return 'sb-loyalty-points cursor-pointer'
    else
      return 'sb-loyalty-points no-cursor'
  }

  get businessLoyaltyPoints() {return this.businessLoyaltyPointsForm.get('businessLoyaltyPoints').value }
  get businessCoinPercentage() {return this.businessLoyaltyPointsForm.get('businessCoinPercentage').value }
  get f() { return this.businessLoyaltyPointsForm.controls }

  initBusinessLoyaltyPoints() {
    if(this.userType === AccountTypes.Personal){
      this.openRedeemed.emit();
      return;
    }
    this.businessLoyaltyPointsOpen = true

    const coinValidators = [Validators.required];
    const businessCoinPercentageValidators = [Validators.required];

    this.businessLoyaltyPointsForm = this.formBuilder.group({
      businessLoyaltyPoints: ['', coinValidators],
      businessCoinPercentage: ['', businessCoinPercentageValidators],
    });

    this.businessLoyaltyPointsForm.get('businessLoyaltyPoints').setValue(this.loyaltyPointBalanceBusiness.reset_balance);
    this.businessLoyaltyPointsForm.get('businessCoinPercentage').setValue(this.loyaltyPointBalanceBusiness.loyalty_point_dollar_percent_value);

    this.calculateDollarValue();

    this.businessLoyaltyPointsFormUp = true;
    this.loading = false;
  }

  calculateDollarValue(){
    const monthlyPoints: number = this.businessLoyaltyPoints;
    const pointPercentage: number = this.businessCoinPercentage;

    if(pointPercentage === 0) {
      this.userPointToDollarRatio = 0;
    } else {
      this.userPointToDollarRatio = (monthlyPoints * (pointPercentage / 100)).toFixed(2);
    }

    this.monthlyDollarValueCalculated = true
  }

  closeBusinessLoyaltyPoints(){
    this.businessLoyaltyPointsOpen = false;
    this.monthlyDollarValueCalculated = false;
    this.businessLoyaltyPointsForm = null;
    this.businessLoyaltyPointsFormUp = false;
  }

  closeThis(){
    if(this.router.url.indexOf('scan') > -1) {
      this.router.navigate(['/user-home']);
    } else {
      this.closeWindow.emit();
    }
  }

  toggleHelp(){
    this.helpEnabled = !this.helpEnabled;
  }

  async ngOnInit() {
    let accountType = await Preferences.get({key: 'spotbie_userType'});
    this.userType = parseInt(accountType.value, 10);

    if(this.userType === AccountTypes.Personal){
      this.loyaltyPointsService.userLoyaltyPoints$.subscribe(loyaltyPointBalance => {
        this.loyaltyPointBalance = loyaltyPointBalance;
      });
    } else {
      this.loyaltyPointsService.userLoyaltyPoints$.subscribe(loyaltyPointBalance => {
        this.loyaltyPointBalanceBusiness = loyaltyPointBalance;
      });
    }

    this.loading = false;
    this.getLoyaltyPointBalance();
  }

  bgStyle() {
    return { background: 'linear-gradient(90deg,#35a99f,#64e56f)' }
  }
}
