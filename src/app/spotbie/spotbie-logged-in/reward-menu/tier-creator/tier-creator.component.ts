import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {LoyaltyTier} from '../../../../models/loyalty-point-tier';
import {LoyaltyPointsService} from '../../../../services/loyalty-points/loyalty-points.service';
import {BusinessLoyaltyPointsState} from '../../state/business.lp.state';
import {LoyaltyPointBalance} from '../../../../models/loyalty-point-balance';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {UserauthService} from '../../../../services/userauth.service';

@Component({
  selector: 'app-tier-creator',
  templateUrl: './tier-creator.component.html',
  styleUrls: ['./tier-creator.component.css'],
})
export class TierCreatorComponent implements OnInit {
  @ViewChild('businessLoyaltyTierInfo') businessLoyaltyTierInfo;

  @Output() closeTiers: EventEmitter<any> = new EventEmitter<null>(null);

  loyaltyPointBalanceBusiness: LoyaltyPointBalance;
  loyaltyTier = new LoyaltyTier();
  tierDollarValueCalculated = false;
  dollarEntranceValue: number | string = 0;
  tierCreatorFormUp = false;
  updatingTier = false;
  creatingTier = false;
  businessLoyaltyTierForm: UntypedFormGroup;
  businessLoyaltyTierSubmitted = false;
  loading = false;
  existingTiers$ = this.loyaltyPointsService.existingTiers$;

  constructor(
    private loyaltyPointsService: LoyaltyPointsService,
    private businessLoyaltyPointState: BusinessLoyaltyPointsState,
    private formBuilder: UntypedFormBuilder,
    private userAuth: UserauthService
  ) {}

  ngOnInit(): void {
    this.loyaltyPointBalanceBusiness =
      this.businessLoyaltyPointState.getState();
    this.loyaltyPointsService.getExistingTiers().subscribe();
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

  get tierName() {
    return this.businessLoyaltyTierForm.get('tierName').value;
  }
  get tierDescription() {
    return this.businessLoyaltyTierForm.get('tierDescription').value;
  }
  get tierEntranceValue() {
    return this.businessLoyaltyTierForm.get('tierEntranceValue').value;
  }
  get g() {
    return this.businessLoyaltyTierForm.controls;
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

    this.businessLoyaltyTierForm
      .get('tierName')
      .setValue(this.loyaltyTier.name);
    this.businessLoyaltyTierForm
      .get('tierDescription')
      .setValue(this.loyaltyTier.description);
    this.businessLoyaltyTierForm
      .get('tierEntranceValue')
      .setValue(this.loyaltyTier.lp_entrance);

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

  createLoyaltyPointsTier() {
    this.loading = true;
    this.businessLoyaltyTierSubmitted = true;

    if (this.businessLoyaltyTierForm.invalid) {
      this.loading = false;
      return;
    }

    const lpTier = new LoyaltyTier();
    lpTier.name = this.businessLoyaltyTierForm.get('tierName').value;
    lpTier.description =
      this.businessLoyaltyTierForm.get('tierDescription').value;
    lpTier.lp_entrance =
      this.businessLoyaltyTierForm.get('tierEntranceValue').value;

    this.loyaltyPointsService.createTier(lpTier).subscribe(resp => {
      this.createLpTierCB(resp);
    });
  }

  createLpTierCB(resp: any) {
    this.loading = false;
    this.businessLoyaltyTierInfo.nativeElement.innerHTML =
      "Your loyalty tier was created successfully. <i class='fa fa-check sb-text-light-green-gradient'></i>";

    setTimeout(() => {
      location.reload();
    }, 570);
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
    lpTier.description =
      this.businessLoyaltyTierForm.get('tierDescription').value;
    lpTier.lp_entrance =
      this.businessLoyaltyTierForm.get('tierEntranceValue').value;

    this.loyaltyPointsService.updateTier(lpTier).subscribe(resp => {
      this.updateLpTierCB(resp);
    });
  }

  updateLpTierCB(resp: any) {
    this.loading = false;
    this.businessLoyaltyTierInfo.nativeElement.innerHTML =
      "Your loyalty tier was updated successfully. <i class='fa fa-check sb-text-light-green-gradient'></i>";

    setTimeout(() => {
      location.reload();
    }, 570);
  }

  deleteTier() {
    const r = confirm('Are you sure you want to delete this tier?');

    if (!r) {
      return;
    }

    this.loading = true;

    this.loyaltyPointsService
      .deleteTier(this.loyaltyTier.uuid)
      .subscribe(resp => {
        this.loading = false;
        this.businessLoyaltyTierInfo.nativeElement.innerHTML =
          "Your loyalty tier was deleted successfully. <i class='fa fa-check sb-text-light-green-gradient'></i>";

        setTimeout(() => {
          location.reload();
        }, 570);
      });
  }

  calculateTierDollarValue() {
    this.tierDollarValueCalculated = false;

    const tierEntranceValue: number = this.tierEntranceValue;
    const pointPercentage: number =
      this.userAuth.userProfile.loyalty_point_balance
        .loyalty_point_dollar_percent_value;

    if (pointPercentage === 0) {
      this.dollarEntranceValue = 0;
    } else {
      this.dollarEntranceValue = (
        tierEntranceValue *
        (pointPercentage / 100)
      ).toFixed(2);
    }

    this.tierDollarValueCalculated = true;
  }

  bgStyle() {
    return {background: 'linear-gradient(90deg,#35a99f,#64e56f)'};
  }
}
