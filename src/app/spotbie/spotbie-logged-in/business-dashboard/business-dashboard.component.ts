import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {UserauthService} from '../../../services/userauth.service';
import {QrComponent} from '../qr/qr.component';
import {RewardMenuComponent} from '../reward-menu/reward-menu.component';
import {BehaviorSubject} from "rxjs";
import {BusinessMembership} from "../../../models/user";

@Component({
  selector: 'app-business-dashboard',
  templateUrl: './business-dashboard.component.html',
  styleUrls: ['./business-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessDashboardComponent implements OnInit {

  @Output() openBusinessSettingsEvt = new EventEmitter()

  @ViewChild('rewardMenuApp') rewardMenuApp: RewardMenuComponent
  @ViewChild('qrApp') qrApp: QrComponent
  @ViewChild('qrCodeAppAnchor') qrCodeAppAnchor: ElementRef
  @ViewChild('rewardMenuAppAnchor') rewardMenuAppAnchor: ElementRef

  displayBusinessSetUp$ = new BehaviorSubject<boolean>(false);
  businessFetched$ = new BehaviorSubject<boolean>(false);
  canUseCustomerManager$ = new BehaviorSubject<boolean>(false);
  businessResponse$ = new BehaviorSubject<any>(null);

  constructor(private userAuthServe: UserauthService) { }

  ngOnInit(): void {
    this.checkIfBusinessIsSet()
  }

  checkIfBusinessIsSet(){
    this.userAuthServe.getSettings().subscribe(resp => {
        if(!resp.business) {
          this.displayBusinessSetUp$.next(true);
        } else if(resp.is_subscribed === false) {
          this.displayBusinessSetUp$.next(false);
          this.openSettings();
        } else {
          this.displayBusinessSetUp$.next(false);
          this.businessResponse$.next(resp);
          this.getBusinessPermissions();
        }
        this.businessFetched$.next(true);
      });
  }

  getBusinessPermissions() {
    switch (this.businessResponse$.getValue().userSubscriptionPlan) {
      case BusinessMembership.Starter:
        this.canUseCustomerManager$.next(false);
        break;
      case BusinessMembership.Intermediate:
        this.canUseCustomerManager$.next(true);
        break;
      case BusinessMembership.Ultimate:
        this.canUseCustomerManager$.next(true);
        break;
      case BusinessMembership.Legacy:
        this.canUseCustomerManager$.next(true);
        break;
    }
  }

  openSettings(){
    this.openBusinessSettingsEvt.emit();
  }

  openLoyaltyPoints(){
    console.log('BusinessDashboardComponent loyaltyPointsApp')
  }
}
