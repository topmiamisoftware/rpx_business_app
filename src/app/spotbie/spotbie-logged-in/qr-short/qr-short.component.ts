import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal
} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {LoyaltyPointsService} from '../../../services/loyalty-points/loyalty-points.service';
import {BehaviorSubject, take} from "rxjs";
import {BusinessLoyaltyPointsState} from "../state/business.lp.state";
import {UserForBusiness} from "../user-set-up/user-set-up.component";
import {filter} from "rxjs/operators";
import {Redeemable} from "../../../models/redeemable";
import {Business} from "../../../models/business";

@Component({
  selector: 'app-qr-short',
  templateUrl: './qr-short.component.html',
  styleUrls: [
    './qr-short.component.css',
    '../reward-menu/reward-menu.component.css'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QrShortComponent implements OnInit {

  @Input() set user(val: UserForBusiness) {
    this.user$.next(val);
  }

  @Input() set forBusiness(business: Business) {
    if (business) {
      this.forBusiness$.next(business);
      console.log('FOR BUSIENSS', this.forBusiness$.getValue());
      this.changeDetectorRef.detectChanges();
    }
  }

  @Input() set day(value: string) {
    if (value) {
      this.day$.set(value);
    }
  }

  @Input() set timeRange1(value: string) {
    if (value) {
      this.timeRange1$.set(value);
    }
  }

  @Input() set timeRange2(value: string) {
    if (value) {
      this.timeRange2$.set(value);
    }
  }

  @Input() set timeRange3(value: string) {
    if (value) {
      this.timeRange3$.set(value);
    }
  }

  day$ = signal<string>(null);
  timeRange1$ = signal<string>(null);
  timeRange2$ = signal<string>(null);
  timeRange3$ = signal<string>(null);

  @Output() lpRedeemed = new EventEmitter<unknown>()

  user$ = new BehaviorSubject<UserForBusiness>(null);

  businessLoyaltyPointsForm: UntypedFormGroup
  businessLoyaltyPointsFormUp$ = new BehaviorSubject<boolean>(false);
  businessLoyaltyPointsSubmitted$ = new BehaviorSubject<boolean>(false);
  forBusiness$ = new BehaviorSubject<Business>(null);
  redeemableItem$ = new BehaviorSubject<{ loyalty_points: number, redeemable: Redeemable, success: boolean }>(null);

  constructor(private loyaltyPointsService: LoyaltyPointsService,
              private formBuilder: UntypedFormBuilder,
              private changeDetectorRef: ChangeDetectorRef,
              private businessLoyaltyPointsState: BusinessLoyaltyPointsState) {
  }

  async ngOnInit() {
    const totalSpentValidators = [Validators.required];

    this.businessLoyaltyPointsForm = this.formBuilder.group({
      totalSpent: ['', totalSpentValidators]
    });

    this.businessLoyaltyPointsFormUp$.next(true);
  }

  addLp() {
    const c = confirm(`Are you sure you want to award ${this.user$.getValue().spotbie_user.first_name} with ${this.totalSpent} Loyalty Points?`);

    if(!c) {
      return;
    }

    this.user$.pipe(
      filter((u) => !!u),
      take(1),
    ).subscribe((u) => {
        const addLpObj = {
          user_id: u.spotbie_user.id,
          dollars_spent: this.totalSpent,
        };

        this.loyaltyPointsService
          .addLoyaltyPoints(addLpObj)
          .subscribe((resp: {loyalty_points: number, redeemable: Redeemable, success: boolean}) => {
            setTimeout(() => {
              this.redeemableItem$.next(null);
            }, 2000);
            this.businessLoyaltyPointsForm.reset();
            this.businessLoyaltyPointsForm.setErrors(null);
            this.redeemableItem$.next(resp);
            this.lpRedeemed.emit(null);
          });
    });
  }


  get totalSpent() { return this.businessLoyaltyPointsForm.get('totalSpent').value }
  get f() { return this.businessLoyaltyPointsForm.controls }
}
