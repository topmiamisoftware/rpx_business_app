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
import {BehaviorSubject} from "rxjs";
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-tier-creator',
  templateUrl: './tier-creator.component.html',
  styleUrls: ['./tier-creator.component.css'],
})
export class TierCreatorComponent implements OnInit {
  @ViewChild('businessLoyaltyTierInfo') businessLoyaltyTierInfo;
  @ViewChild('tierCreator') tierCreator;

  @Output() closeTiers: EventEmitter<any> = new EventEmitter<null>(null);

  loyaltyPointBalanceBusiness: LoyaltyPointBalance;
  loyaltyTier = new LoyaltyTier();
  tierDollarValueCalculated = false;
  dollarEntranceValue: number | string = 0;
  tierCreatorFormUp$ = new BehaviorSubject<boolean>( false);
  updatingTier$ = new BehaviorSubject<boolean>(false);
  creatingTier$ = new BehaviorSubject<boolean>(false);
  businessLoyaltyTierForm: UntypedFormGroup;
  businessLoyaltyTierSubmitted = false;
  loading$ = new BehaviorSubject(false);
  existingTiers$ = this.loyaltyPointsService.existingTiers$;

  constructor(
    private loyaltyPointsService: LoyaltyPointsService,
    private businessLoyaltyPointState: BusinessLoyaltyPointsState,
    private formBuilder: UntypedFormBuilder,
    private userAuth: UserauthService,
    private platform: Platform
  ) {}

  ngOnInit(): void {
    this.loyaltyPointBalanceBusiness =
      this.businessLoyaltyPointState.getState();
    this.loyaltyPointsService.getExistingTiers().subscribe();

    this.platform.backButton.subscribeWithPriority(10, () => {
      this.closeTiers.emit(null);
    });
  }

  newTier() {
    this.loyaltyTier = null;
    this.updatingTier$.next(false);
    this.creatingTier$.next(true);
    this.initNewLoyaltyTier();
  }

  editTier(tier: LoyaltyTier) {
    this.loyaltyTier = tier;
    this.updatingTier$.next(true);
    this.creatingTier$.next(false);
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

    this.tierCreatorFormUp$.next(true);
    this.loading$.next(false);
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

    this.tierCreatorFormUp$.next( true);
    this.loading$.next( false);
  }

  closeTierCreator() {
    this.tierCreatorFormUp$.next( false);
    this.creatingTier$.next( false);
    this.updatingTier$.next(false);
  }

  createLoyaltyPointsTier() {
    this.loading$.next( true);
    this.businessLoyaltyTierSubmitted = true;

    if (this.businessLoyaltyTierForm.invalid) {
      this.loading$.next( false);
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
    this.loading$.next( false);
    this.businessLoyaltyTierInfo.nativeElement.innerHTML =
      "Your loyalty tier was created successfully. <i class='fa fa-check sb-text-light-green-gradient'></i>";

    this.closeTierCreator();
    this.loyaltyPointsService.getExistingTiers().subscribe();
  }

  updateLoyaltyPointsTier() {
    this.loading$.next(true);
    this.businessLoyaltyTierSubmitted = true;

    if (this.businessLoyaltyTierForm.invalid) {
      this.loading$.next(false);
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
    this.loading$.next( false);
    this.tierCreator.nativeElement.scrollTo(0, 0);
    this.businessLoyaltyTierInfo.nativeElement.innerHTML =
      "Your loyalty tier was updated successfully. <i class='fa fa-check sb-text-light-green-gradient'></i>";

    this.closeTierCreator();
    this.loyaltyPointsService.getExistingTiers().subscribe();
  }

  deleteTier() {
    const r = confirm('Are you sure you want to delete this tier?');

    if (!r) {
      return;
    }

    this.loading$.next(true);

    this.loyaltyPointsService
      .deleteTier(this.loyaltyTier.uuid)
      .subscribe(resp => {
        this.loading$.next(false);
        this.businessLoyaltyTierInfo.nativeElement.innerHTML =
          "Your loyalty tier was deleted successfully. <i class='fa fa-check sb-text-light-green-gradient'></i>";

        this.loyaltyPointsService.getExistingTiers().subscribe();
        this.closeTierCreator();
      });
  }

  calculateTierDollarValue() {
    this.tierDollarValueCalculated = false;
    this.dollarEntranceValue = this.tierEntranceValue;
    this.tierDollarValueCalculated = true;
  }

  protected readonly close = close;
}
