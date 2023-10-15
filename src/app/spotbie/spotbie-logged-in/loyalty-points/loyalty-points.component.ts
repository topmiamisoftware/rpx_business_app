import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core'
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { AllowedAccountTypes } from 'src/app/helpers/enum/account-type.enum'
import { LoyaltyPointBalance } from 'src/app/models/loyalty-point-balance'
import { LoyaltyPointsService } from 'src/app/services/loyalty-points/loyalty-points.service'
import {LoyaltyTier} from '../../../models/loyalty-point-tier.balance';
import {UserauthService} from '../../../services/userauth.service';

@Component({
  selector: 'app-loyalty-points',
  templateUrl: './loyalty-points.component.html',
  styleUrls: ['./loyalty-points.component.css']
})
export class LoyaltyPointsComponent implements OnInit {

  @Output() closeWindow = new EventEmitter()
  @Output() openRedeemed = new EventEmitter()

  @Input() fullScreenWindow: boolean = true

  @ViewChild('newBalanceLoyaltyPoints') newBalanceLoyaltyPoints
  @ViewChild('businessLoyaltyPointsInfo') businessLoyaltyPointsInfo
  @ViewChild('businessLoyaltyTierInfo') businessLoyaltyTierInfo

  eAllowedAccountTypes = AllowedAccountTypes
  userLoyaltyPoints: number = 0
  loading = false
  userResetBalance: number = 0
  userPointToDollarRatio: number | string = 0;
  businessAccount = false
  businessLoyaltyPointsOpen = false
  personalLoyaltyPointsOpen = false
  businessLoyaltyPointsForm: UntypedFormGroup
  businessLoyaltyPointsFormUp = false
  businessLoyaltyPointsSubmitted = false
  monthlyDollarValueCalculated = false
  tierDollarValueCalculated = false;
  tierPointToDollarRatio: number | string = 0;
  openTiers = false;
  tierCreatorFormUp = false;
  updatingTier = false;
  creatingTier = false;
  businessLoyaltyTierForm: UntypedFormGroup;
  businessLoyaltyTierSubmitted = false;
  helpEnabled = false
  qrCodeLink: string = null
  userHash: string = null
  loyaltyPointReward: number = null
  totalSpent: number = null
  newUserLoyaltyPoints: number
  userType: number = null
  loyaltyPointBalance: any = 0;
  loyaltyPointBalanceBusiness: any = new LoyaltyPointBalance();
  loyaltyTier = new LoyaltyTier();
  existingTiers: Array<LoyaltyTier> = this.loyaltyPointsService.existingTiers;

  constructor(private loyaltyPointsService: LoyaltyPointsService,
              private formBuilder: UntypedFormBuilder,
              private router: Router,
              private userAuth: UserauthService,
              route: ActivatedRoute){
      if(this.router.url.indexOf('scan') > -1) {
         this.qrCodeLink = route.snapshot.params.qrCode
         this.loyaltyPointReward = route.snapshot.params.loyaltyPointReward
         this.totalSpent = route.snapshot.params.totalSpent
         this.userHash = route.snapshot.params.userHash
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

  /* TO-DO: Create a function which shows a business's or personal account' past transactions. */
  fetchLedger(){}

  /* TO-DO: Create a function which shows a business's or personal account' past expenses. */
  fetchExpenses(){}

  loyaltyPointsClass(){
    if( this.userType !== AllowedAccountTypes.Personal)
      return 'sb-loyalty-points cursor-pointer'
    else
      return 'sb-loyalty-points no-cursor'
  }

  initPersonalLoyaltyPoints(){
    this.personalLoyaltyPointsOpen = true
  }

  get businessLoyaltyPoints() {return this.businessLoyaltyPointsForm.get('businessLoyaltyPoints').value }
  get businessCoinPercentage() {return this.businessLoyaltyPointsForm.get('businessCoinPercentage').value }
  get f() { return this.businessLoyaltyPointsForm.controls }


  get tierName() {return this.businessLoyaltyTierForm.get('tierName').value }
  get tierDescription() {return this.businessLoyaltyTierForm.get('tierDescription').value }
  get tierEntranceValue() {return this.businessLoyaltyTierForm.get('tierEntranceValue').value }
  get g() { return this.businessLoyaltyTierForm.controls }

  initBusinessLoyaltyPoints() {
    if(this.userType === AllowedAccountTypes.Personal){
      this.openRedeemed.emit()
      return
    }
    this.businessLoyaltyPointsOpen = true

    const coinValidators = [Validators.required]
    const businessCoinPercentageValidators = [Validators.required]

    this.businessLoyaltyPointsForm = this.formBuilder.group({
      businessLoyaltyPoints: ['', coinValidators],
      businessCoinPercentage: ['', businessCoinPercentageValidators],
    })

    this.businessLoyaltyPointsForm.get('businessLoyaltyPoints').setValue(this.loyaltyPointBalanceBusiness.reset_balance)
    this.businessLoyaltyPointsForm.get('businessCoinPercentage').setValue(this.loyaltyPointBalanceBusiness.loyalty_point_dollar_percent_value)

    this.calculateDollarValue()

    this.businessLoyaltyPointsFormUp = true
    this.loading = false
  }

  initLoyaltyTierList() {
    this.openTiers = true;
  }

  initEditLoyaltyTier() {
    const tierNameValidators = [Validators.required];
    const tierDescriptionValidators = [Validators.required];
    const tierEntranceValueValidators = [Validators.required];

    this.businessLoyaltyTierForm = this.formBuilder.group({
      tierName: ['', tierNameValidators],
      tierDescription: ['', tierDescriptionValidators],
      tierEntranceValue: ['', tierEntranceValueValidators],
    });

    this.businessLoyaltyTierForm.get('tierName').setValue(this.loyaltyTier.name);
    this.businessLoyaltyTierForm.get('tierDescription').setValue(this.loyaltyTier.description);
    this.businessLoyaltyTierForm.get('tierEntranceValue').setValue(this.loyaltyTier.entranceValue);

    this.calculateTierDollarValue();

    this.tierCreatorFormUp = true;
    this.loading = false;
  }

  initNewLoyaltyTier() {
    const tierNameValidators = [Validators.required];
    const tierDescriptionValidators = [Validators.required];
    const tierEntranceValueValidators = [Validators.required];

    this.businessLoyaltyTierForm = this.formBuilder.group({
      tierName: ['', tierNameValidators],
      tierDescription: ['', tierDescriptionValidators],
      tierEntranceValue: ['', tierEntranceValueValidators],
    });

    this.tierCreatorFormUp = true;
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

  createLoyaltyPointsTier(){
    this.loading = true;
    this.businessLoyaltyTierSubmitted = true;

    if(this.businessLoyaltyTierForm.invalid){
      this.loading = false;
      return;
    }

    const lpTier = new LoyaltyTier();
    lpTier.name = this.businessLoyaltyTierForm.get('tierName').value;
    lpTier.description = this.businessLoyaltyTierForm.get('tierDescription').value;
    lpTier.entranceValue = this.businessLoyaltyTierForm.get('tierEntranceValue').value;

    this.loyaltyPointsService.createTier(lpTier).subscribe(resp => {
      this.createLpTierCB(resp)
    });
  }

  createLpTierCB(resp: any){
    this.loading = false
    this.businessLoyaltyTierInfo.nativeElement.innerHTML = 'Your loyalty tier was created successfully. <i class=\'fa fa-check sb-text-light-green-gradient\'></i>'

    setTimeout(() => {
      location.reload()
    }, 570)
  }

  updateLoyaltyPointsTier() {
    this.loading = true;
    this.businessLoyaltyTierSubmitted = true;

    if (this.businessLoyaltyTierForm.invalid) {
      this.loading = false;
      return;
    }

    const lpTier = new LoyaltyTier();
    lpTier.uuid = this.loyaltyTier.uuid;
    lpTier.name = this.businessLoyaltyTierForm.get('tierName').value;
    lpTier.description = this.businessLoyaltyTierForm.get('tierDescription').value;
    lpTier.entranceValue = this.businessLoyaltyTierForm.get('tierEntranceValue').value;

    this.loyaltyPointsService.updateTier(lpTier).subscribe(resp => {
      this.updateLpTierCB(resp);
    });
  }

  updateLpTierCB(resp: any){
    this.loading = false;
    this.businessLoyaltyTierInfo.nativeElement.innerHTML = 'Your loyalty tier was updated successfully. <i class=\'fa fa-check sb-text-light-green-gradient\'></i>';

    setTimeout(() => {
      location.reload()
    }, 570);
  }

  deleteTier(){
    const r = confirm('Are you sure you want to delete this tier?')

    if(!r){
      return;
    }

    this.loading = true;

    this.loyaltyPointsService.deleteTier(this.loyaltyTier.uuid).subscribe((resp) => {
      this.loading = false;
      this.businessLoyaltyTierInfo.nativeElement.innerHTML = 'Your loyalty tier was deleted successfully. <i class=\'fa fa-check sb-text-light-green-gradient\'></i>';

      setTimeout(() => {
        location.reload();
      }, 570);
    });
  }

  calculateTierDollarValue(){
    this.tierDollarValueCalculated = false;

    const monthlyPoints: number = this.tierEntranceValue;
    const pointPercentage: number = this.userAuth.userProfile.loyalty_point_balance.loyalty_point_dollar_percent_value;

    if(pointPercentage === 0) {
      this.tierPointToDollarRatio = 0;
    } else {
      this.tierPointToDollarRatio = (monthlyPoints * (pointPercentage / 100)).toFixed(2);
    }

    this.tierDollarValueCalculated = true;
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

  manageLoyaltyTiers(){
    this.openTiers = true;

    if(this.existingTiers.length > 0){
      this.initLoyaltyTierList();
    }
  }

  ngOnInit(): void {
    this.userType = parseInt(localStorage.getItem('spotbie_userType'), 10)

    if(this.userType === AllowedAccountTypes.Personal){
      this.loyaltyPointsService.userLoyaltyPoints$.subscribe(loyaltyPointBalance => {
        this.loyaltyPointBalance = loyaltyPointBalance;
      });
    } else {
      this.loyaltyPointsService.userLoyaltyPoints$.subscribe(loyaltyPointBalance => {
        this.loyaltyPointBalanceBusiness = loyaltyPointBalance;
      });

     //this.loyaltyPointsService.getExistingTiers().subscribe();
    }

    this.loading = false;
    this.getLoyaltyPointBalance();
  }

  newTier() {
    this.loyaltyTier = null;
    this.updatingTier = false;
    this.creatingTier = true;
    this.initNewLoyaltyTier();
  }

  editTier(tier: LoyaltyTier) {
    this.loyaltyTier = tier;
    this.updatingTier = true;
    this.creatingTier = false;
    this.initEditLoyaltyTier();
  }

  closeTiers() {
    this.tierCreatorFormUp = false;
    this.businessLoyaltyTierForm = null;
    this.businessLoyaltyTierSubmitted = false;
    this.loyaltyTier = null;
    this.openTiers = false;
    this.updatingTier = false;
    this.creatingTier = false;
  }

  bgStyle() {
    return { background: 'linear-gradient(90deg,#35a99f,#64e56f)' }
  }
}
