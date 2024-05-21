import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import { LoyaltyPointsService } from '../../../services/loyalty-points/loyalty-points.service';
import {BehaviorSubject, take} from "rxjs";
import {BusinessLoyaltyPointsState} from "../state/business.lp.state";
import {UserForBusiness} from "../user-set-up/user-set-up.component";
import {filter} from "rxjs/operators";
import {Redeemable} from "../../../models/redeemable";

@Component({
  selector: 'app-qr-short',
  templateUrl: './qr-short.component.html',
  styleUrls: [
    './qr-short.component.css',
    '../reward-menu/reward-menu.component.css'
  ]
})
export class QrShortComponent implements OnInit {

  @Input() set user (val: UserForBusiness) {
    this.user$.next(val);
  }

  @Output() lpRedeemed = new EventEmitter<unknown>()

  user$ = new BehaviorSubject<UserForBusiness>(null);

  businessLoyaltyPointsForm: UntypedFormGroup
  businessLoyaltyPointsFormUp$ = new BehaviorSubject<boolean>(false);
  businessLoyaltyPointsSubmitted$ = new BehaviorSubject<boolean>(false);
  redeemableItem$ = new BehaviorSubject<{loyalty_points: number, redeemable: Redeemable, success: boolean}>(null);

  constructor(private loyaltyPointsService: LoyaltyPointsService,
              private formBuilder: UntypedFormBuilder,
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
